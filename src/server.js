import express from "express";
import cors from "cors";
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js";
import listEndpoints from "express-list-endpoints";
import AccommodationsRouter from "./services/accommodation/index.js";
import * as OpenApiValidator from "express-openapi-validator";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const apiSpec = path.join(__dirname, "api.yaml");

const server = express();
server.use(express.json());

const whitelist = [process.env.FE_URL_DEV, process.env.FE_URL_PROD];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

server.use(cors());

server.use("/spec", express.static(apiSpec));

// server.use(
//   OpenApiValidator.default.middleware({
//     apiSpec,
//     validateRequests: true,
//     validateResponses: true,
//   })
// );

server.get("/test", (req, res) => {
  res.status(200).send({ message: "Test success!" });
});
server.use("/accommodation", AccommodationsRouter);

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(catchAllErrorHandler);

console.log(listEndpoints(server));

export default server;
