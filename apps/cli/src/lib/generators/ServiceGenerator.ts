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
import { Maybe, Nothing, Just } from "purify-ts";
import {
  getMultipartConversion,
  getStatusCode,
  getTypeNameFromRef,
  getTypeNameFromSchema,
} from "./Common";
import { render } from "../renderers/Renderer";
import { escapeReservedWordParamName } from "../models/JavaScriptReservedWords";

export type RequestContractType = {
  contractParameterName: string;
  formattedParam: string;
  paramType: string;
};

export const getRequestContractType = (
  endpointDescription: EndpointDescription,
): Maybe<RequestContractType> | typeof Nothing => {
  const getContractType = (
    op: Operation,
    contentType:
      | "application/json"
      | "multipart/form-data" = "application/json",
  ) => {
    const schema = op.requestBody.content[contentType]!.schema;
    const isRequestParamArray = schema.type === "array" && !!schema.items;
    const ref = isRequestParamArray
      ? (schema.items as Schema).$ref
      : (schema.$ref ?? schema.allOf?.[0]?.$ref);

    if (schema.type === "string" || schema.type === "number") {
      return Just({
        contractParameterName: "body",
        paramType: schema.type,
        formattedParam: `body: ${schema.type}`,
      });
    }

    return Maybe.fromNullable(ref)
      .chain(e => Just(getTypeNameFromRef(e)))
      .chain(v =>
        Just({
          contractParameterName: "requestContract",
          paramType: `${v}${isRequestParamArray ? "[]" : ""}`,
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

  if (
    methodType === "POST" &&
    !!post &&
    post.requestBody?.content["multipart/form-data"]
  ) {
    return getContractType(post, "multipart/form-data");
  }

  const put = endpointDescription.pathObject.put;
  if (
    methodType === "PUT" &&
    !!put &&
    put.requestBody?.content["application/json"]
  ) {
    return getContractType(put);
  }

  if (
    methodType === "PUT" &&
    !!put &&
    put.requestBody?.content["multipart/form-data"]
  ) {
    return getContractType(put, "multipart/form-data");
  }

  const patch = endpointDescription.pathObject.patch;
  if (
    methodType === "PATCH" &&
    !!patch &&
    patch.requestBody?.content["application/json"]
  ) {
    return getContractType(patch);
  }
  if (
    methodType === "PATCH" &&
    !!patch &&
    patch.requestBody?.content["multipart/form-data"]
  ) {
    return getContractType(patch, "multipart/form-data");
  }

  return Nothing;
};

const getContractResult = (
  endpointDescription: EndpointDescription,
  swagger: SwaggerSchema,
): Maybe<string> | typeof Nothing => {
  const getSchemas = (operation: Operation) =>
    Object.entries(operation.responses).map(e => ({
      status: e[0],
      schema:
        e[1]?.content?.["application/json"]?.schema ??
        e[1]?.content?.["multipart/form-data"]?.schema ??
        null,
    }));

  const getTypeName = (schema: Schema, isArray: boolean) => {
    if (schema.oneOf) {
      const typeNames = schema.oneOf
        .map(s => getTypeNameFromSchema(s, swagger))
        .join(" | ");
      return isArray ? `(${typeNames})[]` : typeNames;
    }

    const typeName = getTypeNameFromSchema(schema, swagger);
    return isArray ? `${typeName}[]` : typeName;
  };

  const getTypeFromOperation = (schemas: ReturnType<typeof getSchemas>) => {
    const type = schemas
      .map(({ schema, status }) => {
        const statusCode = getStatusCode(
          status,
          endpointDescription.methodType,
        );

        if (!schema) {
          return `FetchResponse<void, ${statusCode}>`;
        }

        const isFileSchema = schema.format === "binary";

        if (schema.type === "array") {
          const typeName = Maybe.fromNullable(schema.items)
            .chain(e => (e instanceof Array ? Just(e[0]) : Just(e)))
            .chain(e =>
              Just(isFileSchema ? "FileResponse" : getTypeName(e!, true)),
            )
            .orDefault("");
          return `FetchResponse<${typeName}, ${statusCode}>`;
        }
        return `FetchResponse<${
          isFileSchema ? "FileResponse" : getTypeName(schema, false)
        }, ${statusCode}>`;
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
      case "string":
        return `string${nullability}`;
      case "object":
        return `{}${nullability}`;
      case "array": {
        const arrayTypeSchema = Maybe.fromNullable(schema.items)
          .chain(e => (e instanceof Array ? Just(e[0]) : Just(e)))
          .chain(e =>
            Just(
              e!.$ref ? getTypeNameFromRef(e!.$ref) : getType(parameter, e!),
            ),
          )
          .orDefault("");
        return `${arrayTypeSchema}[]${nullability}`;
      }
      default: {
        const oneOf = (schema as any).oneOf as Schema[];

        if (!!oneOf) {
          const types = oneOf
            .filter(e => !!e.$ref)
            .map(e => getTypeNameFromRef(e.$ref!))
            .join(" | ");

          return `${types}${nullability}`;
        }

        const ref = schema.$ref ?? schema.allOf?.[0]?.$ref;

        return `${
          schema.type ||
          (!Array.isArray(schema.allOf) && schema.allOf) ||
          (ref && getTypeNameFromRef(ref))
        }${nullability}`;
      }
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

  const parameters = (getParameters() ?? [])
    .map((e, index) => {
      const param = {
        name: e.name,
        type: getType(e, (e as any).schema),
        required: !!e.required,
        xPosition: e["x-position"] ?? index, // Ensures undefined x-positions are treated as very large numbers
      };

      return param;
    })
    .sort((a, b) => {
      // First sort by required status (required first)
      if (a.required && !b.required) {
        return -1;
      }
      if (!a.required && b.required) {
        return 1;
      }
      // Then sort by x-position
      return a.xPosition - b.xPosition;
    });

  const formatParamName = (name: string) =>
    escapeReservedWordParamName(
      name
        .split(".")
        .join("")
        .replace(/\[(.*?)\]/g, (_match, innerMatch) =>
          innerMatch
            .split("")
            .map((char: string, i: number) =>
              i === 0 ? char.toUpperCase() : char.toLowerCase(),
            )
            .join(""),
        )
        .trim(),
    );

  const formatAsArgument = (parameter: {
    name: string;
    type: string;
    required: boolean;
  }) =>
    `${formatParamName(parameter.name)}${parameter.required ? "" : "?"}: ${parameter.type}`;

  const formattedFunctionParameters = parameters
    .map(e => formatAsArgument(e))
    .join(", ");

  const parametrizedUrl = parameters.reduce(
    ({ url, usedParameters, usedFormattedParameters }, e) => {
      const name = escapeReservedWordParamName(e.name);
      const matchedName = `\{${name}\}`;
      const match = `\{${e.name}\}`;
      const index = url.indexOf(match);

      return index > -1
        ? {
          url: url.replace(match, `\$${matchedName}`),
            usedParameters: [...usedParameters, ...[name]],
            usedFormattedParameters: [
              ...usedFormattedParameters,
              ...[formatAsArgument(e)],
            ],
          }
        : { url, usedParameters, usedFormattedParameters };
    },
    {
      url: endpointDescription.originalPath,
      usedParameters: new Array<string>(),
      usedFormattedParameters: new Array<string>(),
    },
  );

  const unusedParameters = parameters
    .filter(
      e =>
        !parametrizedUrl.usedParameters.some(
          x => x === escapeReservedWordParamName(e.name),
        ),
    )
    .map(e => `"${e.name}": ${formatParamName(e.name)}`);
  
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
      ? render("const queryParams = {\n{{{rows}}}\n    }\n    ", {
          rows: unusedParameters.map(e => `      ${e}`).join(",\n"),
        })
      : "";

  const name = endpointDescription.name;
  const pathName = `${name}Path`;
  const formattedUsedParameters = parametrizedUrl.usedParameters.join(", ");

  const formattedPathFunctionParameters =
    parametrizedUrl.usedFormattedParameters.join(", ");

  const url = `\`\$\{getApiUrl()\}$\{${pathName}(${formattedUsedParameters})\}\``;

  const parameters = [
    url,
    "headers",
    ...[unusedParameters.length > 0 ? "queryParams" : "{}"],
  ].join(", ");

  const paramSeparator = formattedFunctionParameters.length > 0 ? ", " : "";

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
    pathName,
    pathValue: `\`${parametrizedUrl.url}\``,
    formattedFunctionParameters,
    formattedUsedParameters,
    formattedPathFunctionParameters,
  };

  return render(
    [
      "export type {{contractResultName}} = \n| {{{contractResult}}};\n",
      "export const {{pathName}} = ({{{formattedPathFunctionParameters}}}) => {{{pathValue}}};\n",
      `export const {{name}} = ({{{formattedParam}}}):
  Promise<{{contractResultName}}> => {
    {{{queryParams}}}return api{{method}}({{{parameters}}}) as Promise<{{contractResultName}}>;
}\n`,
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
  paramType: string,
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

  const { parametrizedUrl, formattedFunctionParameters, unusedParameters } =
    parametrizeUrl(endpointDescription);
  const paramSeparator = formattedFunctionParameters.length > 0 ? ", " : "";

  const comma = formattedRequestContractType.length > 0 ? ", " : "";
  const method = getMethodType();

  const queryParams =
    unusedParameters.length > 0
      ? render("const queryParams = {\n{{{rows}}}\n    };\n    ", {
          rows: unusedParameters.map(e => `      ${e}`).join(",\n"),
        })
      : "";

  const queryParameters = unusedParameters.length > 0 ? `, queryParams` : "";

  const name = endpointDescription.name;

  const contractResultName = getContractResultName(name);

  const pathName = `${name}Path`;

  const multipartConversion = getMultipartConversion(
    endpointDescription,
    formattedRequestContractType,
    paramType,
    contractParameterName,
  );

  const view = {
    name: name,
    contractParameterName: "requestData",
    contractResult,
    contractResultName,
    pathName,
    pathValue: `\`${parametrizedUrl.url}\``,
    url: `\`\$\{getApiUrl()\}$\{${pathName}(${parametrizedUrl.usedParameters.join(", ")})\}\``,
    formattedParam: `${formattedRequestContractType}${comma}${formattedFunctionParameters}${paramSeparator}headers = new Headers()`,
    method,
    queryParams,
    queryParameters,
    formattedFunctionParameters,
    multipartConversion,
  };

  return render(
    [
      "export type {{contractResultName}} = \n| {{{contractResult}}};\n",
      "export const {{pathName}} = ({{{formattedFunctionParameters}}}) => {{{pathValue}}};\n",
      `export const {{name}} = ({{{formattedParam}}}):
  Promise<{{contractResultName}}> => {
    {{{queryParams}}}{{{multipartConversion}}}
    return api{{method}}({{{url}}}, {{contractParameterName}}, headers{{queryParameters}}) as Promise<{{contractResultName}}>;\n}\n`,
    ].join("\n"),

    view,
  );
};

export const generateServices = (
  swagger: SwaggerSchema,
  prefixesToRemove: string[],
) => {
  const endpoints = getEndpointsDescriptions(swagger, prefixesToRemove);
  const view = endpoints
    .map(endpointDescription => {
      const {
        formattedParam: formattedRequestContractType,
        contractParameterName,
        paramType,
      } = getRequestContractType(
        endpointDescription,
      ).orDefault<RequestContractType>({
        paramType: "",
        formattedParam: "",
        contractParameterName: "{}",
      });

      const contractResult = getContractResult(
        endpointDescription,
        swagger,
      ).orDefault("any");

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
          paramType,
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

  return view;
};
function getContractResultName(name: string) {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}FetchResponse`;
}
