import test from "ava";
import fetch from "node-fetch";
import express, { json } from "express";
import http from "http";
import listen from "test-listen";

(global as any).Headers = (fetch as any).Headers;

// ARCHITECTURE START
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
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
  const maybeQueryString = queryString.length > 0 ? `?${queryString}` : "";

  const requestOptions = {
    method: "GET",
    headers,
    redirect: "follow",
  };
  return fetchJson<TResponse>(`${url}${maybeQueryString}`, requestOptions);
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
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
  const maybeQueryString = queryString.length > 0 ? `?${queryString}` : "";
  const requestOptions = {
    method: "DELETE",
    headers,
    redirect: "follow",
  };
  return fetchJson<TResponse>(`${url}${maybeQueryString}`, requestOptions);
}
// ARCHITECTURE END

type HttpResponse = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

type HttpRequest = {
  userId: number;
  title: string;
};

const runExpress = (port: number) => {
  const app = express();
  app.use(express());
  app.use(json());

  app.get("/language/", (req, res) => {
    const languageCode = req.query.languageCode;
    if (languageCode === "cs") {
      res.status(200);
      return res.json({
        language: "Czech",
      });
    }
    res.status(500);
    return res.json({ error: new Error("Language not found") });
  });

  app.get("/todos/:id", (req, res) =>
    res.json({
      userId: 1,
    })
  );

  app.delete("/todos/:id", (req, res) =>
    res.json({
      userId: 0,
    })
  );

  app.put("/todo/", (req, res) => {
    const { userId, title } = req.body;

    return res.json({
      userId,
      title: `${title}++`,
    });
  });

  app.post("/todo/", (req, res) => {
    const { userId, title } = req.body;

    res.status(201);
    return res.json({
      userId,
      title,
    });
  });

  app.listen(port);
  return app;
};

test("get to web api", async (t) => {
  const url = await listen(http.createServer(runExpress(3000)));
  const response = await apiGet<HttpResponse>(
    `${url}/todos/1`,
    new Headers(),
    {}
  );
  t.deepEqual(response.status, 200);
  t.deepEqual(response.json.userId, 1);
});

test("get with query to web api", async (t) => {
  const url = await listen(http.createServer(runExpress(3001)));
  t.log(url);
  const response = await apiGet<{ language: string }>(
    `${url}/language`,
    new Headers(),
    { languageCode: "cs" }
  );
  t.deepEqual(response.status, 200);
  t.deepEqual(response.json.language, "Czech");
});

test("post to web api", async (t) => {
  const url = await listen(http.createServer(runExpress(3002)));
  var response = await apiPost<HttpResponse, HttpRequest>(
    `${url}/todo`,
    {
      title: "test",
      userId: 666,
    },
    new Headers()
  );

  t.deepEqual(response.status, 201);
  t.deepEqual(response.json.userId, 666);
  t.deepEqual(response.json.title, "test");
});

test("put to web api", async (t) => {
  const url = await listen(http.createServer(runExpress(3003)));
  var response = await apiPut<HttpResponse, HttpRequest>(
    `${url}/todo`,
    {
      title: "test",
      userId: 666,
    },
    new Headers()
  );

  t.deepEqual(response.status, 200);
  t.deepEqual(response.json.userId, 666);
  t.deepEqual(response.json.title, "test++");
});

test("delete with query to web api", async (t) => {
  const url = await listen(http.createServer(runExpress(3004)));
  const response = await apiDelete<HttpResponse>(
    `${url}/todos/1`,
    new Headers(),
    {}
  );
  t.deepEqual(response.status, 200);
  t.deepEqual(response.json.userId, 0);
});
