import jwt from "jsonwebtoken";
import UserModel from "../models/users/schema.js";

const generateJWT = (user) =>
  new Promise((res, rej) =>
    jwt.sign(
      user,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
      (error, token) => {
        if (error) rej(error);
        res(token);
      }
    )
  );

export const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error) rej(error);
      res(decoded);
    })
  );

const generateRefreshJWT = (user) =>
  new Promise((res, rej) =>
    jwt.sign(
      user,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
      (error, token) => {
        if (error) rej(error);
        res(token);
      }
    )
  );

const verifyRefreshToken = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
      if (error) rej(error);
      res(decoded);
    })
  );

export const auth = async (user) => {
  const newAccessToken = await generateJWT({ _id: user._id });
  const newRefreshToken = await generateRefreshJWT({ _id: user._id });
  user.refreshToken = newRefreshToken;
  await user.save();
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const refreshJWT = async (oldRefreshToken) => {
  const decoded = await verifyRefreshToken(oldRefreshToken);

  const user = await UserModel.findOne({ _id: decoded._id });

  if (!user) {
    throw new Error("Try again");
  }
  const refreshToken = user.refreshToken;

  if (refreshToken !== oldRefreshToken) {
    throw new Error("Login again");
  }

  const newAccessToken = await generateJWT({ _id: user._id });
  const newRefreshToken = await generateRefreshJWT({ _id: user._id });

  user.refreshToken = newRefreshToken;
  await user.save();
  return { token: newAccessToken, refreshToken: newRefreshToken };
};
