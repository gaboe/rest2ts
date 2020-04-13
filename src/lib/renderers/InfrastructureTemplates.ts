export const infrastructureTemplate = `
// ARCHITECTURE START
type FetchResponse<T> = {
  json: T;
  status: number;
};

async function fetchJson<T>(...args: any): Promise<FetchResponse<T>> {
  const res: Response = await (fetch as any)(...args);
  const json = await res.json();

  return { json: json, status: res.status };
}

function apiPost<TResponse, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers
) {
  var headers = new Headers();
  headers.append("Content-Type", "application/json");

  var raw = JSON.stringify(request);

  var requestOptions = {
    method: "POST",
    headers,
    body: raw,
    redirect: "follow",
  };

  return fetchJson<TResponse>(url, requestOptions as any);
}

type ParamsObject = {
  [ket: string]: any;
};

function apiGet<TResponse>(
  url: string,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  headers.append("Content-Type", "application/json");
  const queryString = Object.entries(paramsObject)
    .map(([key, val]) => \`\${key}=\${val}\`)
    .join("&");

  return fetchJson<TResponse>(url + queryString);
}
// ARCHITECTURE END
`;
