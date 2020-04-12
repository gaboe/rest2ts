import test from "ava";
import fetch from "node-fetch";

(global as any).Headers = (fetch as any).Headers;
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

function apiGet<TResponse>(url: string, headers: Headers, ...params: string[]) {
  headers.append("Content-Type", "application/json");
  var queryString = Object.keys(params)
    .map((key) => {
      return (
        encodeURIComponent(key) + "=" + encodeURIComponent(params[key as any])
      );
    })
    .join("&");
  return fetchJson<TResponse>(url + queryString);
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
  body: string;
};

test("get to web api", async (t) => {
  var response = await apiGet<HttpResponse>(
    "https://jsonplaceholder.typicode.com/todos/1",
    new Headers()
  );
  t.deepEqual(response.status, 200);
  t.deepEqual(response.json.userId, 1);
  t.pass();
});

// test("post to web api", async (t) => {
//   var response = await apiPost<HttpResponse, HttpRequest>(
//     "https://jsonplaceholder.typicode.com/posts",
//     {
//       body: "test test test",
//       title: "test",
//       userId: 666,
//     },
//     new Headers()
//   );

//   t.deepEqual(response.status, 201);
//   t.deepEqual(response.json.userId, 666);
//   t.deepEqual(response.json.title, "test");
//   t.deepEqual(response.json.body, "test test test");
//   t.pass();
// });
