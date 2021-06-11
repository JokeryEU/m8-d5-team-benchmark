import mongoose from "mongoose";
const { Schema } = mongoose;

const AccommodationsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default AccommodationsSchema;
