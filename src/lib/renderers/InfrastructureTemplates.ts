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
    const res: Response = await (fetch as any)(...args);
    const json = await res.json();
    const response = { json: json, status: res.status };
    CONFIG.onResponse && CONFIG.onResponse(response);
    return response;
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
// ARCHITECTURE END
`;
};
