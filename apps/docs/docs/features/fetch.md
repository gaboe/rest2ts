---
sidebar_position: 1
---

# Fetch

REST2TS is using the Fetch API to make requests. Fetch is a modern replacement for XMLHttpRequest. It is a promise-based API that returns a Response object.

To add a middleware to the fetch request, you can use the `onResponse` function. It will be called after the response is received.

```typescript
type Configuration = {
  jwtKey: string | undefined | (() => string | null | undefined);
  onResponse?: (response: FetchResponse<unknown, any>) => void;
};
```
