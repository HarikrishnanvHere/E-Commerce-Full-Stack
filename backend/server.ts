import express, { Application, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.ts";
import connectCloudinary from "./config/cloudinary.ts";
import userRouter from "./routes/userRoute.ts";
import productRouter from "./routes/productRoute.ts";

//App Config

const app: Application = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

//middlewares

app.use(express.json());
app.use(cors());

//api end points
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("API WORKING");
});

app.listen(port, () => {
  console.log("Server started on PORT : " + port);
});
