// ------------------------------- Path --------------------------------------
export interface Path {
  $ref?: string;
  get?: Operation;
  put?: Operation;
  post?: Operation;
  delete?: Operation;
  options?: Operation;
  head?: Operation;
  patch?: Operation;
  parameters?: Array<Parameter | Reference>;
}
// ----------------------------- Parameter -----------------------------------

export type ParameterType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object"
  | "file";

export type BaseParameter = {
  name: string;
  in: "body" | "query" | "path" | "header" | "formData" | "body";
  required?: boolean;
  description?: string;
};

export type BodyParameter = BaseParameter & {
  in: "body";
  schema?: Schema;
};

export type GenericFormat = {
  type?: ParameterType;
  format?: string;
};

export type IntegerFormat = {
  type: "integer";
  format?: "int32" | "int64";
};

export type NumberFormat = {
  type: "number";
  format?: "float" | "double";
};

export type StringFormat = {
  type: "string";
  format?: "" | "byte" | "binary" | "date" | "date-time" | "password";
};

export type SchemaFormatConstraints =
  | GenericFormat
  | IntegerFormat
  | NumberFormat
  | StringFormat;
export type BaseFormatContrainedParameter = BaseParameter &
  SchemaFormatConstraints;
export type ParameterCollectionFormat =
  | "csv"
  | "ssv"
  | "tsv"
  | "pipes"
  | "multi";

export type QueryParameter = BaseFormatContrainedParameter &
  BaseSchema & {
    in: "query";
    allowEmptyValue?: boolean;
    collectionFormat?: ParameterCollectionFormat;
  };

export type PathParameter = BaseFormatContrainedParameter &
  BaseSchema & {
    in: "path";
    required: true;
  };

export type HeaderParameter = BaseFormatContrainedParameter &
  BaseSchema & {
    in: "header";
  };

export type FormDataParameter = BaseFormatContrainedParameter &
  BaseSchema & {
    in: "formData";
    type: ParameterType | "file";
    allowEmptyValue?: boolean;
    collectionFormat?: ParameterCollectionFormat;
  };

export type Parameter =
  | BodyParameter
  | FormDataParameter
  | QueryParameter
  | PathParameter
  | HeaderParameter;
// ----------------------------- Reference -----------------------------------
export interface Reference {
  $ref: string;
}

export interface ExternalDocs {
  url: string;
  description?: string;
}

export interface OperationContent {
  [mimeType: string]: {
    schema: Schema;
  };
}

export interface Operation {
  responses: {
    [responseName: string]: {
      content: OperationContent;
    };
  };
  tags?: string[];
  requestBody: {
    content: OperationContent;
  };
  parameters: Parameter[];
}

// ------------------------------ Schema -------------------------------------
export type BaseSchema = {
  type?: ParameterType;
  format?: string;
  title?: string;
  description?: string;
  default?: any;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  enum?: any[];
  items?: Schema | Schema[];
};
export interface XML {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

export interface Schema extends BaseSchema {
  $ref?: string;
  allOf?: Schema[];
  oneOf?: Schema[];
  additionalProperties?: Schema | boolean;
  properties?: { [propertyName: string]: Schema };
  discriminator?: string;
  readOnly?: boolean;
  xml?: XML;
  externalDocs?: ExternalDocs;
  example?: any;
  required?: string[];
}

export interface Components {
  schemas: { [pathName: string]: Schema };
}

export interface SwaggerSchema {
  paths: { [pathName: string]: Path };
  components: Components;
}
