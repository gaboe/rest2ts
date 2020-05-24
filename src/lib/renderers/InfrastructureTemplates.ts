const disclaimer = `
/* eslint-disable */
// THIS FILE WAS GENERATED
// ALL CHANGES WILL BE OVERWRITTEN\n\n`;

export const getInfrastructureTemplate = (tokenKey: string | undefined) => {
  const keyValue = tokenKey ? `"${tokenKey}"` : "undefined";

  return `${disclaimer}// ARCHITECTURE START
type FetchResponse<T> = {
  json: T;
  status: number;
};

const jwtKey: string | undefined = ${keyValue};

async function fetchJson<T>(...args: any): Promise<FetchResponse<T>> {
  const res: Response = await (fetch as any)(...args);
  const json = await res.json();

  return { json: json, status: res.status };
}

const updateHeaders = (headers: Headers) => {
  if (!headers.has("Content-Type")) {
    headers.append("Content-Type", "application/json");
  }
  const token = jwtKey ? localStorage.getItem(jwtKey as any) : undefined;
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

  return fetchJson<TResponse>(\`\${url}?\${queryString}\`);
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
// ARCHITECTURE END
`;
};
