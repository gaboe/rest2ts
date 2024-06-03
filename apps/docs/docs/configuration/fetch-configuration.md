---
sidebar_position: 2
---

# Fetch Configuration

```tsx
type Configuration = {
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
```

## apiUrl

This is the base URL of your API. It can be a string or a function that returns a string. This is useful when you need to change the base URL based on the environment.

```tsx
configureApiCalls({
  apiUrl: () => import.meta.env.VITE_API_URL,
});
```

## jwtKey

This is the key in the local storage where the JWT token is stored. It can be a string, or a function that returns a string.

```tsx
configureApiCalls({
  jwtKey: () => localStorage.getItem("jwt"),
});
```

## requestMiddlewares

This is an array of functions that modify the request before it is sent. Each function receives the request object and returns the modified request object. If the function returns `TerminateRequest`, the request is not sent.

```tsx
configureApiCalls({
  requestMiddlewares: [
    {
      name: "Add JWT token",
      fn: (request) => {
        const jwt = localStorage.getItem("jwt");
        if (jwt) {
          request.headers["Authorization"] = `Bearer ${jwt}`;
        }
        return request;
      },
    },
  ],
});
```

## responseMiddlewares

This is an array of functions that modify the response before it is returned. Each function receives the response object and returns the modified response object. If the function returns `TerminateResponse`, the response is not returned.

```tsx
configureApiCalls({
  responseMiddlewares: [
    {
      name: "Handle 401",
      fn: (response) => {
        if (response.status === 401) {
          alert("You are not authorized");
          return TerminateResponse;
        }
        return response;
      },
    },
  ],
});
```

## Example

```tsx
import { configureApiCalls, FetchResponse } from "Api/Api";

function App() {
  configureApiCalls({
    apiUrl: "https://api.example.com",
    jwtKey: "jwt",
    requestMiddlewares: [
      {
        name: "Add JWT token",
        fn: (request) => {
          const jwt = localStorage.getItem("jwt");
          if (jwt) {
            request.headers["Authorization"] = `Bearer ${jwt}`;
          }
          return request;
        },
      },
    ],
    responseMiddlewares: [
      {
        name: "Handle 401",
        fn: (response) => {
          if (response.status === 401) {
            alert("You are not authorized");
            return TerminateResponse;
          }
          return response;
        },
      },
    ],
  });

  <>Your app</>;
}
```
