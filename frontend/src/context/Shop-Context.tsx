import { createContext, useEffect, useState } from "react";

import { ReactNode } from "react";
import { toast } from "react-toastify";
import { NavigateFunction, useNavigate } from "react-router-dom";
import axios from "axios";

type cartItem = { [key: string]: { [key: string]: number } };

export interface productType {
  _id: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  price: number;
  image: string[];
  sizes: string[];
  date: number;
  bestseller: boolean;
}

export const ShopContext = createContext<ShopContextValue>({
  products: [],
  currency: "",
  delivery_fee: 0,
  search: "",
  setSearch: () => {},
  showSearch: false,
  setShowSearch: () => {},
  cartItems: {},
  setCartItems: () => {},
  addToCart: () => {},
  getCartCount: () => 0,
  updateQuantity: () => {},
  getCartAmount: () => 0,
  navigate: () => {},
  backendUrl: "",
  token: "",
  setToken: () => {},
});

interface ShopContextValue {
  products: productType[];
  currency: string;
  delivery_fee: number;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  cartItems: cartItem;
  setCartItems: React.Dispatch<React.SetStateAction<cartItem>>;
  addToCart: (itemId: string, size: string) => void;
  getCartCount: () => number;
  updateQuantity: (itemId: string, size: string, quantity: number) => void;
  getCartAmount: () => number;
  navigate: NavigateFunction;
  backendUrl: string;
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
}

interface ShopContextProviderProps {
  children: ReactNode;
}

const ShopContextProvider = (props: ShopContextProviderProps) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = "http://localhost:4000";
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState<cartItem>({});
  const [products, setProducts] = useState<productType[]>([]);
  const [token, setToken] = useState<string>("");
  const navigate = useNavigate();

  const addToCart = async (itemId: string, size: string) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        const url = backendUrl + "/api/cart/add";
        //console.log(url);
        await axios.post(url, { itemId, size }, { headers: { token } });
        toast.success("Product Added!");
      } catch (error) {
        console.log(error);
        toast.error("Failed to add product to Cart");
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId: string, size: string, quantity: number) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
    if (token) {
      try {
        await axios.post(backendUrl + "/api/cart/update", { itemId, size, quantity }, { headers: { token } });
      } catch (error) {
        console.log(error);
        toast.error("Failed to Update Cart");
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo) {
        for (const item in cartItems[items]) {
          try {
            if (cartItems[items][item] > 0) {
              totalAmount += itemInfo.price * cartItems[items][item];
            }
          } catch (error) {}
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const URL = backendUrl + "/api/product/list";
      console.log(URL);
      const response = await axios.get(URL);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error Fetching Products");
    }
  };

  const getUserCart = async (token: string) => {
    try {
      const response = await axios.post(backendUrl + "/api/cart/get", {}, { headers: { token } });
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error Fetching Products");
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token") || "");
      getUserCart(localStorage.getItem("token") || "");
    }
  }, []);

  const value: ShopContextValue = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    token,
    setToken,
  };

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;
