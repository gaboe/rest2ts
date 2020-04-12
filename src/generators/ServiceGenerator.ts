import { SwaggerSchema } from "../models/SwaggerSchema";
import {
  getEndpointsDescriptions,
  EndpointDescription,
} from "./ApiDescriptionGenerator";
import { render } from "mustache";

const getRequestContractType = (ed: EndpointDescription) => {
  if (
    ed.pathObject.post &&
    ed.pathObject.post.requestBody?.content["application/json"]
  ) {
    const ref =
      ed.pathObject.post.requestBody.content["application/json"].schema;
    console.log(ed.pathObject);

    return ref.$ref?.split("/").reverse()[0];
  }
  return "any";
};

export const generateServices = (swagger: SwaggerSchema) => {
  const endpoints = getEndpointsDescriptions(swagger);
  const view = endpoints
    .map((e) => {
      const view = {
        name: e.name,
        requestContractType: getRequestContractType(e),
      };

      return render(
        "export const {{name}} = (requestContract: {{requestContractType}}): Promise<any> => {return any}",
        view
      );
    })
    .join("\n");

  return view;
};
