import express from "express";
import UserModel from "../../models/users/schema.js";
import AccommodationsSchema from "../../models/accommodation/index.js";
import { hostOnly } from "../../auth/index.js";

const { Router } = express;

const router = new Router();

router.get("/", hostOnly, async (req, res, next) => {
  try {
    const users = await UserModel.find();
    res.status(200).send({ users });
  } catch (error) {
    next(error);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    console.log("THIS IS MEEEEEE");
    console.log(req.user);

    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", hostOnly, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).send({ message: "not found" });
    res.status(200).send({ user });
  } catch (error) {
    next(error);
  }
});

router.get("/me/accommodation", hostOnly, async (req, res, next) => {
  try {
    const { _id } = req.user;

    const accommodations = await AccommodationsSchema.find({ host: _id });
    console.log(accommodations);
    res.send({ accommodations });
  } catch (error) {
    next(error);
  }
});

router.put("/me", async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);

    updates.forEach((u) => (req.user[u] = req.body[u]));

    await req.user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.delete("/me", async (req, res, next) => {
  try {
    await req.user.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
