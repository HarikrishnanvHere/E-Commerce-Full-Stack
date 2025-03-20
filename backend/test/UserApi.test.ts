import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../src/server";
import userModel from "../src/models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

let mongoServer: MongoMemoryServer;

describe("User Controller API Test Suite", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret"; // Mock JWT secret
    process.env.ADMIN_EMAIL = "admin@test.com"; // Mock admin email
    process.env.ADMIN_PASSWORD = "admin123"; // Mock admin password

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  // ✅ TEST CASES

  // 🔹 1️⃣ Test User Registration (Success)
  test("Should register a new user", async () => {
    const res = await request(app).post("/api/user/register").send({ name: "John Doe", email: "johndoe@example.com", password: "strongPass123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  // 🔹 2️⃣ Test User Registration with Existing Email
  test("Should not register if email already exists", async () => {
    await userModel.create({ name: "Jane Doe", email: "janedoe@example.com", password: "hashedPass123" });

    const res = await request(app).post("/api/user/register").send({ name: "Jane Doe", email: "janedoe@example.com", password: "newPassword123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User Already Exists");
  });

  // 🔹 3️⃣ Test Registration with Invalid Email
  test("Should not register if email is invalid", async () => {
    const res = await request(app).post("/api/user/register").send({ name: "Alice", email: "invalid-email", password: "strongPass123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Please enter a valid Email");
  });

  // 🔹 4️⃣ Test Registration with Weak Password
  test("Should not register if password is too short", async () => {
    const res = await request(app).post("/api/user/register").send({ name: "Bob", email: "bob@example.com", password: "123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Please enter a strong password");
  });

  // 🔹 5️⃣ Test User Login (Success)
  test("Should login with correct credentials", async () => {
    const hashedPassword = await bcrypt.hash("strongPass123", 10);
    await userModel.create({ name: "John Doe", email: "johndoe@example.com", password: hashedPassword });

    const res = await request(app).post("/api/user/login").send({ email: "johndoe@example.com", password: "strongPass123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  // 🔹 6️⃣ Test Login with Incorrect Password
  test("Should not login with incorrect password", async () => {
    const hashedPassword = await bcrypt.hash("correctPassword123", 10);
    await userModel.create({ name: "John Doe", email: "johndoe@example.com", password: hashedPassword });

    const res = await request(app).post("/api/user/login").send({ email: "johndoe@example.com", password: "wrongPassword123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid credentials");
  });

  // 🔹 7️⃣ Test Login for Non-Existing User
  test("Should not login if user does not exist", async () => {
    const res = await request(app).post("/api/user/login").send({ email: "notfound@example.com", password: "randomPass123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User Doesn't Exist");
  });

  // 🔹 8️⃣ Test Admin Login (Success)
  test("Should login as admin with correct credentials", async () => {
    const res = await request(app).post("/api/user/admin").send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  // 🔹 9️⃣ Test Admin Login with Incorrect Credentials
  test("Should not login as admin with incorrect credentials", async () => {
    const res = await request(app).post("/api/user/admin").send({ email: "wrongadmin@test.com", password: "wrongPass123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
