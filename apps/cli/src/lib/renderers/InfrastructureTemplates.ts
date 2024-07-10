const disclaimer = `
/* eslint-disable */
// THIS FILE WAS GENERATED
// ALL CHANGES WILL BE OVERWRITTEN\n\n`.trimStart();

const commonInfrastructure = `
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
              } else if (val === null) {
                  formData.append(key, '');
              } else if (val instanceof File) {
                  formData.append(key, val);
              } else if (typeof val === 'object' && val !== null) {
                  formData.append(key, JSON.stringify(val));
              } else {
                  formData.append(key, val as any);
              }
          }
      });
    }
  
    return formData;
  }
`;

export const getInfrastructureTemplate = (isCookiesAuthEnabled: boolean) => {
  const credentialsTemplate = isCookiesAuthEnabled
    ? `\n\t\tcredentials: "include",`
    : "";

  return `${disclaimer}// INFRASTRUCTURE START
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
              \`Response terminated by middleware: \${middleware.name}\`
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
    redirect: RequestRedirect;${isCookiesAuthEnabled ? "\n\t\tcredentials?: RequestCredentials;" : ""}
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
            \`Request terminated by middleware: \${fetchRequest.termination.name}\`
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
  
  ${commonInfrastructure}
  
  function updateHeadersAndGetBody<TResponse extends FetchResponse<unknown, number>, TRequest>(
    request: TRequest,
    headers: Headers
  ) {
    if (request instanceof FormData) {
      headers.delete("Content-Type");
      return request;
    } else {
      updateHeaders(headers);
      return JSON.stringify(request);
    }
  }
  
  function updateHeaders(headers: Headers) {
    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }
    const token = getJwtKey();
    if (!headers.has("Authorization") && !!token) {
      headers.append("Authorization", token);
    }
  }

export function getQueryParamsString(paramsObject: ParamsObject = {}) {
	const queryString = Object.entries(paramsObject)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(val => \`\${encodeURIComponent(key)}=\${encodeURIComponent(
            val,
          )}\`\)
          .join('&');
      }
      // Handling non-array parameters
      return value !== undefined && value !== null 
        ? \`\${encodeURIComponent(key)}=\${encodeURIComponent(value)}\`\ 
        : '';
    })
    .filter(part => part !== '')
    .join("&");

	return queryString.length > 0 ? \`?\${queryString}\` : '';
}

export function apiPost<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  
  const raw = updateHeadersAndGetBody(request, headers); 

  const requestOptions: FetchOptions = {
    method: "POST",
    headers,
    body: raw,
    redirect: "follow",${credentialsTemplate}
  };

  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: \`\${url}\${maybeQueryString}\`,
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
    redirect: "follow",${credentialsTemplate}
  };

  return fetchJson<TResponse>({
    url: \`\${url}\${maybeQueryString}\`,
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
    redirect: "follow",${credentialsTemplate}
  };

  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: \`\${url}\${maybeQueryString}\`,
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
    .map(([key, val]) => \`\${key}=\${val}\`)
    .join("&");
  
  const maybeQueryString = queryString.length > 0 ? \`?\${queryString}\` : "";

  const requestOptions: FetchOptions = {
    method: "DELETE",
    headers,
    redirect: "follow",${credentialsTemplate}
  };

  return fetchJson<TResponse>({
    url: \`\${url}\${maybeQueryString}\`,
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
    redirect: "follow",${credentialsTemplate}
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: \`\${url}\${maybeQueryString}\`,
    options: requestOptions,
  });
}
// INFRASTRUCTURE END
`;
};

