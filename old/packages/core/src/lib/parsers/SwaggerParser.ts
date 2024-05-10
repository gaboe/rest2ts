// import SwaggerParser from "@apidevtools/swagger-parser";
// import { Maybe } from "purify-ts";

// async function parseSwagger(source: string) {
//   try {
//     const api = await SwaggerParser.parse(source);
//     return Maybe.of(api);
//   } catch (err) {
//     return Maybe.empty();
//   }

//   // , async (err, api) => {
//   //   if (err) {
//   //     return err;
//   //     // console.error(err);
//   //     // process.exit(1);
//   //   } else if (api) {
//   //     return Just(api);
//   //   } else {
//   //     // console.error(`Something went wrong`);

//   //     // process.exit(1);
//   //     return new Error("Something went wrong");
//   //   }
//   // });
// }
