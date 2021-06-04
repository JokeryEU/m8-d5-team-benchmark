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

  it("should check that the get /accommodations endpoint is working", async () => {
    const response = await request.get("/accommodations");
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

  it("should check that the /accommodations endpoint is allowing POST requests with valid data", async () => {
    const response = await request.post("/accommodations").send(validData);

    expect(response.status).toBe(201);
    expect(response.body._id).toBeDefined();
    expect(response.body.description).toEqual(validData.description);
  });

  const invalidData = {
    description: "Description test",
    maxGuests: 0,
  };

  it("should check that the /accommodations endpoint is NOT allowing POST requests with invalid data", async () => {
    const response = await request.post("/accommodations").send(invalidData);
    expect(response.status).toBe(400);
    expect(response.body._id).not.toBeDefined();
  });

  it("should test that the /accommodations endpoint is returning valid data after creating", async () => {
    const response = await request.post("/accommodations").send(validData);

    const accommodation = await AccommodationsSchema.findById(
      response.body._id
    );

    expect(response.body._id).toBeDefined();

    expect(accommodation.createdAt).toStrictEqual(
      new Date(response.body.createdAt)
    );
  });

  it("should test that the /accommodations endpoint is returning all the accommodations available", async () => {
    const accommodationResponse = await request
      .post("/accommodations")
      .send(validData);

    const response = await request.get("/accommodations");

    const included = response.body.accommodations.some(
      (accommodation) => accommodation._id === accommodationResponse.body._id
    );

    expect(included).toBe(true);
  });

  it("should test that status code is correct for not found /accommodations/:id", async () => {
    const params = "101010101010101010010100";

    const response = await request.get("/accommodations/" + params);

    const accommodation = await AccommodationsSchema.findById(params);
    if (!accommodation) {
      expect(response.status).toBe(404);
    } else {
      expect(response.status).toBe(200);
    }
  });

  it("should test that the delete endpoint is returning the correct status code", async () => {
    const accommodation = await AccommodationsSchema.create(validData);
    const { _id } = accommodation;

    const response = await request.delete("/accommodations/" + _id);

    expect(response.status).toBe(204);
  });
});
