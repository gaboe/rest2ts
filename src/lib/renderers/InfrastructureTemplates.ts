const disclaimer = `
/* eslint-disable */
// THIS FILE WAS GENERATED
// ALL CHANGES WILL BE OVERWRITTEN\n\n`;

export const getInfrastructureTemplate = () => {
  return `${disclaimer}// ARCHITECTURE START
  type FetchResponse<T> = {
    json: T;
    status: number;
  };
  
  type Configuration = {
    jwtKey: string | undefined;
    onResponse?: (response: FetchResponse<any>) => void;
  };
  
  let CONFIG: Configuration = {
    jwtKey: undefined,
    onResponse: () => {},
  };
  
  export function configureApiCalls(configuration: Configuration) {
    CONFIG = { ...CONFIG, ...configuration };
  }
  
  async function fetchJson<T>(...args: any): Promise<FetchResponse<T>> {
    const errorResponse = (status: number) => {
      const errorResponse = { status: status, json: null as any };
      CONFIG.onResponse && CONFIG.onResponse(errorResponse);
      return errorResponse;
    }

    try {
      const res: Response = await (fetch as any)(...args);
      try {
        const json = await res.json();
        const response = { json: json, status: res.status };
        CONFIG.onResponse && CONFIG.onResponse(response);
        return response;
      }
      catch {
        return errorResponse(res.status)
      }
    } catch {
      return errorResponse(503);
    }
  }
  
  const updateHeaders = (headers: Headers) => {
    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }
    const token = CONFIG.jwtKey
      ? localStorage.getItem(CONFIG.jwtKey as any)
      : undefined;
    if (!headers.has("Authorization") && token) {
      headers.append("Authorization", token);
    }
  };

function apiPost<TResponse, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers
) {
  var raw = JSON.stringify(request);
  updateHeaders(headers);
  var requestOptions = {
    method: "POST",
    headers,
    body: raw,
    redirect: "follow",
  };

  return fetchJson<TResponse>(url, requestOptions as any);
}

type ParamsObject = {
  [key: string]: any;
};

function apiGet<TResponse>(
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
  const requestOptions = {
    method: "GET",
    headers,
    redirect: "follow",
  };
  return fetchJson<TResponse>(\`\${url}\${maybeQueryString}\`, requestOptions);
}

function apiPut<TResponse, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers
) {
  updateHeaders(headers);

  var raw = JSON.stringify(request);

  var requestOptions = {
    method: "PUT",
    headers,
    body: raw,
    redirect: "follow",
  };

  return fetchJson<TResponse>(url, requestOptions as any);
}

function apiDelete<TResponse>(
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

  var requestOptions = {
    method: "DELETE",
    headers,
    redirect: "follow",
  };
  return fetchJson<TResponse>(\`\${url}\${maybeQueryString}\`, requestOptions);
}

function apiPatch<TResponse, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers
) {
  updateHeaders(headers);

  var raw = JSON.stringify(request);

  var requestOptions = {
    method: "PATCH",
    headers,
    body: raw,
    redirect: "follow",
  };

  return fetchJson<TResponse>(url, requestOptions as any);
}
// ARCHITECTURE END
`;
};

export const getAngularInfrastructureTemplate = () => {
  return `${disclaimer}// ARCHITECTURE START

import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

type ResponseResult<T, U extends number = 0> = {
  status: U;
  response: U extends 0 ? unknown : T;
};

function createQueryUrl<K extends object>(url: string, paramsObject: K) {
  const queryString = Object.entries(paramsObject)
    .map(([key, val]) => \`\${key}=\${val}\`)
    .join("&");
  const maybeQueryString = queryString.length > 0 ? \`?\${queryString}\` : "";
  return \`\${url}\${maybeQueryString}\`;
}

function apiGet<T extends ResponseResult<unknown, number>, U extends object = object>(
	httpClient: HttpClient,
	url: string,
	params?: U,
): Observable<T | never> {
	const queryUrl = !!params ? createQueryUrl<U>(url, params) : url;
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
					return of({ status: err.status, response: err.error }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiPost<T extends ResponseResult<unknown, number>, U = unknown>(
	httpClient: HttpClient,
	url: string,
	body: U,
): Observable<T | never> {
	return httpClient
		.post<HttpResponse<T['response']>>(url, body, {
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
					return of({ status: err.status, response: err.error }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiPut<T extends ResponseResult<unknown, number>, U = unknown>(
	httpClient: HttpClient,
	url: string,
	body: U,
): Observable<T | never> {
	return httpClient
		.put<HttpResponse<T['response']>>(url, body, {
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
					return of({ status: err.status, response: err.error }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiDelete<T extends ResponseResult<unknown, number>, U extends object = object>(
	httpClient: HttpClient,
	url: string,
	params?: U,
) {
	const queryUrl = !!params ? createQueryUrl<U>(url, params) : url;
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
					return of({ status: err.status, response: err.error }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiPatch<T extends ResponseResult<unknown, number>, U = unknown>(
	httpClient: HttpClient,
	url: string,
	body: U,
): Observable<T | never> {
	return httpClient
		.patch<HttpResponse<T['response']>>(url, body, {
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
					return of({ status: err.status, response: err.error }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

  // ARCHITECTURE END
  `;
};
