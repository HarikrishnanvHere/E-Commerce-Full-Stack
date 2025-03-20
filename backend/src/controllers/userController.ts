import { Request, RequestHandler, Response } from "express";
import userModel from "../models/userModel";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const createToken = (id: ObjectId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

//Route for user Login
const loginUser: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      res.json({ success: false, message: "User Doesn't Exist" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

//Route for User Registration
const registerUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    //Checking if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      res.json({ success: false, message: "User Already Exists" });
      return;
    }

    //validating email format and strong password
    if (!validator.isEmail(email)) {
      res.json({ success: false, message: "Please enter a valid Email" });
      return;
    }
    if (password.length < 8) {
      res.json({ success: false, message: "Please enter a strong password" });
      return;
    }

    //Hashing User Password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

//Route for Admin Login
const adminLogin: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    //console.log("LOGIN API HIT SUCCESS");
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export { loginUser, registerUser, adminLogin };
