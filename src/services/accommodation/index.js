import express from "express";
import AccommodationsSchema from "../../models/accommodation/index.js";
import mongoose from "mongoose";
import q2m from "query-to-mongo";
import { hostOnly } from "../../auth/index.js";

const { Router } = express;

const router = new Router();

router.get("/", async (req, res, next) => {
  try {
    if (Object.keys(req.query).length > 0) {
      const query = q2m(req.query);
      const total = await AccommodationsSchema.countDocuments(query.criteria);
      const accommodations = await AccommodationsSchema.find(
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
    const accommodations = await AccommodationsSchema.find().populate("host");
    res.status(200).send({ accommodations });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const accommodation = await AccommodationsSchema.findById(req.params.id);
    if (!accommodation) return res.status(404).send({ message: "not found" });
    res.status(200).send({ accommodation });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", hostOnly, async (req, res, next) => {
  try {
    const accommodation = await AccommodationsSchema.findByIdAndDelete(
      req.params.id
    );
    if (!accommodation) return res.status(404).send({ message: "not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/", hostOnly, async (req, res, next) => {
  try {
    const { name, description, maxGuests, city } = req.body;

    const accommodation = new AccommodationsSchema({
      name,
      description,
      maxGuests,
      city,
      host: req.user._id,
    });
    await accommodation.save();

    res.status(201).send(accommodation);
  } catch (error) {
    res.status(400).send({ message: error.message });
    next(error);
  }
});

router.put("/:id", hostOnly, async (req, res, next) => {
  try {
    const accommodation = await AccommodationsSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    if (accommodation) {
      res.status(200).send(accommodation);
    } else {
      const error = new Error(
        `The accommodation with id ${req.params.id} was not found`
      );
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

export default router;
