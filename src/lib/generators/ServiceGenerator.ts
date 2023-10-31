import {
  SwaggerSchema,
  Operation,
  Schema,
  Parameter,
} from "../models/SwaggerSchema";
import {
  getEndpointsDescriptions,
  EndpointDescription,
  MethodType,
} from "./ApiDescriptionGenerator";
import { render } from "mustache";
import { Maybe, Nothing, Just } from "purify-ts";
import { getTypeNameFromRef, getTypeNameFromSchema } from "./Common";

export const getRequestContractType = (
  endpointDescription: EndpointDescription,
): Maybe<{ contractParameterName: string; formattedParam: string }> => {
  const getContractType = (op: Operation) => {
    const schema = op.requestBody.content["application/json"].schema;
    const isRequestParamArray = schema.type === "array" && !!schema.items;
    const refName = isRequestParamArray
      ? (schema.items as Schema).$ref
      : schema.$ref;

    return Maybe.fromNullable(refName)
      .chain(e => Just(getTypeNameFromRef(e)))
      .chain(v =>
        Just({
          contractParameterName: "requestContract",
          formattedParam: `requestContract: ${v}${
            isRequestParamArray ? "[]" : ""
          }`,
        }),
      );
  };

  const post = endpointDescription.pathObject.post;
  const methodType = endpointDescription.methodType;

  if (
    methodType === "POST" &&
    !!post &&
    post.requestBody?.content["application/json"]
  ) {
    return getContractType(post);
  }

  const put = endpointDescription.pathObject.put;
  if (
    methodType === "PUT" &&
    !!put &&
    put.requestBody?.content["application/json"]
  ) {
    return getContractType(put);
  }

  const patch = endpointDescription.pathObject.patch;
  if (
    methodType === "PATCH" &&
    !!patch &&
    patch.requestBody?.content["application/json"]
  ) {
    return getContractType(patch);
  }

  return Nothing;
};

const getContractResult = (
  endpointDescription: EndpointDescription,
): Maybe<string> => {
  const getSchemas = (operation: Operation) =>
    Object.entries(operation.responses).map(e => ({
      status: e[0],
      schema: e[1]?.content?.["application/json"]?.schema ?? null,
    }));

  const getTypeName = (schema: Schema, isArray: boolean) => {
    if (schema.oneOf) {
      const typeNames = schema.oneOf
        .map(s => getTypeNameFromSchema(s))
        .join(" | ");
      return isArray ? `(${typeNames})[]` : typeNames;
    }

    const typeName = getTypeNameFromSchema(schema);
    return isArray ? `${typeName}[]` : typeName;
  };

  const getTypeFromOperation = (schemas: ReturnType<typeof getSchemas>) => {
    const type = schemas
      .map(({ schema, status }) => {
        if (!schema) {
          return `FetchResponse<void, ${status}>`;
        }

        const isFileSchema = schema.format === "binary";

        if (schema.type === "array") {
          const typeName = Maybe.fromNullable(schema.items)
            .chain(e => (e instanceof Array ? Just(e[0]) : Just(e)))
            .chain(e =>
              Just(isFileSchema ? "FileResponse" : getTypeName(e, true)),
            )
            .orDefault("");
          return `FetchResponse<${typeName}, ${status}>`;
        }
        return `FetchResponse<${
          isFileSchema ? "FileResponse" : getTypeName(schema, false)
        }, ${status}>`;
      })
      .join(" \n| ");

    return Just(`${type} \n| ErrorResponse`);
  };

  const post = endpointDescription.pathObject.post;
  if (endpointDescription.methodType === "POST" && post) {
    return getTypeFromOperation(getSchemas(post));
  }

  const get = endpointDescription.pathObject.get;
  if (endpointDescription.methodType === "GET" && get) {
    return getTypeFromOperation(getSchemas(get));
  }

  const put = endpointDescription.pathObject.put;
  if (endpointDescription.methodType === "PUT" && put) {
    return getTypeFromOperation(getSchemas(put));
  }

  const deleteOp = endpointDescription.pathObject.delete;
  if (endpointDescription.methodType === "DELETE" && deleteOp) {
    return getTypeFromOperation(getSchemas(deleteOp));
  }

  const patch = endpointDescription.pathObject.patch;
  if (endpointDescription.methodType === "PATCH" && patch) {
    return getTypeFromOperation(getSchemas(patch));
  }

  return Nothing;
};

