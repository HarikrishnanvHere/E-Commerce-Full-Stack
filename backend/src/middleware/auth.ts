import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authUser = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.headers;
  if (!token) {
    res.json({ success: false, message: "Not Authorized, Login Again!" });
    return;
  }
  try {
    if (typeof token === "string") {
      const token_decode = jwt.verify(token, process.env.JWT_SECRET!);
      req.body.userId = (token_decode as jwt.JwtPayload).id;
      next();
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Invalid Token" });
  }
};
