import dotenv from "dotenv";
import supertest from "supertest";
import server from "../src/server";
import mongoose from "mongoose";
import AccommodationsSchema from "../src/models/accommodation/index.js";
dotenv.config();

const request = supertest(server);

beforeAll((done) => {
  console.log(process.env.ATLAS_URL);
  mongoose
    .connect(process.env.ATLAS_URL + "/test", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log("Successfully connected to Atlas in test.");
      done();
    });
});

afterAll((done) => {
  mongoose.connection.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

describe("Stage I - Testing the atlas env", () => {
  it("should expect that the mongodb link is not empty", () => {
    expect(process.env.ATLAS_URL).toBeDefined();
  });
});

describe("Checking application main endpoints", () => {
  it("should check that the /test endpoint is working", async () => {
    const response = await request.get("/test");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Test success!");
  });

  it("should check that the get /accommodation endpoint is working", async () => {
    const response = await request.get("/accommodation");
    expect(response.status).toBe(200);

    expect(response.body.accommodations).toBeDefined();
    expect(response.body.accommodations.length).toBe(0);
  });

  const validData = {
    name: "Paradise Hotel",
    description: "A paradise",
    maxGuests: 30,
    city: "Paris",
  };

  it("should check that the /accommodation endpoint is allowing POST requests with valid data", async () => {
    const response = await request.post("/accommodation").send(validData);

    expect(response.status).toBe(201);
    expect(response.body._id).toBeDefined();
    expect(response.body.description).toEqual(validData.description);
  });

  const invalidData = {
    description: "Description test",
    maxGuests: 0,
  };

  it("should check that the /accommodation endpoint is NOT allowing POST requests with invalid data", async () => {
    const response = await request.post("/accommodation").send(invalidData);
    expect(response.status).toBe(400);
    expect(response.body._id).not.toBeDefined();
  });

  it("should test that the /accommodation endpoint is returning valid data after creating", async () => {
    const response = await request.post("/accommodation").send(validData);

    const accommodation = await AccommodationsSchema.findById(
      response.body._id
    );

    expect(response.body._id).toBeDefined();

    expect(accommodation.createdAt).toStrictEqual(
      new Date(response.body.createdAt)
    );
  });

  it("should test that the /accommodation endpoint is returning all the accommodation available", async () => {
    const accommodationResponse = await request
      .post("/accommodation")
      .send(validData);

    const response = await request.get("/accommodation");

    const included = response.body.accommodations.some(
      (accommodation) => accommodation._id === accommodationResponse.body._id
    );

    expect(included).toBe(true);
  });

  it("should test that status code is correct for not found /accommodation/:id", async () => {
    const params = "101010101010101010010100";

    const response = await request.get("/accommodation/" + params);

    const accommodation = await AccommodationsSchema.findById(params);
    if (!accommodation) return expect(response.status).toBe(404);
  });

  it("should test that the delete endpoint /accommodation/:id checking if it was deleted and if still exists", async () => {
    const accommodation = await AccommodationsSchema.create(validData);
    const { _id } = accommodation;

    const response = await request.delete("/accommodation/" + _id);
    expect(response.status).toBe(204);

    const ifExists = await AccommodationsSchema.findById(_id);
    expect(ifExists).toBe(null);
  });

  const modifiedData = {
    description: "Description test modified",
    maxGuests: 1,
  };

  it("should test that the put endpoint /accommodation/:id is modifying the accommodation and returning the correct status code", async () => {
    const res = await request.post("/accommodation").send(validData);
    const id = res.body._id;
    const accommodation = await request.put(`/accommodation/${id}`);

    const upData = await AccommodationsSchema.findByIdAndUpdate(
      accommodation.body._id,
      modifiedData,
      {
        runValidators: true,
        new: true,
      }
    );

    expect(accommodation.status).toBe(200);
    expect(accommodation.body.updatedAt).not.toStrictEqual(
      new Date(upData.updatedAt)
    );
  });
});
