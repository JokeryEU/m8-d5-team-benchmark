import express from "express";
import cors from "cors";
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
  unauthorizedErrorHandler,
} from "./errorHandlers.js";
import ErrorResponse from "./lib/errorResponse.js";
import listEndpoints from "express-list-endpoints";
import AccommodationsRouter from "./services/accommodation/index.js";
import UserRouter from "./services/users/users.js";
import AuthRouter from "./services/auth.js";
import * as OpenApiValidator from "express-openapi-validator";
import cookieParser from "cookie-parser";
import { jwtAuth } from "./auth/index.js";
import passport from "passport";
import oauth from "./auth/oauth.js";
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
      callback(new ErrorResponse(`NOT ALLOWED BY CORS`, 403));
    }
  },
};

server.use(cors({ origin: "http://localhost:3000", credentials: true }));
server.use(cookieParser());
server.use(passport.initialize());

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
server.use("/", AuthRouter);
server.use("/user", jwtAuth, UserRouter);
server.use("/accommodation", jwtAuth, AccommodationsRouter);

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(catchAllErrorHandler);

console.log(listEndpoints(server));

export default server;