export const getAngularInfrastructureTemplate = () => {
  return `${disclaimer}// INFRASTRUCTURE START

import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

type FlattenableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | FlattenableValue[]
  | {
      [prop: string]: FlattenableValue;
    };

type QueryParams = { [key: string]: FlattenableValue } | null | undefined;

${commonInfrastructure}

function flattenQueryParams(data: QueryParams) {
  const params: Record<string, any> = {};
  flatten(params, data, '');
  return params;
}

function flatten(params: any, data: FlattenableValue, path: string) {
  for (const key of Object.keys(data)) {
    if (data[key] instanceof Array) {
      data[key].forEach((item: FlattenableValue, index: number) => {
        if (item instanceof Object) {
          flatten(params, item, \`\${path}\${key}[\${index}].\`);
        } else {
          params[\`\${path}\${key}[\${index}]\`] = item;
        }
      });
    } else if (data[key]?.constructor === Object) {
      flatten(params, data[key], \`\${path}\${key}.\`);
    } else {
      params[\`\${path}\${key}\`] = data[key];
    }
  }
}

type ResponseResult<T, U extends number = 0> = {
  status: U;
  response: U extends 0 ? unknown : T;
};

function createQueryUrl(url: string, paramsObject: QueryParams) {
  const queryString = Object.entries(flattenQueryParams(paramsObject))
    .map(([key, val]) => {
			
			if (key && val !== null && val !== undefined) {
				return Array.isArray(val) 
					? val.map((item) => \`\${encodeURIComponent(key)}=\${encodeURIComponent(item)}\`).join('&') 
					: \`\${encodeURIComponent(key)}=\${encodeURIComponent(val)}\`;
			}
			return null;
		})
		.filter(p => !!p)
    .join("&");

  const maybeQueryString = queryString.length > 0 ? \`?\${queryString}\` : "";
  return \`\${url}\${maybeQueryString}\`;
}

function parseErrorResponse<T>(error: unknown): T | unknown {
	try {
		return JSON.parse(error as string) as T;
	} catch (e) {
		return error;
	}
}

function apiGet<T extends ResponseResult<unknown, number>>(
	httpClient: HttpClient,
	url: string,
	params?: QueryParams,
): Observable<T | never> {
	const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.get<HttpResponse<T['response']>>(queryUrl, { observe: 'response' })
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiGetFile<T extends ResponseResult<unknown, number>>(
	httpClient: HttpClient,
	url: string,
	params?: QueryParams,
): Observable<T | never> {
	const mapResult = (response: HttpResponse<Blob>) => {
		const contentDisposition = response.headers ? response.headers.get("content-disposition") : undefined;
		let fileNameMatch = contentDisposition ? /filename\\\*=(?:(\\\?['"])(.*?)\\1|(?:[^\\s]+'.*?')?([^;\\n]*))/g.exec(contentDisposition) : undefined;
		let fileName = fileNameMatch && fileNameMatch.length > 1 ? fileNameMatch[3] || fileNameMatch[2] : undefined;
		if (fileName) {
			fileName = decodeURIComponent(fileName);
		} else {
			fileNameMatch = contentDisposition ? /filename="?([^"]*?)"?(;|$)/g.exec(contentDisposition) : undefined;
			fileName = fileNameMatch && fileNameMatch.length > 1 ? fileNameMatch[1] : undefined;
		}
		return { data: response.body, fileName: fileName };
	}

	const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.get(queryUrl, { observe: 'response', responseType: "blob" })
		.pipe(
			map(
				(r) =>
				({
					status: r.status,
					response: mapResult(r),
				} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiPost<T extends ResponseResult<unknown, number>, U = unknown>(
	httpClient: HttpClient,
	url: string,
	body: U,
  params?: QueryParams,
): Observable<T | never> {
  const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.post<HttpResponse<T['response']>>(queryUrl, body, {
			observe: 'response',
		})
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiPut<T extends ResponseResult<unknown, number>, U = unknown>(
	httpClient: HttpClient,
	url: string,
	body: U,
  params?: QueryParams,
): Observable<T | never> {
  const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.put<HttpResponse<T['response']>>(queryUrl, body, {
			observe: 'response',
		})
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiDelete<T extends ResponseResult<unknown, number>>(
	httpClient: HttpClient,
	url: string,
	params?: QueryParams,
) {
	const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.delete<HttpResponse<T['response']>>(queryUrl, { observe: 'response' })
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiPatch<T extends ResponseResult<unknown, number>, U = unknown>(
	httpClient: HttpClient,
	url: string,
	body: U,
  params?: QueryParams,
): Observable<T | never> {
  const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.patch<HttpResponse<T['response']>>(queryUrl, body, {
			observe: 'response',
		})
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

  // INFRASTRUCTURE END

export interface FileResponse {
  data: Blob;
  fileName?: string;
}
  `;
};
