# Rest2ts

Rest2ts is a simple npm library that generates TypeScript client code from a Swagger/OpenAPI definition file. It allows you to create type-safe API clients for your projects.

## Features

- Generates TypeScript code from Swagger/OpenAPI definition files
- Supports nullable strings with the \`nullstr\` flag
- Optional base URL setting for generated code

## Installation

To install the library, run the following command:

```bash
npm install -g rest2ts
```

## Usage

To generate TypeScript code from a Swagger/OpenAPI definition file, use the following command:

```bash
rest2ts -s path/to/swagger.json -t target/path
```

### Command-line Options

- `-h, --help`: Displays help information
- `-s, --source`: Path to the Swagger/OpenAPI definition file
- `-t, --target`: Target path for generated TypeScript code
- `-v, --urlValue`: Base URL value used in generated code, can be a string or a node global value
- `-f, --fileName`: Output file name. Default file name is Api.ts.
- `--nullstr, --areNullableStringsEnabled`: Enable or disable nullable strings. Set to 1 to enable and 0 to disable.
- `--ng, --generateForAngular`: Set to 1 to generate Typescript code for Angular with HttpClient and Rxjs. UrlValue is provided by API_BASE_URL InjectionToken.

### Example

```bash
rest2ts -s https://api.example.com/swagger.json -t ./src/api
```

## Generated Code

The generated TypeScript code will be placed in the target directory specified by the \`-t\` flag. The file will be named \`Api.ts\`.

## Contributing

We welcome contributions to Rest2ts. If you find a bug or have a feature request, please open an issue on the repository.

## License

Rest2ts is released under the MIT License.
