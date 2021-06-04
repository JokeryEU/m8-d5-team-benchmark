import express from "express";
import AccommodationSchema from "../../models/accommodation/index.js";
import mongoose from "mongoose";
import q2m from "query-to-mongo";

const { Router } = express;

const router = new Router();

router.get("/", async (req, res, next) => {
  try {
    if (Object.keys(req.query).length > 0) {
      const query = q2m(req.query);
      const total = await AccommodationSchema.countDocuments(query.criteria);
      const accommodations = await AccommodationSchema.find(
        {
          name: {
            $regex: new RegExp(query.criteria.name, "i"),
          },
          city: {
            $regex: new RegExp(query.criteria.city, "i"),
          },
        },
        query.options.fields
      )
        .skip(query.options.skip)
        .limit(query.options.limit)
        .sort(query.options.sort);

      res.status(200).send({
        links: query.links("/accommodations", total),
        accommodations,
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const accommodations = await AccommodationSchema.find({});
    res.status(200).send({ accommodations });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const accommodation = await AccommodationSchema.findById(req.params.id);
    if (!accommodation) return res.status(404).send({ message: "not found" });
    res.status(200).send({ accommodation });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const accommodation = await AccommodationSchema.findByIdAndDelete(
      req.params.id
    );
    if (!accommodation) return res.status(404).send({ message: "not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description, maxGuests, city } = req.body;

    if (!description || !maxGuests || !name || !city)
      throw new Error("Invalid data");

    const accommodation = new AccommodationSchema({
      name,
      description,
      maxGuests,
      city,
    });
    await accommodation.save();

    res.status(201).send(accommodation);
  } catch (error) {
    res.status(400).send({ message: error.message });
    next(error);
  }
});

export default router;
