// add products to cart

import { Request, Response } from "express";
import userModel from "../models/userModel";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId, itemId, size } = req.body;
    if (!userId || !itemId || !size) {
      res.status(400).json({ success: false, message: "Invalid request data" });
      return;
    }
    let userData = await userModel.findById(userId);
    let cartData = await userData.cartData;
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        //console.log(cartData[itemId][size]);
        cartData[itemId][size] = cartData[itemId][size] + 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Added to Cart!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

//update products in the cart

export const updateCart = async (req: Request, res: Response) => {
  try {
    const { userId, itemId, size, quantity } = req.body;
    if (quantity < 0) {
      res.status(400).json({ success: false, message: "Invalid quantity" });
      return;
    }
    let userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    cartData[itemId][size] = quantity;
    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Cart Updated!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

//get user cart data

export const getUserCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    let userData = await userModel.findById(userId);
    let cartData = await userData.cartData;
    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Internal Server Error" });
  }
};
