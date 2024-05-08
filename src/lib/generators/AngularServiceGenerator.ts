import { render } from "mustache";
import { Just, Maybe, Nothing } from "purify-ts";
import { Operation, Schema, SwaggerSchema } from "../models/SwaggerSchema";
import {
  EndpointDescription,
  getEndpointsDescriptions,
  MethodType,
} from "./ApiDescriptionGenerator";
import { getTypeNameFromRef, getTypeNameFromSchema } from "./Common";
import { getRequestContractType, parametrizeUrl } from "./ServiceGenerator";

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

  const { parametrizedUrl, formattedFunctionParameters, unusedParameters } =
    parametrizeUrl(endpointDescription);
  const comma = formattedRequestContractType.length > 0 ? ", " : "";
  const method = getMethodType();

  const queryParams =
    unusedParameters.length > 0
      ? render("const queryParams = {\n\t\t{{{rows}}}\n\t}\n\t", {
          rows: unusedParameters.join("\t\t,\n"),
        })
      : "";
  const queryParameters = unusedParameters.length > 0 ? `, queryParams` : "";

  const view = {
    name: endpointDescription.name,
    contractParameterName,
    contractResult,
    url: `\`\$\{this.baseUrl\}${parametrizedUrl.url}\``,
    formattedParam: `${formattedRequestContractType}${
      formattedFunctionParameters ? comma : ""
    }${formattedFunctionParameters}`,
    method,
    queryParams,
    queryParameters,
  };

  return render(
    `
    {{name}}({{{formattedParam}}}): Observable<{{{contractResult}}}> {\n\t{{{queryParams}}}
      return api{{method}}<{{{contractResult}}}>(this.httpClient, {{{url}}}, {{contractParameterName}}{{queryParameters}});
    }
  `,
    view,
  );
};

const parametrizedMethod = (
  endpointDescription: EndpointDescription,
  contractResult: string,
) => {
  const { unusedParameters, parametrizedUrl, formattedFunctionParameters } =
    parametrizeUrl(endpointDescription);
  const method = `${endpointDescription.methodType.charAt(
    0,
  )}${endpointDescription.methodType.substring(1).toLowerCase()}${
    endpointDescription.isFileResponse ? "File" : ""
  }`;

  const queryParams =
    unusedParameters.length > 0
      ? render("const queryParams = {\n\t\t{{{rows}}}\n\t}\n\t", {
          rows: unusedParameters.join("\t\t,\n"),
        })
      : "";

  const parameters = [
    `\`\$\{this.baseUrl\}${parametrizedUrl.url}\``,
    ...[unusedParameters.length > 0 ? "queryParams" : ""],
  ]
    .filter(x => !!x)
    .join(", ");

  const view = {
    name: endpointDescription.name,
    contractResult,
    parameters,
    queryParams,
    formattedParam: `${formattedFunctionParameters}`,
    method: method,
  };

  return render(
    `
    {{name}}({{{formattedParam}}}): Observable<{{{contractResult}}}> {
      {{{queryParams}}}
      return api{{method}}<{{{contractResult}}}>(this.httpClient, {{{parameters}}});
    }
    `,
    view,
  );
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
          return `ResponseResult<void, ${status}>`;
        }

        const isFileSchema = schema.format === "binary";

        if (schema.type === "array") {
          const typeName = Maybe.fromNullable(schema.items)
            .chain(e => (e instanceof Array ? Just(e[0]) : Just(e)))
            .chain(e =>
              Just(isFileSchema ? "FileResponse" : getTypeName(e, true)),
            )
            .orDefault("");
          return `ResponseResult<${typeName}, ${status}>`;
        }
        return `ResponseResult<${
          isFileSchema ? "FileResponse" : getTypeName(schema, false)
        }, ${status}>`;
      })
      .join(" | ");

    return Just(type);
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

export const generateAngularServices = (swagger: SwaggerSchema) => {
  const endpoints = getEndpointsDescriptions(swagger).map(
    endpointDescription => {
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
        return parametrizedMethod(endpointDescription, contractResult);
      }

      return `// ${endpointDescription.name}\n`;
    },
  );

  const view = render(
    `
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable()
export class ApiService {
  private httpClient: HttpClient;
  private baseUrl: string;

  constructor(
    @Inject(HttpClient) httpClient: HttpClient,
    @Optional() @Inject(API_BASE_URL) baseUrl?: string
  ) {
      this.httpClient = httpClient;
      this.baseUrl = baseUrl ?? "";
  }

  \n\t{{{ rows }}}\n\n
}
  
  `,
    {
      rows: endpoints.join("\n"),
    },
  );

  return `${view}\n`;
};
