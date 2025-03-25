import express from "express";
import { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorPay } from "../controllers/orderController";
import adminAuth from "../middleware/adminAuth";
import { authUser } from "../middleware/auth";

const orderRouter = express.Router();

//Admin Features of Order
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

//Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

//User Features
orderRouter.post("/userorders", authUser, userOrders);

//verify payment using Stripe

orderRouter.post("/verifyStripe", authUser, verifyStripe);

//verify payment using Razorpay

orderRouter.post("/verifyRazorpay", authUser, verifyRazorPay);

export default orderRouter;
