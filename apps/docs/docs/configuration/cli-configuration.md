---
sidebar_position: 1
---

# CLI Configuration

REST2TS handles multiple arguments:

```bash
npx rest2ts
  --source https://petstore.swagger.io/v2/swagger.json
  --target ./api
  --generate-for-angular
  --file-name MyApi.ts
```

### --source / -s

Takes url of file to parse.

Accepts json of OpenAPI 2.x or 3.x

#### Example

```bash
 npx rest2ts --source https://petstore.swagger.io/v2/swagger.json
```

### --target / -t

Takes path to the directory where the generated files will be saved.

#### Example

```bash
 npx rest2ts --source https://petstore.swagger.io/v2/swagger.json --target ./generated
```

### --generate-for-angular / -ng

Generates output for Angular with HttpClient and RxJS.

#### Example

```bash
 npx rest2ts --source https://petstore.swagger.io/v2/swagger.json --target ./generated --generate-for-angular
```

### --file-name / -f

Takes name of the generated file.

Default value is `Api.ts`.

#### Example

```bash
 npx rest2ts --source https://petstore.swagger.io/v2/swagger.json --target ./generated --generate-for-angular --file-name MyApi.ts
```

### --prefixes-to-remove / -ptr

When API contains same prefix over and over again, you can use this option to remove it.

For example, if you have `/api/v1/` prefix in your API, you can remove it with this option.

#### Example

```bash
npx rest2ts --source https://petstore.swagger.io/v2/swagger.json --target ./generated --prefixes-to-remove api_,v1_
```

### --cookies

Generates API with cookies auth.

#### Example

```bash
 npx rest2ts --source https://petstore.swagger.io/v2/swagger.json --target ./generated --generate-for-angular --cookies
```

### --help / -h

Shows help.

#### Example

```bash
 npx rest2ts --help
```
