/* eslint-disable */
// THIS FILE WAS GENERATED
// ALL CHANGES WILL BE OVERWRITTEN

// INFRASTRUCTURE START
  export type StandardError = globalThis.Error;
  export type Error500s = 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;
  export type ErrorStatuses = 0 | Error500s;
  export type ErrorResponse = FetchResponse<unknown, ErrorStatuses>;

  export type FetchResponseOfError = {
    data: null;
    error: StandardError;
    status: ErrorStatuses;
    args: FetchArgs;
  };

  export type FetchResponseOfSuccess<TData, TStatus extends number = 0> = 
  {
    data: TData;
    error: null;
    status: TStatus;
    args: FetchArgs;
    responseHeaders: Headers;
  };

  export type FetchResponse<TData, TStatus extends number = 0> = 
    TStatus extends ErrorStatuses ? FetchResponseOfError: FetchResponseOfSuccess<TData, TStatus>;

  export type TerminateRequest = null;
  export type TerminateResponse = null;

  export type Configuration = {
    apiUrl: string | (() => string);
    jwtKey: string | undefined | (() => string | null | undefined);
    requestMiddlewares?: Array<{
      name: string;
      fn: (request: FetchArgs) => FetchArgs | TerminateRequest;
    }>;
    responseMiddlewares?: Array<{
      name: string;
      fn: <TData, TStatus extends number>(
        response: FetchResponse<TData, TStatus>,
      ) => FetchResponse<TData, TStatus> | TerminateResponse;
    }>;
  };

  let CONFIG: Configuration = {
    apiUrl: () => "",
    jwtKey: undefined,
    requestMiddlewares: [],
    responseMiddlewares: [],
  };

  export function setupClient(configuration: Configuration) {
    const uniqMiddlewares = <
      T extends
        | Configuration["requestMiddlewares"]
        | Configuration["responseMiddlewares"],
    >(
      oldMiddlewares: T,
      newMiddlewares: T,
    ): T => {
      return [
        ...(oldMiddlewares?.filter(
          middleware => !newMiddlewares?.some(m => m.name === middleware.name),
        ) ?? []),
        ...(newMiddlewares ?? []),
      ] as T;
    };
  
    CONFIG = {
      ...CONFIG,
      ...configuration,
      requestMiddlewares: uniqMiddlewares(CONFIG.requestMiddlewares, configuration.requestMiddlewares),
      responseMiddlewares: uniqMiddlewares(CONFIG.responseMiddlewares, configuration.responseMiddlewares),
    };
  }

  export function getApiUrl() {
    if (typeof CONFIG.apiUrl === "function") {
      return CONFIG.apiUrl();
    }
    return CONFIG.apiUrl;
  }

  export type Termination = {
    termination: {
      name: string;
    };
  };

  export function processRequestWithMiddlewares(
    request: FetchArgs
  ): FetchArgs | Termination {
    for (const middleware of CONFIG.requestMiddlewares || []) {
      try {
        const middlewareResponse = middleware.fn(request);
        if (middlewareResponse === null) {
          return { termination: { name: middleware.name } };
        }
        request = middlewareResponse;
      } catch (e) {
        console.error("Request middleware error", e);
      }
    }
    return request;
  }

  export function processResponseWithMiddlewares<TData, TStatus extends number>(
    response: FetchResponse<TData, TStatus>,
  ): FetchResponse<TData, TStatus | 0> {
    for (const middleware of CONFIG.responseMiddlewares || []) {
      try {
        const middlewareResponse = middleware.fn(response);
        if (middlewareResponse === null) {
          return {
            status: 0,
            args: response.args,
            data: null,
            error: new Error(
              `Response terminated by middleware: ${middleware.name}`
            ),
          } satisfies FetchResponseOfError;
        }
        response = middlewareResponse;
      } catch (e) {
        console.error("Response middleware error", e);
      }
    }
    return response;
  }

  export type FetchArgsOptions = Omit<RequestInit, "method" | "redirect" | "body">;

  export type FetchArgs = {
    url: string;
    options: RequestInit;
  }

  export type UriComponent = string | number | boolean;
  export type ParamsObject = {
    [key: string]: UriComponent | UriComponent[] | undefined | null;
  };

  export async function fetchJson<TData>(args: FetchArgs): Promise<FetchResponse<TData, number> | FetchResponseOfError> {
    const errorResponse = (error: StandardError, status: number, args: FetchArgs) => {  
      const errorResponse = {
        status: status as ErrorStatuses,
        args,
        data: null,
        error,
      } satisfies FetchResponseOfError;

      return processResponseWithMiddlewares(errorResponse);
    };

    const errorStatus = (args: FetchArgs) => {
      const errorResponse = {
        status: 0,
        args,
        data: null,
        error: new Error("Network error"),
      } satisfies FetchResponseOfError;

      return processResponseWithMiddlewares(errorResponse);
    };

    try {
      const fetchRequest = processRequestWithMiddlewares(args);

      if ("termination" in fetchRequest) {
        const terminationResponse = {
          status: 0,
          args,
          data: null,
          error: new Error(
            `Request terminated by middleware: ${fetchRequest.termination.name}`
          ),
        } satisfies FetchResponseOfError;

        return processResponseWithMiddlewares(terminationResponse);
      }

      const fetchResponse: Response = await fetch(fetchRequest.url, fetchRequest.options);
      const status = fetchResponse.status;
      try {
        const json = await fetchResponse.json();
        const response = {
          data: json,
          status: fetchResponse.status,
          args,
          error: null,
          responseHeaders: fetchResponse.headers,
        };
        return processResponseWithMiddlewares(response);
      } catch (error) {
        return errorResponse(error as StandardError, status, args);
      }
    } catch {
      return errorStatus(args);
    }
  }

  export function getJwtKey(): string | null | undefined {
    if (typeof CONFIG.jwtKey === "function") {
      return CONFIG.jwtKey();
    }

    if (typeof CONFIG.jwtKey === "string") {
      return localStorage.getItem(CONFIG.jwtKey);
    }

    return undefined;
  } 
  
  
 function getApiRequestData<Type extends any>(
    requestContract: Type | undefined,
    isFormData: boolean = false
  ): FormData | Type | {} {
  
    if (!isFormData) {
      return requestContract !== undefined ? requestContract : {};
    }
  
    //multipart/form-data
    const formData = new FormData();
  
     if (requestContract) {
      Object.keys(requestContract).forEach(key => {
        const value = requestContract[key as keyof Type];
        const isKeyArrayAndValueIterable = key.endsWith('[]') && typeof (value as any)[Symbol.iterator] === 'function';
        const values = isKeyArrayAndValueIterable ? Array.from(value as Iterable<any>) : [value];
          for (const val of values) {
              if (val === undefined) {
                  continue;
              }
              if (val === null) {
                  formData.append(key, '');
              } else if (val instanceof File) {
                  formData.append(key, val);
              } else if (typeof val === 'object' && val !== null) {
                  formData.append(key, JSON.stringify(val));
              } else {
                  formData.append(key, val);
              }
          }
      });
    }
  
    return formData;
  }

  
