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

  import { mergeMap, catchError } from 'rxjs/operators';
  import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
  import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
  import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase, HttpContext } from '@angular/common/http';

  function createQueryUrl<K extends object>(url: string, paramsObject: K) {
    const queryString = Object.entries(paramsObject)
      .map(([key, val]) => \`\${key}=\${val}\`)
      .join("&");
    const maybeQueryString = queryString.length > 0 ? \`?\${queryString}\` : "";
    return \`\${url}\${maybeQueryString}\`;
}

  function apiGet<T, U extends object = object>(
    httpClient: HttpClient,
    url: string,
    params?: U,
  ): Observable<T | never> {
    const queryUrl = !!params ? createQueryUrl<U>(url, params) : url;
    return httpClient.get<T>(queryUrl);
  }
  
  function apiPost<T, U = unknown>(
    httpClient: HttpClient,
    url: string,
    body: U,
    headers?: HttpHeaders,
  ): Observable<T | never> {
    return httpClient.post<T>(url, body, {
      headers: headers,
    });
  }
  
  function apiPut<T, U = unknown>(
    httpClient: HttpClient,
    url: string,
    body: U,
    headers?: HttpHeaders,
  ): Observable<T | never> {
    return httpClient.put<T>(url, body, {
      headers: headers,
    });
  }

  function apiDelete<T, U extends object = object>(httpClient: HttpClient, url: string, params?: U) {
    const queryUrl = !!params ? createQueryUrl<U>(url, params) : url;
    return httpClient.delete<T>(queryUrl);
  }

  function apiPatch<T, U = unknown>(
    httpClient: HttpClient,
    url: string,
    body: U,
    headers?: HttpHeaders,
  ): Observable<T | never> {
    return httpClient.patch<T>(url, body, {
      headers: headers,
    });
  }

  // ARCHITECTURE END
  `;
};
