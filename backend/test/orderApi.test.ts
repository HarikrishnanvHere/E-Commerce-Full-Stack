import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../src/server";
import userModel from "../src/models/userModel";
import orderModel from "../src/models/orderModel";
import jwt from "jsonwebtoken";

let mongoServer: MongoMemoryServer;
let authToken: string;
let adminToken: string;
let userId: string;
let orderId: string;

describe("Order API test suite", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    process.env.ADMIN_EMAIL = "admin@test.com";
    process.env.ADMIN_PASSWORD = "admin123";

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Create a test user
    const user = await userModel.create({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      cartData: {},
    });

    userId = user._id.toString();
    authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
    adminToken = jwt.sign(process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await orderModel.deleteMany({});
  });

  // PLACE ORDER (COD)
  test("Should place an order with COD", async () => {
    const orderData = {
      userId,
      items: [{ name: "Product1", price: 100, quantity: 2 }],
      amount: 200,
      address: { street: "123 Main St", city: "New York" },
    };

    const res = await request(app).post("/api/order/place").set("token", authToken).send(orderData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Order Placed");

    const savedOrder = await orderModel.findOne({});
    expect(savedOrder).toBeDefined();
    orderId = savedOrder?._id.toString()!;
  });

  // FETCH USER ORDERS
  test("Should return user orders", async () => {
    await orderModel.create({
      userId,
      items: [{ name: "Product1", price: 100, quantity: 2 }],
      amount: 200,
      address: { street: "123 Main St", city: "New York" },
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    });

    const res = await request(app).post("/api/order/userorders").set("token", authToken).send({ userId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.orders.length).toBe(1);
  });

  // ADMIN: FETCH ALL ORDERS
  test("Should return all orders (Admin)", async () => {
    await orderModel.create({
      userId,
      items: [{ name: "Product1", price: 100, quantity: 2 }],
      amount: 200,
      address: { street: "123 Main St", city: "New York" },
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    });

    const res = await request(app).post("/api/order/list").set("token", adminToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.orders.length).toBe(1);
  });

  // ADMIN: UPDATE ORDER STATUS
  test("Should update order status (Admin)", async () => {
    const order = await orderModel.create({
      userId,
      items: [{ name: "Product1", price: 100, quantity: 2 }],
      amount: 200,
      address: { street: "123 Main St", city: "New York" },
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    });

    const res = await request(app).post("/api/order/status").set("token", adminToken).send({ orderId: order._id, status: "Shipped" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Status Updated");

    const updatedOrder = await orderModel.findById(order._id);
    expect(updatedOrder?.status).toBe("Shipped");
  });

  // PAYMENT VERIFICATION (SIMULATION)

  // Mock Stripe verification
  test("Should verify Stripe payment", async () => {
    const order = await orderModel.create({
      userId,
      items: [{ name: "Product1", price: 100, quantity: 2 }],
      amount: 200,
      address: { street: "123 Main St", city: "New York" },
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    });

    const res = await request(app).post("/api/order/verifyStripe").set("token", authToken).send({ orderId: order._id, success: "true", userId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Payment Success");

    const updatedOrder = await orderModel.findById(order._id);
    expect(updatedOrder?.payment).toBe(true);
  });

  // Mock Razorpay verification
  test("Should verify Razorpay payment", async () => {
    const order = await orderModel.create({
      userId,
      items: [{ name: "Product1", price: 100, quantity: 2 }],
      amount: 200,
      address: { street: "123 Main St", city: "New York" },
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    });

    const res = await request(app).post("/api/order/verifyRazorpay").set("token", authToken).send({ userId, razorpay_order_id: order._id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Verification using Razorpay Failed!"); // Simulating failure case
  });
});
