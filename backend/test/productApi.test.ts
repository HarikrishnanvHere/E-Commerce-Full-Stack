import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../src/server";
import productModel from "../src/models/productModel";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import path from "path";

let authToken: string;

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: "mocked_url" }),
    },
  },
}));

describe("Product API Tests", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret"; // Mock JWT secret
    process.env.ADMIN_EMAIL = "admin@test.com"; // Mock admin email
    process.env.ADMIN_PASSWORD = "admin123"; // Mock admin password

    // Generate a token that matches what `adminAuth.ts` expects
    authToken = jwt.sign(process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD, process.env.JWT_SECRET);
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await productModel.deleteMany({});
  });

  test("Should not add a product without authentication", async () => {
    const productData = {
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: "Test Category",
      subCategory: "Test SubCategory",
      sizes: JSON.stringify(["S", "M", "L"]),
      bestseller: "true",
    };

    const res = await request(app).post("/api/product/add").send(productData);

    expect(res.body.success).toBe(false);
    //console.log(res.body.message);
    expect(res.body.message).toBe("Not Authorized!");
  });

  test("Should return error if required fields are missing", async () => {
    const res = await request(app).post("/api/product/add").set("token", authToken).field("name", ""); // Missing required fields

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("All fields are required!"); // Modify your controller to return this message
  });

  test("Should add a product with authentication", async () => {
    const res = await request(app)
      .post("/api/product/add")
      .set("token", authToken) // Send authentication token in headers
      .field("name", "Test Product")
      .field("description", "Test Description")
      .field("price", "100")
      .field("category", "Test Category")
      .field("subCategory", "Test SubCategory")
      .field("sizes", JSON.stringify(["S", "M", "L"]))
      .field("bestseller", "true")
      .attach("image1", path.resolve(__dirname, "test-image.jpg")) // Mock image upload
      .attach("image2", path.resolve(__dirname, "test-image.jpg"))
      .attach("image3", path.resolve(__dirname, "test-image.jpg"))
      .attach("image4", path.resolve(__dirname, "test-image.jpg"));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product Added");
  });

  test("Should list all products", async () => {
    await productModel.create({
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: "Test Category",
      subCategory: "Test SubCategory",
      sizes: ["S", "M", "L"],
      bestseller: true,
      image: ["mocked_url"],
      date: Date.now(),
    });

    const res = await request(app).get("/api/product/list");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products.length).toBe(1);
  });

  test("Should get a single product", async () => {
    const product = await productModel.create({
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: "Test Category",
      subCategory: "Test SubCategory",
      sizes: ["S", "M", "L"],
      bestseller: true,
      image: ["mocked_url"],
      date: Date.now(),
    });

    const res = await request(app).post("/api/product/single").send({ productId: product._id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toBe("Test Product");
  });

  test("Should return error if there is no product Id for fetching a single product", async () => {
    const product = await productModel.create({
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: "Test Category",
      subCategory: "Test SubCategory",
      sizes: ["S", "M", "L"],
      bestseller: true,
      image: ["mocked_url"],
      date: Date.now(),
    });

    const res = await request(app).post("/api/product/single");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Product ID is required!");
  });

  test("Should return error if product does not exist", async () => {
    const fakeProductId = new mongoose.Types.ObjectId(); // Generate a random MongoDB ID

    const res = await request(app).post("/api/product/single").send({ productId: fakeProductId });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Product not found!");
  });

  test("Should not remove a product without authentication", async () => {
    const product = await productModel.create({
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: "Test Category",
      subCategory: "Test SubCategory",
      sizes: ["S", "M", "L"],
      bestseller: true,
      image: ["mocked_url"],
      date: Date.now(),
    });

    const res = await request(app).post("/api/product/remove").send({ id: product._id });

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Not Authorized!");
  });

  test("Should return error if trying to delete a non-existing product", async () => {
    const fakeProductId = new mongoose.Types.ObjectId();

    const res = await request(app).post("/api/product/remove").set("token", authToken).send({ id: fakeProductId });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Product not found!");
  });

  test("Should remove a product with authentication", async () => {
    const product = await productModel.create({
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: "Test Category",
      subCategory: "Test SubCategory",
      sizes: ["S", "M", "L"],
      bestseller: true,
      image: ["mocked_url"],
      date: Date.now(),
    });

    const res = await request(app)
      .post("/api/product/remove")
      .set("token", authToken) // Use "token" header as expected by adminAuth
      .send({ id: product._id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product Deleted");
  });
});
