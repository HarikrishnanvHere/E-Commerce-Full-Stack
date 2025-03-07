import React from "react";

interface OrdersProps {
  token: string | null;
}

const Orders: React.FC<OrdersProps> = ({ token }) => {
  return <div>Orders</div>;
};

export default Orders;
