---
sidebar_position: 1
---

# Setup

## Generate types

✅ You need to have node.js installed (which you already probably have).

So just run:

```bash
npx rest2ts --source https://petstore.swagger.io/v2/swagger.json --target ./api
```

<details>
  <summary>Integrate this script into your package.json</summary>

Go to your package.json and add this script to your scripts section:

```json
"generate-types": "npx rest2ts --source https://petstore.swagger.io/v2/swagger.json --target ./api
```

Run from project root

```bash
npm generate-types
```

and types from https://petstore.swagger.io/v2/swagger.json will be generated into ./api folder. Forever.

</details>

## Configure fetching

```tsx
import { configureApiCalls, FetchResponse } from "Api/Api";

function App() {
  configureApiCalls({
    apiUrl: "https://api.example.com",
  });

  <>Your app</>;
}
```