export const parametrizeUrl = (endpointDescription: EndpointDescription) => {
  const getType = (parameter: Parameter, schema: Schema): string => {
    const nullability =
      !parameter.required && (schema as { nullable?: boolean }).nullable
        ? " | undefined | null"
        : "";

    switch (schema.type) {
      case "integer":
        return `number${nullability}`;
      case "object":
        return `{}${nullability}`;
      case "array":
        const arrayTypeSchema = Maybe.fromNullable(schema.items)
          .chain(e => (e instanceof Array ? Just(e[0]) : Just(e)))
          .chain(e =>
            Just(e.$ref ? getTypeNameFromRef(e.$ref) : getType(parameter, e)),
          )
          .orDefault("");
        return `${arrayTypeSchema}[]${nullability}`;
      default:
        const oneOf = (schema as any).oneOf as Schema[];

        if (!!oneOf) {
          const types = oneOf
            .filter(e => !!e.$ref)
            .map(e => getTypeNameFromRef(e.$ref!))
            .join(" | ");

          return `${types}${nullability}`;
        }

        return `${
          schema.type ||
          schema.allOf ||
          (schema.$ref && getTypeNameFromRef(schema.$ref))
        }${nullability}`;
    }
  };

  const getParameters = () => {
    switch (endpointDescription.methodType) {
      case "DELETE":
        return endpointDescription.pathObject.delete?.parameters;
      case "GET":
        return endpointDescription.pathObject.get?.parameters;
      case "PATCH":
        return endpointDescription.pathObject.patch?.parameters;
      case "POST":
        return endpointDescription.pathObject.post?.parameters;
      case "PUT":
        return endpointDescription.pathObject.put?.parameters;
      default:
        return [];
    }
  };

  const parameters = (getParameters() ?? []).map(e => {
    const param = {
      name: e.name,
      type: getType(e, (e as any).schema),
      required: !!e.required,
    };
    return param;
  });

  const formattedFunctionParameters = parameters
    .sort((a, b) => (a.required ? -1 : 1))
    .map(
      e => `${e.name.split(".").join("")}${e.required ? "" : "?"}: ${e.type}`,
    )
    .join(", ");

  const parametrizedUrl = parameters.reduce(
    ({ url, usedParameters }, e) => {
      const match = `\{${e.name}\}`;
      var index = url.indexOf(match);
      return index > -1
        ? {
            url: url.replace(match, `\$${match}`),
            usedParameters: [...usedParameters, ...[e.name]],
          }
        : { url, usedParameters };
    },
    {
      url: endpointDescription.originalPath,
      usedParameters: new Array<string>(),
    },
  );
  const unusedParameters = parameters
    .filter(e => !parametrizedUrl.usedParameters.some(x => x === e.name))
    .map(e => `"${e.name}": ${e.name.split(".").join("")}`);

  return { parametrizedUrl, formattedFunctionParameters, unusedParameters };
};

