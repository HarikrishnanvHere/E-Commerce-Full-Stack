import express, { Application, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.ts";
import connectCloudinary from "./config/cloudinary.ts";
import userRouter from "./routes/userRoute.ts";
import productRouter from "./routes/productRoute.ts";
import cartRouter from "./routes/cartRoutes.ts";
import orderRouter from "./routes/orderRoute.ts";

//App Config

export const app: Application = express();
const port = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "test") {
  connectDB();
  connectCloudinary();
  app.listen(port, () => {
    console.log("Server started on PORT : " + port);
  });
}

//middlewares

app.use(express.json());
app.use(cors());

//api end points
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("API WORKING");
});
