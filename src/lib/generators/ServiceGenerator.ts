import { SwaggerSchema, Operation, Schema } from "../models/SwaggerSchema";
import {
  getEndpointsDescriptions,
  EndpointDescription,
  MethodType,
} from "./ApiDescriptionGenerator";
import { render } from "mustache";
import { Maybe, Nothing, Just } from "purify-ts";
import { getTypeNameFromRef } from "./Common";

const getRequestContractType = (
  endpointDescription: EndpointDescription
): Maybe<{ contractParameterName: string; formattedParam: string }> => {
  const getContractType = (op: Operation) => {
    const schema = op.requestBody.content["application/json"].schema;
    return Maybe.fromNullable(schema.$ref)
      .chain((e) => Just(getTypeNameFromRef(e)))
      .chain((v) =>
        Just({
          contractParameterName: "requestContract",
          formattedParam: `requestContract: ${v}`,
        })
      );
  };

  const post = endpointDescription.pathObject.post;
  if (post && post.requestBody?.content["application/json"]) {
    return getContractType(post);
  }
  const put = endpointDescription.pathObject.put;
  if (put && put.requestBody?.content["application/json"]) {
    return getContractType(put);
  }
  return Nothing;
};

const getContractResult = (
  endpointDescription: EndpointDescription
): Maybe<string> => {
  const getTypeFromOperation = (operation: Operation) => {
    const schema =
      operation.responses["200"].content["application/json"].schema;
    if (schema.type === "array") {
      const typeName = Maybe.fromNullable(schema.items)
        .chain((e) => (e instanceof Array ? Just(e[0]) : Just(e)))
        .chain((e) => (e.$ref ? Just(e.$ref) : Nothing))
        .chain((e) => Just(getTypeNameFromRef(e)))
        .orDefault("");
      return Just(`${typeName}[]`);
    }
    return Maybe.fromNullable(schema.$ref).chain((e) =>
      Just(getTypeNameFromRef(e))
    );
  };
  const post = endpointDescription.pathObject.post;
  if (post && post.responses["200"]?.content?.["application/json"]) {
    return getTypeFromOperation(post);
  }

  const get = endpointDescription.pathObject.get;
  if (get && get.responses["200"]?.content?.["application/json"]) {
    return getTypeFromOperation(get);
  }

  const put = endpointDescription.pathObject.put;
  if (put && put.responses["200"]?.content?.["application/json"]) {
    return getTypeFromOperation(put);
  }

  const deleteOp = endpointDescription.pathObject.delete;
  if (deleteOp && deleteOp.responses["200"]?.content?.["application/json"]) {
    return getTypeFromOperation(deleteOp);
  }

  return Nothing;
};

const parametrizeUrl = (endpointDescription: EndpointDescription) => {
  const getType = (schema: Schema): string => {
    switch (schema.type) {
      case "integer":
        return "number";
      case "object":
        return "{}";
      case "array":
        const arrayTypeSchema = Maybe.fromNullable(schema.items)
          .chain((e) => (e instanceof Array ? Just(e[0]) : Just(e)))
          .chain((e) => Just(e.$ref ? getTypeNameFromRef(e.$ref) : getType(e)))
          .orDefault("");
        return `${arrayTypeSchema}[]`;
      default:
        return (schema.type || schema.allOf) as string;
    }
  };
  const pathObject = endpointDescription.pathObject;
  const parameters = (
    pathObject.get?.parameters ||
    pathObject.post?.parameters ||
    pathObject.put?.parameters ||
    pathObject.delete?.parameters ||
    []
  ).map((e) => {
    const param = {
      name: e.name,
      type: getType((e as any).schema),
    };
    return param;
  });

  const formattedFunctionParameters = parameters
    .map((e) => `${e.name}: ${e.type}`)
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
    }
  );
  const unusedParameters = parameters
    .filter((e) => !parametrizedUrl.usedParameters.some((x) => x === e.name))
    .map((e) => e.name);

  return { parametrizedUrl, formattedFunctionParameters, unusedParameters };
};

const parametrizedMethod = (
  endpointDescription: EndpointDescription,
  contractParameterName: string,
  contractResult: string
) => {
  const {
    unusedParameters,
    parametrizedUrl,
    formattedFunctionParameters,
  } = parametrizeUrl(endpointDescription);
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

  const view = {
    name: endpointDescription.name,
    contractParameterName,
    contractResult,
    parameters,
    queryParams,
    formattedParam: `${formattedFunctionParameters}${paramSeparator}headers = new Headers()`,
    method,
  };

  return render(
    "export const {{name}} = ({{{formattedParam}}}): \n\tPromise<FetchResponse<{{contractResult}}>> => {\n\t{{{queryParams}}}return api{{method}}({{{parameters}}});\n}\n",
    view
  );
};

