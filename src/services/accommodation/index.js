import express from "express";
import AccommodationSchema from "../../models/accommodation/index.js";
import mongoose from "mongoose";
import q2m from "query-to-mongo";

const { Router } = express;

const router = new Router();

router.get("/", async (req, res) => {
  const products = await AccommodationSchema.find({});
  res.status(200).send({ products });
});

router.get("/:id", async (req, res) => {
  const product = await AccommodationSchema.findById(req.params.id);
  if (!product) return res.status(404).send({ message: "not found" });
  res.status(200).send({ product });
});

router.delete("/:id", async (req, res) => {
  const product = await AccommodationSchema.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).send({ message: "not found" });
  res.status(204).send();
});

router.post("/", async (req, res) => {
  try {
    const { description, price } = req.body;

    if (!description || !price) throw new Error("Invalid data");

    const product = new AccommodationSchema({ description, price });
    await product.save();

    res.status(201).send(product);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
