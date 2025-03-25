import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../src/server";
import userModel from "../src/models/userModel";
import jwt from "jsonwebtoken";

let mongoServer: MongoMemoryServer;
let authToken: string;
let userId: string;

describe("Cart API test suite", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret"; // Mock JWT secret

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Create test user
    const user = await userModel.create({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      cartData: {},
    });

    userId = user._id.toString();
    authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await userModel.updateOne({ _id: userId }, { cartData: {} }); // Reset cart before each test
  });

  // ✅ 1️⃣ ADD TO CART
  test("Should add a product to cart", async () => {
    const res = await request(app).post("/api/cart/add").set("token", authToken).send({ userId, itemId: "product123", size: "M" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Added to Cart!");

    const updatedUser = await userModel.findById(userId);
    expect(updatedUser?.cartData["product123"].M).toBe(1);
  });

  test("Should increase quantity if item already in cart", async () => {
    await userModel.updateOne({ _id: userId }, { cartData: { product123: { M: 1 } } });

    const res = await request(app).post("/api/cart/add").set("token", authToken).send({ userId, itemId: "product123", size: "M" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await userModel.findById(userId);
    expect(updatedUser?.cartData["product123"].M).toBe(2);
  });

  test("Should return error if missing required fields", async () => {
    const res = await request(app).post("/api/cart/add").set("token", authToken).send({ userId, size: "M" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid request data");
  });

  // ✅ 2️⃣ UPDATE CART
  test("Should update cart item quantity", async () => {
    await userModel.updateOne({ _id: userId }, { cartData: { product123: { M: 2 } } });

    const res = await request(app).post("/api/cart/update").set("token", authToken).send({ userId, itemId: "product123", size: "M", quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Cart Updated!");

    const updatedUser = await userModel.findById(userId);
    expect(updatedUser?.cartData["product123"].M).toBe(5);
  });

  test("Should return error if quantity is invalid", async () => {
    const res = await request(app).post("/api/cart/update").set("token", authToken).send({ userId, itemId: "product123", size: "M", quantity: -1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid quantity");
  });

  // ✅ 3️⃣ GET USER CART
  test("Should return user's cart data", async () => {
    await userModel.updateOne({ _id: userId }, { cartData: { product123: { M: 2 } } });

    const res = await request(app).post("/api/cart/get").set("token", authToken).send({ userId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cartData.product123.M).toBe(2);
  });

  test("Should return empty cart if no items", async () => {
    await userModel.updateOne({ _id: userId }, { cartData: {} });

    const res = await request(app).post("/api/cart/get").set("token", authToken).send({ userId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cartData).toEqual({});
  });

  // ✅ 4️⃣ AUTHENTICATION TESTS
  test("Should not allow access without token", async () => {
    const res = await request(app).post("/api/cart/get").send({ userId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Not Authorized, Login Again!");
  });

  test("Should return error for invalid token", async () => {
    const res = await request(app).post("/api/cart/get").set("token", "invalidToken").send({ userId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid Token");
  });
});
