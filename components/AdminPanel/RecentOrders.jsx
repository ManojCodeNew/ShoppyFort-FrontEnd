import React from 'react';
import './styles/recentOrders.css';

const orders = [
  {
    id: '#ORD-1234',
    customer: 'Anshool',
    product: 'Summer Collection T-Shirt',
    amount: ' ₹89.99',
    status: 'Delivered',
  },
  {
    id: '#ORD-1235',
    customer: 'Suman',
    product: 'Designer Jeans',
    amount: ' ₹159.99',
    status: 'Processing',
  },
  {
    id: '#ORD-1236',
    customer: 'Abhijith',
    product: 'Winter Jacket',
    amount: ' ₹199.99',
    status: 'Pending',
  },
  {
    id: '#ORD-1237',
    customer: 'Rahul',
    product: 'Casual Sneakers',
    amount: ' ₹79.99',
    status: 'Delivered',
  },
];

const getStatusClass = (status) => {
  switch (status) {
    case 'Delivered':
      return 'status-delivered';
    case 'Processing':
      return 'status-processing';
    case 'Pending':
      return 'status-pending';
    default:
      return 'status-default';
  }
};

 const RecentOrders = () => {
  return (
    <div className="recent-orders-container">
      <div className="recent-orders-header">
        <h2 className="recent-orders-title">Recent Orders</h2>
      </div>
      <div className="recent-orders-table-wrapper">
        <table className="recent-orders-table">
          <thead>
            <tr className="recent-orders-header-row">
              <th className="recent-orders-header-cell">Order ID</th>
              <th className="recent-orders-header-cell">Customer</th>
              <th className="recent-orders-header-cell">Product</th>
              <th className="recent-orders-header-cell">Amount</th>
              <th className="recent-orders-header-cell">Status</th>
            </tr>
          </thead>
          <tbody className="recent-orders-body">
            {orders.map((order) => (
              <tr key={order.id} className="recent-orders-row">
                <td className="recent-orders-cell">{order.id}</td>
                <td className="recent-orders-cell">{order.customer}</td>
                <td className="recent-orders-cell">{order.product}</td>
                <td className="recent-orders-cell">{order.amount}</td>
                <td className="recent-orders-cell">
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default RecentOrders;