function updateHeaders(headers: HeadersInit) {
  const token = getJwtKey();
  if (headers instanceof Headers) {
    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }
    if (!headers.has("Authorization") && !!token) {
      headers.append("Authorization", token);
    }
    return;
  }

  if (Array.isArray(headers)) {
    if (!headers.find(([key]) => key === "Content-Type")) {
      headers.push(["Content-Type", "application/json"]);
    }
    if (!headers.find(([key]) => key === "Authorization") && !!token) {
      headers.push(["Authorization", token]);
    }
    return;
  }

  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (!headers.Authorization && !!token) {
    headers.Authorization = token;
  }
}

function removeContentTypeHeader(headers: HeadersInit) {
  if (headers instanceof Headers) {
    headers.delete("Content-Type");
    return;
  }

  if (Array.isArray(headers)) {
    return headers.filter(([key]) => key !== "Content-Type");
  }

  delete headers["Content-Type"];
}

export function createRequest<TRequest>(
  method: string,
  request: TRequest | undefined,
  options: FetchArgsOptions | undefined,
  url: string,
  paramsObject: ParamsObject = {},
) {
  const fetchOptions = options ?? {};

  if (!fetchOptions.headers) {
    fetchOptions.headers = new Headers();
  }

  updateHeaders(fetchOptions.headers);
  if (request instanceof FormData) {
    removeContentTypeHeader(fetchOptions.headers);
  }

  const body = (request instanceof FormData) ? request : JSON.stringify(request);
  const maybeQueryString = getQueryParamsString(paramsObject);

  const requestOptions: RequestInit = {
    ...fetchOptions,
    method,
    body,
    redirect: "follow",
  };

  return { options: requestOptions, url: `${url}${maybeQueryString}` } as FetchArgs;
}

