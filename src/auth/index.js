import { verifyJWT } from "./tools.js";
import UserModel from "../models/users/schema.js";

export const jwtAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    // const token = req.cookies.accessToken;
    const decoded = await verifyJWT(token);
    const user = await UserModel.findOne({
      _id: decoded._id,
    });
    if (!user) {
      throw new Error("Credentials are incorect");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const hostOnly = (req, res, next) => {
  if (req.user && req.user.role === "Host") {
    next();
  } else {
    const error = new Error("Host Only");
    error.httpStatusCode = 403;
    next(error);
  }
};
