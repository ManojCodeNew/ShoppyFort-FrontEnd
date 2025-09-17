
import React from 'react';
import '@/styles/pages/OrderPlaced.scss';
import { useNavigate } from 'react-router-dom';
import { useOrderDetails } from '@/contexts/OrderDetailsContext.jsx';

const OrderPlaced = () => {

  const navigate = useNavigate();
  const { orderDetails, setOrderDetails, fetchOrders } = useOrderDetails();

  const order = orderDetails;
  // console.log("Order Details:", orderDetails);
  return (
    <div className="order-success-bg">
      <div className="order-success-card order-success-container">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>
        <h1>Thank You for Your Order!</h1>
        <p className="success-message">Your order has been successfully placed.</p>
        {order?.totalprice != 0 && (
          <div className="order-summary">
            <h2>Order Summary</h2>
            <p><strong>Order ID:</strong> {order.orderid}</p>
            <p><strong>Customer Name:</strong> {order.shippingaddress?.username || "User"}</p>
            <p>
              <strong>Shipping Address:</strong>{" "}
              {order.shippingaddress.buildingNumber},
              {order.shippingaddress.streetName},
              {order.shippingaddress.area},
              {order.shippingaddress.city},
              {order.shippingaddress.emirate},
              {order.shippingaddress.country}
            </p>
            <h3 className="total-amount">Total Amount: AED {order.totalprice}</h3>
          </div>
        )}
        <div className="actions">
          <button onClick={() => navigate("/")} className="button">
            Continue Shopping
          </button>
          <button onClick={() => {
            setOrderDetails({})
            fetchOrders();
            navigate("/orders");
          }} className="button secondary">
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;
