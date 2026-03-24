const { generateApi } = require("swagger-typescript-api");
const path = require("path");

generateApi({
  url: "http://localhost:8000/openapi.json",
  output: path.resolve(__dirname, "../generated"),
  generateClient: true,
  httpClientType: "axios",
  modular: true,
  cleanOutput: true,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
