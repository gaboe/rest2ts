import { render } from "mustache";
import { SwaggerSchema } from "../models/SwaggerSchema";
import {
  EndpointDescription,
  getEndpointsDescriptions,
  MethodType,
} from "./ApiDescriptionGenerator";
import {
  getContractResult,
  getRequestContractType,
  parametrizeUrl,
} from "./ServiceGenerator";

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
  const comma = formattedRequestContractType.length > 0 ? ", " : "";
  const method = getMethodType();

  const view = {
    name: endpointDescription.name,
    contractParameterName,
    contractResult,
    url: `\`\$\{this.baseUrl\}${parametrizedUrl.url}\``,
    formattedParam: `${formattedRequestContractType}${comma}${formattedFunctionParameters}`,
    method,
  };

  return render(
    `
    {{name}}({{{formattedParam}}}): Observable<{{contractResult}}> { 
      return api{{method}}<{{contractResult}}>(this.httpClient, {{{url}}}, {{contractParameterName}});
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
    `{{name}}({{{formattedParam}}}): Observable<{{contractResult}}> {
      {{{queryParams}}}
      return api{{method}}<{{contractResult}}>(this.httpClient, {{{parameters}}});
    }`,
    view,
  );
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
