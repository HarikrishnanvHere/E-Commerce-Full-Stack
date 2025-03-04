import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsLetterBox from "../components/NewsLetterBox";

const About: React.FC = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1="ABOUT" text2="US" />
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img className="w-full md:max-w-[450px]" src={assets.about_img} alt="" />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>Welcome to FOREVER, your go-to destination for trendy, high-quality fashion that never goes out of style! We believe that fashion is more than just clothing—it's a way to express yourself, make a statement, and feel confident in your own skin.</p>
          <p>At FOREVER, we curate a collection of stylish and affordable clothing that keeps up with the latest trends while ensuring timeless elegance. Whether you're looking for casual essentials, chic workwear, or standout pieces for special occasions, we've got you covered.</p>
          <b className="text-gray-800">Our Mission</b>
          <p>
            FOREVER was conceived to make fashion accessible, effortless, and timeless. We believe that everyone deserves to look and feel their best, which is why we offer high-quality, stylish, and affordable clothing for every occasion. We are committed to providing a seamless shopping
            experience, ensuring top-notch quality, and delivering exceptional customer service.
          </p>
          <p>Whether you're refreshing your wardrobe or finding the perfect statement piece, we’re here to help you express yourself with confidence and style. Our goal is simple: To inspire fashion that lasts—today, tomorrow, and FOREVER.</p>
        </div>
      </div>

      <div className="text-2xl py-4">
        <Title text1="WHY" text2="CHOOSE US" />
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Premium Quality, Always:</b>
          <p className="text-gray-600"> We take pride in offering high-quality clothing made from the finest materials. Every piece goes through strict quality checks to ensure durability, comfort, and style.</p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Effortless Shopping Experience:</b>
          <p className="text-gray-600"> Our intuitive app is designed for a smooth, hassle-free shopping journey. From easy browsing to secure checkout, we make online shopping seamless and enjoyable.</p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Exceptional Customer Service:</b>
          <p className="text-gray-600">Your satisfaction is our priority. Our dedicated support team is always here to assist you—whether you need help with orders, sizing, or returns, we’ve got you covered.</p>
        </div>
      </div>
      <NewsLetterBox />
    </div>
  );
};

export default About;