export function getQueryParamsString(paramsObject: ParamsObject = {}) {
	const queryString = Object.entries(paramsObject)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(val => `${encodeURIComponent(key)}=${encodeURIComponent(
            val,
          )}`)
          .join('&');
      }
      // Handling non-array parameters
      return value !== undefined && value !== null 
        ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}` 
        : '';
    })
    .filter(part => part !== '')
    .join("&");

	return queryString.length > 0 ? `?${queryString}` : '';
}

export function apiPost<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("POST", request, options, url, paramsObject));
}

export function apiGet<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("GET", undefined, options, url, paramsObject));
}

export function apiPut<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("PUT", request, options, url, paramsObject));
}

export function apiDelete<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("DELETE", undefined, options, url, paramsObject));
}

export function apiPatch<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("PATCH", request, options, url, paramsObject));
}
// INFRASTRUCTURE END

export enum ContractTypeCode {
	BEN = "BEN",
	CONSIGNMENT = "CONSIGNMENT",
	DYN = "DYN",
	FCG = "FCG",
	LIBERO_RS = "LIBERO_RS",
	OKP = "OKP",
	OKS_FKI = "OKS_FKI",
	OKS_Investor = "OKS_Investor",
	OKS_LC = "OKS_LC",
	OKS_LC_EX = "OKS_LC_EX",
	OKS_LC_EX_ = "OKS_LC_EX_",
	OKSP_LC = "OKSP_LC",
	OKSP_LC_EX = "OKSP_LC_EX",
	OKSP_LC_EX_ = "OKSP_LC_EX_",
	RS_INVCZK = "RS_INVCZK",
	RS_INVCZKSELF = "RS_INVCZKSELF",
	RS_INVEUR = "RS_INVEUR",
	RS_INVEURSELF = "RS_INVEURSELF",
	RS_INVPROFICZK = "RS_INVPROFICZK",
	RS_OKSmartFondy = "RS_OKSmartFondy",
	RS_OKSmartFondy_EX = "RS_OKSmartFondy_EX",
	RS_OKSmartFondy_EX_ = "RS_OKSmartFondy_EX_",
	RS_OKSmartProdukty = "RS_OKSmartProdukty",
	RS_OKSmartProdukty_EX = "RS_OKSmartProdukty_EX",
	RS_OKSmartProdukty_EX_ = "RS_OKSmartProdukty_EX_"
};

export type ProductItemDto = {
	className?: string | null;
	order?: number | null;
	singleMinInvestment?: number | null;
	singleMaxInvestment?: number | null;
	singleDefaultInvestment?: number | null;
	periodicalMinInvestment?: number | null;
	periodicalMaxInvestment?: number | null;
	periodicalDefaultInvestment?: number | null;
	color?: string | null;
	hasPeriodicalRedemption?: boolean | null;
	minPerformance?: number | null;
	maxPerformance?: number | null;
	productCode?: string | null;
	isin?: string | null;
	productName?: string | null;
	productSingleSS?: string | null;
	productPeriodicalSS?: string | null;
};

export type ProcessBankIDVerificationCommandResult = {
	status: ProcessBankIDVerificationCommandResultStatus;
	profile?: BankIDProfileResponse | null;
};

export enum ProcessBankIDVerificationCommandResultStatus {
	BankIDUserInfoError = "BankIDUserInfoError",
	Success = "Success",
	Fail = "Fail",
	VerificationAlreadyExists = "VerificationAlreadyExists"
};

export type BankIDProfileResponse = {
	sub: string;
	txn: string;
	verified_claims?: VerifiedClaimsDto | null;
	given_name: string;
	family_name: string;
	gender: string;
	birthdate: string;
	birthnumber?: string | null;
	age: number;
	majority: boolean;
	date_of_death: any;
	birthplace: string;
	primary_nationality: string;
	nationalities: string[];
	maritalstatus: string;
	email: string;
	phone_number: string;
	pep: boolean;
	limited_legal_capacity: boolean;
	addresses: Address[];
	idcards: Idcard[];
	paymentAccounts: string[];
	updated_at: number;
};

export type VerifiedClaimsDto = {
	verification?: Verification | null;
	claims: Claims;
};

export type Verification = {
	trust_framework?: string | null;
	verification_process: string;
};

export type Claims = {
	given_name: string;
	family_name: string;
	gender: string;
	birthdate: string;
	addresses: Address[];
	idcards: Idcard[];
};

export type Address = {
	type: string;
	street: string;
	buildingapartment: string;
	streetnumber: string;
	city: string;
	zipcode: string;
	country: string;
	ruian_reference: string;
};

export type Idcard = {
	type: string;
	description: string;
	country: string;
	number: string;
	valid_to: string;
	issuer: string;
	issue_date: string;
};

export type OneOfArrayDto = {
	changedProperties: (string | number)[];
};

export type GetBankIDVerifyBankIdFetchResponse = 
| FetchResponse<ProcessBankIDVerificationCommandResult, 200> 
| ErrorResponse;

export const getBankIDVerifyBankIdPath = () => `/api/BankID/verify-bank-id`;

export const getBankIDVerifyBankId = (token?: string | undefined | null, options?: FetchArgsOptions):
  Promise<GetBankIDVerifyBankIdFetchResponse> => {
    const queryParams = {
      "token": token
    }
    return apiGet(`${getApiUrl()}${getBankIDVerifyBankIdPath()}`, options, queryParams) as Promise<GetBankIDVerifyBankIdFetchResponse>;
}

export type GetProductListFetchResponse = 
| FetchResponse<ProductItemDto[], 200> 
| ErrorResponse;

export const getProductListPath = () => `/api/product/list`;

export const getProductList = (contractTypeCode?: ContractTypeCode | undefined | null, options?: FetchArgsOptions):
  Promise<GetProductListFetchResponse> => {
    const queryParams = {
      "contractTypeCode": contractTypeCode
    }
    return apiGet(`${getApiUrl()}${getProductListPath()}`, options, queryParams) as Promise<GetProductListFetchResponse>;
}

export type GetOneOfArrayFetchResponse = 
| FetchResponse<OneOfArrayDto[], 200> 
| ErrorResponse;

export const getOneOfArrayPath = () => `/api/oneOf/array`;

export const getOneOfArray = (options?: FetchArgsOptions):
  Promise<GetOneOfArrayFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOneOfArrayPath()}`, options, {}) as Promise<GetOneOfArrayFetchResponse>;
}
