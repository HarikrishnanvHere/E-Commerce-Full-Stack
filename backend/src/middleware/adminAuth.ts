import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

const adminAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    if (!token) {
      res.json({ success: false, message: "Not Authorized!" });
      return;
    }
    if (!process.env.JWT_SECRET) {
      res.json({ success: false, message: "Secret not found" });
      return;
    }
    const decodedData = jwt.verify(token as string, process.env.JWT_SECRET);
    if (decodedData !== process.env.ADMIN_EMAIL! + process.env.ADMIN_PASSWORD!) {
      res.json({ success: true, message: "Not Authorized. Login Again!" });
    }
    next();
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export default adminAuth;