const POST = (
  endpointDescription: EndpointDescription,
  formattedRequestContractType: string,
  contractParameterName: string,
  contractResult: string
) => {
  const { parametrizedUrl, formattedFunctionParameters } = parametrizeUrl(
    endpointDescription
  );
  const paramSeparator = formattedFunctionParameters.length > 0 ? ", " : "";
  const comma = formattedRequestContractType.length > 0 ? ", " : "";

  const view = {
    name: endpointDescription.name,
    contractParameterName,
    contractResult,
    url: `\`\$\{API_URL\}${parametrizedUrl.url}\``,
    formattedParam: `${formattedRequestContractType}${comma}${formattedFunctionParameters}${paramSeparator}headers = new Headers()`,
  };

  return render(
    "export const {{name}} = ({{{formattedParam}}}): \n\tPromise<FetchResponse<{{contractResult}}>> => \n\tapiPost({{{url}}}, {{contractParameterName}}, headers);\n",
    view
  );
};

const PUT = (
  endpointDescription: EndpointDescription,
  formattedRequestContractType: string,
  contractParameterName: string,
  contractResult: string
) => {
  const { parametrizedUrl, formattedFunctionParameters } = parametrizeUrl(
    endpointDescription
  );
  const paramSeparator = formattedFunctionParameters.length > 0 ? ", " : "";
  const comma = formattedRequestContractType.length > 0 ? ", " : "";
  console.log(contractParameterName);

  const view = {
    name: endpointDescription.name,
    contractParameterName,
    contractResult,
    url: `\`\$\{API_URL\}${parametrizedUrl.url}\``,
    formattedParam: `${formattedRequestContractType}${comma}${formattedFunctionParameters}${paramSeparator}headers = new Headers()`,
  };

  return render(
    "export const {{name}} = ({{{formattedParam}}}): \n\tPromise<FetchResponse<{{contractResult}}>> => \n\tapiPut('{{{url}}}', {{contractParameterName}}, headers);\n",
    view
  );
};

const DELETE = (
  endpointDescription: EndpointDescription,
  formattedRequestContractType: string,
  contractParameterName: string,
  contractResult: string
) => {
  const { parametrizedUrl, formattedFunctionParameters } = parametrizeUrl(
    endpointDescription
  );
  const paramSeparator = formattedFunctionParameters.length > 0 ? ", " : "";
  const comma = formattedRequestContractType.length > 0 ? ", " : "";

  const view = {
    name: endpointDescription.name,
    contractParameterName,
    contractResult,
    url: `\`\$\{API_URL\}${parametrizedUrl.url}\``,
    formattedParam: `${formattedRequestContractType}${comma}${formattedFunctionParameters}${paramSeparator}headers = new Headers()`,
  };

  return render(
    "export const {{name}} = ({{{formattedParam}}}): \n\tPromise<FetchResponse<{{contractResult}}>> => \n\tapiDelete({{{url}}}, {{contractParameterName}}, headers);\n",
    view
  );
};

export const generateServices = (swagger: SwaggerSchema) => {
  const endpoints = getEndpointsDescriptions(swagger);
  const view = endpoints
    .map((endpointDescription) => {
      const {
        formattedParam: formattedRequestContractType,
        contractParameterName,
      } = getRequestContractType(endpointDescription).orDefault({
        formattedParam: "",
        contractParameterName: "{}",
      });

      const contractResult = getContractResult(endpointDescription).orDefault(
        "any"
      );

      if (endpointDescription.methodType === "POST") {
        return POST(
          endpointDescription,
          formattedRequestContractType,
          contractParameterName,
          contractResult
        );
      }
      if (
        endpointDescription.methodType === "GET" ||
        endpointDescription.methodType === "DELETE"
      ) {
        return parametrizedMethod(
          endpointDescription,
          contractParameterName,
          contractResult
        );
      }
      if (endpointDescription.pathObject.put) {
        return PUT(
          endpointDescription,
          formattedRequestContractType,
          contractParameterName,
          contractResult
        );
      }

      return `// ${endpointDescription.name}\n`;
    })
    .join("\n");

  const API = render(`export const API = { \n\t{{{ rows }}}\n}\n`, {
    rows: endpoints.map((e) => e.name).join(",\n\t"),
  });

  return `${view}\n${API}`;
};
