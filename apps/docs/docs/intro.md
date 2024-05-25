---
sidebar_position: 1
---

# Intro

## Motivation

Do you know that feeling, when you try to generate Typescript types from API, but the type generator

❌ requires you to install some Java files on your machine

❌ is hard to integrate in your project

❌ doesn't handle your complex types

❌ is slowly generating whole folder structure

❌ can't handle nullable types or enums

...

✅ And that's why REST2TS was created.

## Setup

✅ You need to have node.js installed (which you already probably have).

So just run:

```bash
npx rest2ts --source https://petstore.swagger.io/v2/swagger.json --target ./api -v "'https://petstore.swagger.io/v2'"
```

✅ Integrate this script into your package.json > scripts like this

```json
"generate-types": "npx rest2ts --source https://petstore.swagger.io/v2/swagger.json --target ./api -v \"https://petstore.swagger.io/v2\""
```

Run from project root

```bash
npm generate-types
```

and types from https://petstore.swagger.io/v2/swagger.json will be generated into ./api folder.

✅ REST2TS generates whole api into one file. Let's keep it simple.

✅ Generates complex return type, handles nullability and enums.
