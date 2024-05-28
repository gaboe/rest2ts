---
sidebar_position: 1
---

<!-- const disclaimer = `
/* eslint-disable */
// THIS FILE WAS GENERATED
// ALL CHANGES WILL BE OVERWRITTEN\n\n`.trimStart();

export const getInfrastructureTemplate = (isCookiesAuthEnabled: boolean) => {
  const credentialsTemplate = isCookiesAuthEnabled
    ? `\n\t\tcredentials: "include",`
    : "";

  return `${disclaimer}// ARCHITECTURE START
  type StandardError = globalThis.Error;
  type Error500s = 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;
  type ErrorStatuses = 0 | Error500s;
  export type ErrorResponse = FetchResponse<unknown, ErrorStatuses>

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
  }

  export type FetchResponse<TData, TStatus extends number = 0> =
    TStatus extends ErrorStatuses ? FetchResponseOfError: FetchResponseOfSuccess<TData, TStatus>;

  type Configuration = {
    jwtKey: string | undefined | (() => string | null | undefined);
    onResponse?: (response: FetchResponse<unknown, any>) => void;
  };

  let CONFIG: Configuration = {
    jwtKey: undefined,
    onResponse: () => {},
  };

  export function configureApiCalls(configuration: Configuration) {
    CONFIG = { ...CONFIG, ...configuration };
  }

  async function fetchJson<T extends FetchResponse<unknown, number>>(...args: any): Promise<T> {
    const errorResponse = (error: StandardError, status: number, args: any) => {
      const errorResponse = { status: status as ErrorStatuses, args, data: null, error } satisfies FetchResponse<T>;
      CONFIG.onResponse && CONFIG.onResponse(errorResponse);
      return errorResponse as unknown as T;
    }

    const errorStatus = (args: any) => {
      const errorResponse = { status: 0, args, data: null, error: new Error("Network error") } as FetchResponse<T, Error500s>;
      CONFIG.onResponse && CONFIG.onResponse(errorResponse);
      return errorResponse as unknown as T;
    }

    try {
      const res: Response = await (fetch as any)(...args);
      const status = res.status;
      try {
        const json = await res.json();
        const response = { data: json, status: res.status, args, error: null, responseHeaders: res.headers };
        CONFIG.onResponse && CONFIG.onResponse(response);
        return response as unknown as T;
      }
      catch (error){
        return errorResponse(error as StandardError, status, args)
      }
    } catch {
      return errorStatus(args);
    }
  }

  function getToken(): string | null | undefined {
    if (typeof CONFIG.jwtKey === 'function') {
      return CONFIG.jwtKey();
    }

    if (typeof CONFIG.jwtKey === 'string') {
      return localStorage.getItem(CONFIG.jwtKey);
    }

    return undefined;
  }

  function updateHeaders(headers: Headers) {
    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }
    const token = getToken();
    if (!headers.has("Authorization") && token) {
      headers.append("Authorization", token);
    }
  };

function getQueryParamsString(paramsObject: ParamsObject = {}) {
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

function apiPost<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  var raw = JSON.stringify(request);
  updateHeaders(headers);
  var requestOptions = {
    method: "POST",
    headers,
    body: raw,
    redirect: "follow",${credentialsTemplate}
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>(\`\${url}\${maybeQueryString}\`, requestOptions as any);
}

type ParamsObject = {
  [key: string]: any;
};

function apiGet<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const maybeQueryString = getQueryParamsString(paramsObject);
  const requestOptions = {
    method: "GET",
    headers,
    redirect: "follow",${credentialsTemplate}
  };
  return fetchJson<TResponse>(\`\${url}\${maybeQueryString}\`, requestOptions);
}

function apiPut<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  var raw = JSON.stringify(request);

  var requestOptions = {
    method: "PUT",
    headers,
    body: raw,
    redirect: "follow",${credentialsTemplate}
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>(\`\${url}\${maybeQueryString}\`, requestOptions as any);
}

function apiDelete<TResponse extends FetchResponse<unknown, number>>(
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
    redirect: "follow",${credentialsTemplate}
  };
  return fetchJson<TResponse>(\`\${url}\${maybeQueryString}\`, requestOptions);
}

function apiPatch<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  var raw = JSON.stringify(request);

  var requestOptions = {
    method: "PATCH",
    headers,
    body: raw,
    redirect: "follow",${credentialsTemplate}
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>(\`\${url}\${maybeQueryString}\`, requestOptions as any);
}
// ARCHITECTURE END
`;
}; -->

# Fetch

REST2TS is using the Fetch API to make requests. Fetch is a modern replacement for XMLHttpRequest. It is a promise-based API that returns a Response object.

To add a middleware to the fetch request, you can use the `onResponse` function. It will be called after the response is received.

```typescript
type Configuration = {
  jwtKey: string | undefined | (() => string | null | undefined);
  onResponse?: (response: FetchResponse<unknown, any>) => void;
};
```
