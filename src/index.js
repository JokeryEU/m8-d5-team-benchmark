import mongoose from "mongoose";
import server from "./server.js";

const port = process.env.PORT || 3002;

mongoose
  .connect(process.env.ATLAS_URL + "/data", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to Atlas!");
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => console.trace(error));
