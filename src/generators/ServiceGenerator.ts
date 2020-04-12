import { SwaggerSchema } from "../models/SwaggerSchema";
import {
  getEndpointsDescriptions,
  EndpointDescription,
} from "./ApiDescriptionGenerator";
import { render } from "mustache";
import { Maybe, Nothing, Just } from "purify-ts";
const getRequestContractType = (ed: EndpointDescription): Maybe<string> => {
  if (
    ed.pathObject.post &&
    ed.pathObject.post.requestBody?.content["application/json"]
  ) {
    const ref =
      ed.pathObject.post.requestBody.content["application/json"].schema;
    return Maybe.fromNullable(ref.$ref?.split("/").reverse()[0]).chain((v) =>
      Just(`requestContract: ${v}`)
    );
  }
  return Nothing;
};

export const generateServices = (swagger: SwaggerSchema) => {
  const endpoints = getEndpointsDescriptions(swagger);
  const view = endpoints
    .map((e) => {
      const requestContractType = getRequestContractType(e);
      const contractParameter = requestContractType.orDefault("");
      const view = {
        name: e.name,
        contractParameter,
      };

      return render(
        "export const {{name}} = ({{contractParameter}}): Promise<any> => {return any}",
        view
      );
    })
    .join("\n");

  return view;
};
