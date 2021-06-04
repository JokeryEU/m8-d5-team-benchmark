import express from "express";
import cors from "cors";
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js";
import listEndpoints from "express-list-endpoints";
import AccommodationRouter from "./services/accommodation/index.js";

const server = express();
server.use(express.json());
server.use(cors());

server.get("/test", (req, res) => {
  res.status(200).send({ message: "Test success!" });
});
server.use("/accommodations", AccommodationRouter);

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(catchAllErrorHandler);

console.log(listEndpoints(server));

export default server;