const parametrizedMethod = (
  endpointDescription: EndpointDescription,
  contractParameterName: string,
  contractResult: string,
) => {
  const { unusedParameters, parametrizedUrl, formattedFunctionParameters } =
    parametrizeUrl(endpointDescription);
  const method =
    endpointDescription.methodType.charAt(0) +
    endpointDescription.methodType.substring(1).toLowerCase();

  const queryParams =
    unusedParameters.length > 0
      ? render("const queryParams = {\n\t\t{{{rows}}}\n\t}\n\t", {
          rows: unusedParameters.join("\t\t,\n"),
        })
      : "";

  const parameters = [
    `\`\$\{API_URL\}${parametrizedUrl.url}\``,
    "headers",
    ...[unusedParameters.length > 0 ? "queryParams" : "{}"],
  ].join(", ");

  const paramSeparator = formattedFunctionParameters.length > 0 ? ", " : "";

  const name = endpointDescription.name;
  const contractResultName = getContractResultName(name);

  const view = {
    name: name,
    contractParameterName,
    contractResult,
    contractResultName,
    parameters,
    queryParams,
    formattedParam: `${formattedFunctionParameters}${paramSeparator}headers = new Headers()`,
    method,
  };

  return render(
    [
      "export type {{contractResultName}} = \n| {{{contractResult}}};\n",
      "export const {{name}} = ({{{formattedParam}}}): \n\tPromise<{{contractResultName}}> => {\n\t{{{queryParams}}}return api{{method}}({{{parameters}}}) as Promise<{{contractResultName}}>;\n}\n",
    ].join("\n"),
    view,
  );
};

const bodyBasedMethod = (
  endpointDescription: EndpointDescription,
  formattedRequestContractType: string,
  contractParameterName: string,
  contractResult: string,
  methodType: MethodType,
) => {
  const getMethodType = () => {
    switch (methodType) {
      case "PUT":
        return "Put";
      case "PATCH":
        return "Patch";
      default:
        return "Post";
    }
  };

  const { parametrizedUrl, formattedFunctionParameters } =
    parametrizeUrl(endpointDescription);
  const paramSeparator = formattedFunctionParameters.length > 0 ? ", " : "";
  const comma = formattedRequestContractType.length > 0 ? ", " : "";
  const method = getMethodType();

  const name = endpointDescription.name;

  const contractResultName = getContractResultName(name);

  const view = {
    name: name,
    contractParameterName,
    contractResult,
    contractResultName,
    url: `\`\$\{API_URL\}${parametrizedUrl.url}\``,
    formattedParam: `${formattedRequestContractType}${comma}${formattedFunctionParameters}${paramSeparator}headers = new Headers()`,
    method,
  };

  return render(
    [
      "export type {{contractResultName}} = \n| {{{contractResult}}};\n",
      "export const {{name}} = ({{{formattedParam}}}): \n\tPromise<{{contractResultName}}> => \n\tapi{{method}}({{{url}}}, {{contractParameterName}}, headers) as Promise<{{contractResultName}}>;\n",
    ].join("\n"),

    view,
  );
};

export const generateServices = (swagger: SwaggerSchema) => {
  const endpoints = getEndpointsDescriptions(swagger);
  const view = endpoints
    .map(endpointDescription => {
      const {
        formattedParam: formattedRequestContractType,
        contractParameterName,
      } = getRequestContractType(endpointDescription).orDefault({
        formattedParam: "",
        contractParameterName: "{}",
      });

      const contractResult =
        getContractResult(endpointDescription).orDefault("any");

      if (
        endpointDescription.methodType === "POST" ||
        endpointDescription.methodType === "PUT" ||
        endpointDescription.methodType === "PATCH"
      ) {
        return bodyBasedMethod(
          endpointDescription,
          formattedRequestContractType,
          contractParameterName,
          contractResult,
          endpointDescription.methodType,
        );
      }
      if (
        endpointDescription.methodType === "GET" ||
        endpointDescription.methodType === "DELETE"
      ) {
        return parametrizedMethod(
          endpointDescription,
          contractParameterName,
          contractResult,
        );
      }

      return `// ${endpointDescription.name}\n`;
    })
    .join("\n");

  const API = render(`export const API = { \n\t{{{ rows }}}\n}\n`, {
    rows: endpoints.map(e => e.name).join(",\n\t"),
  });

  return `${view}\n${API}`;
};
function getContractResultName(name: string) {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}FetchResponse`;
}
