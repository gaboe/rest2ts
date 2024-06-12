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
    args: any;
  };

  export type FetchResponseOfSuccess<TData, TStatus extends number = 0> = 
  {
    data: TData;
    error: null;
    status: TStatus;
    args: any;
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
      fn: (
        response: FetchResponse<unknown, any>
      ) => FetchResponse<unknown, any> | TerminateResponse;
    }>;
  };

  let CONFIG: Configuration = {
    apiUrl: () => "",
    jwtKey: undefined,
    requestMiddlewares: [],
    responseMiddlewares: [],
  };

  export function setupClient(configuration: Configuration) {
    CONFIG = {
      ...CONFIG,
      ...configuration,
      requestMiddlewares: [
        ...(CONFIG.requestMiddlewares || []),
        ...(configuration.requestMiddlewares || []),
      ],
      responseMiddlewares: [
        ...(CONFIG.responseMiddlewares || []),
        ...(configuration.responseMiddlewares || []),
      ],
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

  export function processResponseWithMiddlewares<T extends FetchResponse<unknown, any>>(
    response: T
  ): T | Termination {
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
          } as FetchResponseOfError as unknown as T;
        }
        response = middlewareResponse as T;
      } catch (e) {
        console.error("Response middleware error", e);
      }
    }
    return response;
  }

  export type FetchOptions = {
    method: string;
    headers: Headers;
    body?: any;
    redirect: RequestRedirect;
  };

  export type FetchArgs = {
    url: string;
    options: FetchOptions;
  }

  export async function fetchJson<T extends FetchResponse<unknown, number>>(
    args: FetchArgs
  ): Promise<T> {
    const errorResponse = (error: StandardError, status: number, args: any) => {
      const errorResponse = {
        status: status as ErrorStatuses,
        args,
        data: null,
        error,
      } satisfies FetchResponse<T>;

      return processResponseWithMiddlewares(errorResponse) as unknown as T;
    };

    const errorStatus = (args: any) => {
      const errorResponse = {
        status: 0,
        args,
        data: null,
        error: new Error("Network error"),
      } as FetchResponse<T, Error500s>;

      return processResponseWithMiddlewares(errorResponse) as unknown as T;
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
        } as FetchResponse<T, Error500s>;

        return processResponseWithMiddlewares(
          terminationResponse
        ) as unknown as T;
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
        return processResponseWithMiddlewares(response) as unknown as T;
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
  
  function updateHeaders(headers: Headers) {
    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }
    const token = getJwtKey();
    if (!headers.has("Authorization") && !!token) {
      headers.append("Authorization", token);
    }
  };

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
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  let raw;
  if(request instanceof FormData) {
      raw = request;
      headers.delete('Content-Type');
  } else {
      raw = JSON.stringify(request);
      updateHeaders(headers);
  }

  const requestOptions: FetchOptions = {
    method: "POST",
    headers,
    body: raw,
    redirect: "follow",
  };

  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

export type ParamsObject = {
  [key: string]: any;
};

export function apiGet<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);
  
  const maybeQueryString = getQueryParamsString(paramsObject);

  const requestOptions: FetchOptions = {
    method: "GET",
    headers,
    redirect: "follow",
  };

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

export function apiPut<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const raw = JSON.stringify(request);

  const requestOptions: FetchOptions = {
    method: "PUT",
    headers,
    body: raw,
    redirect: "follow",
  };

  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

export function apiDelete<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const queryString = Object.entries(paramsObject)
    .filter(([_, val]) => val !== undefined && val !== null)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
  
  const maybeQueryString = queryString.length > 0 ? `?${queryString}` : "";

  const requestOptions: FetchOptions = {
    method: "DELETE",
    headers,
    redirect: "follow",
  };

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

export function apiPatch<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const raw = JSON.stringify(request);

  const requestOptions: FetchOptions = {
    method: "PATCH",
    headers,
    body: raw,
    redirect: "follow",
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}
// INFRASTRUCTURE END

export enum ElectronicTradeFormalityEnum {
	BlueAgreement = "BlueAgreement",
	AML = "AML",
	Termination = "Termination",
	TransferUnderSAB = "TransferUnderSAB",
	Change = "Change",
	LoanProtocolHandover = "LoanProtocolHandover",
	TradeProducerProtocol = "TradeProducerProtocol",
	Modelation = "Modelation",
	Other = "Other",
	ZZJ = "ZZJ",
	TradeIdentificationForm = "TradeIdentificationForm",
	NewInstruction = "NewInstruction",
	LoanRequest = "LoanRequest",
	ESIP = "ESIP",
	Contract = "Contract"
};

export type ErrorDetailDTO = {
	code: string;
	message: string;
};

export type ExceptionDTO = {
	errors?: { [key: string | number]: ErrorDetailDTO[] } | null;
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
	stackTrace?: { [key: string | number]: ExceptionStackTraceItemDTO[] } | null;
};

export type ExceptionStackTraceItemDTO = {
	file?: string | null;
	line?: number | null;
	function?: string | null;
	class?: string | null;
	type?: string | null;
};

export type ElectronicTradeFormalityDataRequestDTO = {
	formalityType: ElectronicTradeFormalityEnum;
	sendByPostOffice?: boolean | null;
	targetRelationId?: number | null;
};

export type ElectronicTradeFormalityRequestDTO = {
	data: ElectronicTradeFormalityDataRequestDTO;
	file?: string | null;
};

export type PostElectronicTradeTradesElectronicTradeIdFormalityFetchResponse = 
| FetchResponse<void, 204> 
| ErrorResponse;

export const postElectronicTradeTradesElectronicTradeIdFormalityPath = (electronicTradeId: number, fields?: string) => `/api/electronic-trade/trades/${electronicTradeId}/formality`;

export const postElectronicTradeTradesElectronicTradeIdFormality = (requestContract: ElectronicTradeFormalityRequestDTO, electronicTradeId: number, fields?: string, headers = new Headers()): 
	Promise<PostElectronicTradeTradesElectronicTradeIdFormalityFetchResponse> => {
	const queryParams = {
		"fields": fields
	}
	
    //multipart/form-data  
    const formData = new FormData();
    Object.keys(requestContract).forEach(key => {
    const value = requestContract[key as keyof ElectronicTradeFormalityRequestDTO];
    if (value instanceof File) {      
      formData.append(key, value);
    } else if (typeof value === 'object' && value !== null) {      
      formData.append(key, JSON.stringify(value));
    } else {      
      formData.append(key, value as any);
    }
  });return apiPost(`${getApiUrl()}${postElectronicTradeTradesElectronicTradeIdFormalityPath(electronicTradeId)}`, formData, headers, queryParams) as Promise<PostElectronicTradeTradesElectronicTradeIdFormalityFetchResponse>;
}
