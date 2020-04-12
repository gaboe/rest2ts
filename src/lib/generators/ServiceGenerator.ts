import { SwaggerSchema } from "../models/SwaggerSchema";
import {
  getEndpointsDescriptions,
  EndpointDescription,
} from "./ApiDescriptionGenerator";
import { render } from "mustache";
import { Maybe, Nothing, Just } from "purify-ts";
import { getTypeNameFromRef } from "./Common";

const getRequestContractType = (
  endpointDescription: EndpointDescription
): Maybe<{ contractParameterName: string; formattedParam: string }> => {
  const post = endpointDescription.pathObject.post;
  if (post && post.requestBody?.content["application/json"]) {
    const schema = post.requestBody.content["application/json"].schema;
    return Maybe.fromNullable(schema.$ref)
      .chain((e) => Just(getTypeNameFromRef(e)))
      .chain((v) =>
        Just({
          contractParameterName: "requestContract",
          formattedParam: `requestContract: ${v}`,
        })
      );
  }
  return Nothing;
};

const getContractResult = (
  endpointDescription: EndpointDescription
): Maybe<string> => {
  const post = endpointDescription.pathObject.post;
  if (post && post.responses["200"]?.content?.["application/json"]) {
    const schema = post.responses["200"].content["application/json"].schema;
    return Maybe.fromNullable(schema.$ref).chain((e) =>
      Just(getTypeNameFromRef(e))
    );
  }
  return Nothing;
};

export const generateServices = (swagger: SwaggerSchema, baseUrl: string) => {
  const endpoints = getEndpointsDescriptions(swagger);
  const view = endpoints
    .map((e) => {
      const { formattedParam, contractParameterName } = getRequestContractType(
        e
      ).orDefault({
        formattedParam: "",
        contractParameterName: "{}",
      });
      const comma = formattedParam.length > 0 ? ", " : "";

      const contractResult = getContractResult(e).orDefault("any");
      const view = {
        name: e.name,
        formattedParam: `${formattedParam}${comma}headers = new Headers()`,
        contractParameterName,
        contractResult,
        url: `${baseUrl}${e.url}`,
      };

      return render(
        "export const {{name}} = ({{{formattedParam}}}): Promise<FetchResponse<{{contractResult}}>> => \n\t apiPost('{{{url}}}', {{contractParameterName}}, headers);\n",
        view
      );
    })
    .join("\n");

  return view;
};
