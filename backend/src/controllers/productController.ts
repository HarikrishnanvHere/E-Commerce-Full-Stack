import { Request, RequestHandler, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel";

interface MulterFile {
  [fieldname: string]: Express.Multer.File[];
}

//Adding Product
export const addProduct: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;
    //console.log(bestseller);

    if (!name || !description || !price || !category || !subCategory || !sizes) {
      res.status(400).json({ success: false, message: "All fields are required!" });
      return;
    }

    const files = req.files as MulterFile;

    const image1 = files.image1 && files.image1[0];
    const image2 = files.image2 && files.image2[0];
    const image3 = files.image3 && files.image3[0];
    const image4 = files.image4 && files.image4[0];

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    //console.log(product);

    await product.save();
    //console.log(product);

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    error instanceof Error ? res.json({ success: false, message: error.message }) : console.log(error);
  }
};

//Removing Product
export const removeProduct: RequestHandler = async (req: Request, res: Response) => {
  try {
    const product = await productModel.findById(req.body.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found!" });
      return;
    }
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Deleted" });
  } catch (error) {
    console.log(error);
    error instanceof Error ? res.json({ success: false, message: error.message }) : console.log(error);
  }
};

//List of Product
export const listProduct: RequestHandler = async (req: Request, res: Response) => {
  try {
    //console.log("API HIT SUCCESS");
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    error instanceof Error ? res.json({ success: false, message: error.message }) : console.log(error);
  }
};

//Fetch details of single proudct
export const singleProduct: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: "Product ID is required!" });
      return;
    }
    //console.log(productId);
    const product = await productModel.findById(productId);
    //console.log(product);

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found!" });
      return;
    }

    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    error instanceof Error ? res.json({ success: false, message: error.message }) : console.log(error);
  }
};
