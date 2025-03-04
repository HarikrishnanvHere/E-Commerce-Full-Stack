import React, { useContext } from "react";
import { ShopContext } from "../context/Shop-Context";
import { Link } from "react-router-dom";

interface productItemProp {
  id: string;
  image: string[];
  name: string;
  price: number;
}

const ProductItem: React.FC<productItemProp> = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  return (
    <div>
      <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
        <div className="overflow-hidden">
          <img className="hover:scale-110 transition ease-in-out" src={image[0]} alt="" />
        </div>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="ptext-sm font-medium">
          {currency}
          {price}
        </p>
      </Link>
    </div>
  );
};

export default ProductItem;
