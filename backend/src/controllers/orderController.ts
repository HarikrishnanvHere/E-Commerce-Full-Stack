import { Request, Response } from "express";
import OrderModel from "../models/orderModel";
import userModel from "../models/userModel";
import Stripe from "stripe";
import razorpay from "razorpay";

//global variables
const deliveryCharge = 10;
const currency = "usd"; // Define the currency variable

//gateway initialize
let stripe: Stripe | undefined;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//Placing Orders using COD

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const { userId, items, amount, address } = req.body;
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new OrderModel(orderData);
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Order Failed" });
  }
};

//Placing Orders using Stripe Method

export const placeOrderStripe = async (req: Request, res: Response) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new OrderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"], // Ensure card payments are allowed
        line_items, // Add the line_items array here
        success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
        mode: "payment",
      });

      res.json({ success: true, session_url: session.url });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Generating Order using Stripe Failed!!" });
  }
};

//Verify Stripe

export const verifyStripe = async (req: Request, res: Response) => {
  const { orderId, success, userId } = req.body;
  try {
    if (success === "true") {
      await OrderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment Success" });
    } else {
      await OrderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment by stripe Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Validating Order using Stripe Failed!!" });
  }
};

//Placing Orders using Razorpay Method

export const placeOrderRazorpay = async (req: Request, res: Response) => {
  try {
    const { userId, items, amount, address } = req.body;
    const user = await userModel.findById(userId);

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new OrderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        res.json({ success: false, message: "Razorpay Order Creation Failed" });
        return;
      }
      res.json({ success: true, order, user: { name: user.name, email: user.email } });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Order Failed" });
  }
};

//Verify RazorPay Payment

export const verifyRazorPay = async (req: Request, res: Response) => {
  try {
    const { userId, razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status === "paid") {
      await OrderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Verification using Razorpay Failed!" });
  }
};

//All Orders Data for Admin

export const allOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to get allOrders" });
  }
};

//User Order data for front end

export const userOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const orders = await OrderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to get Orders" });
  }
};

//Update Order Status from Admin Panel

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body;
    await OrderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to Update Status" });
  }
};
