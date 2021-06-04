import mongoose from "mongoose";
import AccommodationsSchema from "./schema.js";
const { model } = mongoose;

export default model("accommodations", AccommodationsSchema);
