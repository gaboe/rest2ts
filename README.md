# <span style="background: linear-gradient(90deg, #6bff25 41%, #1366ea 56%); -webkit-background-clip: text; color: transparent;">REST2TS</span>

![NPM Version](https://img.shields.io/npm/v/rest2ts?color=%23CB3837)
![JSR Version](https://img.shields.io/jsr/v/%40gaboe/rest2ts?color=%23F7DF1E)

## Generate modern TypeScript types from REST APIs

## 🚀 Usage

```bash
npx rest2ts -s https://petstore.swagger.io/v2/swagger.json -t ./api
```

## 📖 Docs

👉 [https://gaboe.github.io/rest2ts/](https://gaboe.github.io/rest2ts/) 👈

## 🤝 Support

<a href="https://www.buymeacoffee.com/gaboe"><img src="https://img.buymeacoffee.com/button-api/?text=Coffee for TS types&emoji=☕&slug=gaboe&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>

<a href="https://gaboe.github.io/rest2ts/docs/support/donate"><img src="https://img.buymeacoffee.com/button-api/?text=Donate bitcoin&emoji=⚡&slug=gaboe&button_colour=ffffff&font_colour=000000&font_family=Inter&outline_colour=000000&coffee_colour=FFDD00" /></a>

## 📦 Contribution

1. Clone the repository

2. At root level run

```bash
pnpm i
```

3. Change the at /apps/cli

4. Write test for your change or test them with

```bash
pnpm test
```

if you want to change snapshot run

```bash
pnpm test:snapshot:update
```
