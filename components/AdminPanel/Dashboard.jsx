import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useOrderContext } from './Context/ManageOrderContext.jsx';
import { useUserContext } from './Context/ManageUsersContext.jsx';
import { useAdminProducts } from './Context/AdminProductsContext.jsx';
import './styles/Dashboard.css';

// Stat Card Component
function StatCard({ title, value, change, isPositive, Icon }) {
    return (
        <div className="stat-card">
            <div className="stat-header">
                <h3 className="stat-title">{title}</h3>
                <div className={`stat-icon-container ${isPositive ? 'positive' : 'negative'}`}>
                    {typeof Icon === 'string' ? (
                        <span className="custom-icon-text">{Icon}</span>
                    ) : (
                        <Icon className="stat-icon" />
                    )}
                </div>
            </div>
            <div className="stat-content">
                <span className="stat-value">{value}</span>
                <div className="stat-change">
                    <span className={`change-value ${isPositive ? 'positive' : 'negative'}`}>
                        {change}
                    </span>
                    <span className="change-label">vs last month</span>
                </div>
            </div>
        </div>
    );
}

// Recent Orders Table Component
function RecentOrders() {
    const { ordersData } = useOrderContext();
    const reversedOrders = [...ordersData].reverse();
    // Get the 5 most recent orders for display
    const recentOrders = reversedOrders?.slice(0, 5) || [];

    return (
        <div className="recent-orders-container">
            <div className="section-header">
                <h2 className="section-title">Recent Orders</h2>
            </div>

            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>ORDER ID</th>
                            <th>CUSTOMER</th>
                            <th>PRODUCT</th>
                            <th>AMOUNT</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order, index) => {
                                // Find the first item in the order for display
                                const firstItem = order.items && order.items.length > 0
                                    ? order.items[0]
                                    : { title: 'Unknown Product' };

                                return (
                                    <tr key={order._id || index}>
                                        <td>#{order.orderid || `ORD-${1234 + index}`}</td>
                                        <td>{order.userName || 'Customer'}</td>
                                        <td>{firstItem.name || 'Product'}</td>
                                        <td><small>AED </small>{order.totalprice || 0}</td>
                                        <td>
                                            <span className={`status-badge ${order.status?.toLowerCase() || 'pending'}`}>
                                                {order.status || 'Pending'}  
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-orders-message">No recent orders found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Main Dashboard Component
function Dashboard() {
    const { ordersData, totalOrders } = useOrderContext();
    const { allUsers } = useUserContext();
    const { products } = useAdminProducts() || { products: [] };

    const [dashboardStats, setDashboardStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        growthRate: 0
    });

    useEffect(() => {
        if (!ordersData || ordersData.length === 0) return;

        const now = new Date();
        const thisMonth = now.getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const thisYear = now.getFullYear();
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        // Calculate revenue metrics
        const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalprice || 0), 0);

        const thisMonthRevenue = ordersData
            .filter(order => {
                const date = new Date(order.createdAt);
                return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            })
            .reduce((sum, order) => sum + (order.totalprice || 0), 0);

        const lastMonthRevenue = ordersData
            .filter(order => {
                const date = new Date(order.createdAt);
                return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
            })
            .reduce((sum, order) => sum + (order.totalprice || 0), 0);

        const revenueChange = lastMonthRevenue === 0
            ? 100
            : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        // Calculate order metrics
        const totalOrders = ordersData.length;

        const thisMonthOrders = ordersData
            .filter(order => {
                const date = new Date(order.createdAt);
                return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            }).length;

        const lastMonthOrders = ordersData
            .filter(order => {
                const date = new Date(order.createdAt);
                return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
            }).length;

        const ordersChange = lastMonthOrders === 0
            ? 100
            : ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;

        // Calculate customer metrics
        const getUniqueCustomers = (month, year) => {
            const monthOrders = ordersData.filter(order => {
                const date = new Date(order.createdAt);
                return date.getMonth() === month && date.getFullYear() === year;
            });
            return new Set(monthOrders.map(order => order.userid || order.userName)).size;
        };

        const totalCustomers = getUniqueCustomers(thisMonth, thisYear);
        const lastMonthCustomers = getUniqueCustomers(lastMonth, lastMonthYear);

        const customersChange = lastMonthCustomers === 0
            ? 100
            : ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100;

        // Calculate growth rate (overall)
        const growthRate = lastMonthRevenue === 0
            ? 100
            : ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        setDashboardStats({
            totalRevenue,
            totalOrders,
            totalCustomers,
            growthRate: growthRate.toFixed(2),
            revenueChange: revenueChange.toFixed(1),
            ordersChange: ordersChange.toFixed(1),
            customersChange: customersChange.toFixed(1)
        });

    }, [ordersData, totalOrders, allUsers]);


    return (
        <div className="admin-container">
            <main className="admin-main-content">
                <div className="dashboard-header">
                    <h1 className="header-title">Dashboard Overview</h1>
                    <p className="header-subtitle">Welcome back, Admin</p>
                </div>

                <div className="stats-grid">
                    <StatCard
                        title="Total Revenue"
                        value={dashboardStats.totalRevenue.toLocaleString('en-AE')}
                        change={`${dashboardStats.revenueChange >= 0 ? '+' : ''}${dashboardStats.revenueChange}%`}
                        isPositive={true}
                        Icon={"د.إ"}
                    />
                    <StatCard
                        title="Total Orders"
                        value={dashboardStats.totalOrders.toString() + "+"}
                        change={`${dashboardStats.ordersChange >= 0 ? '+' : ''}${dashboardStats.ordersChange}%`}
                        isPositive={true}
                        Icon={ShoppingBag}
                    />
                    <StatCard
                        title="Total Customers"
                        value={dashboardStats.totalCustomers.toString()}
                        change={`${dashboardStats.customersChange >= 0 ? '+' : ''}${dashboardStats.customersChange}%`}
                        isPositive={true}
                        Icon={Users}
                    />
                    <StatCard
                        title="Growth Rate"
                        value={`${dashboardStats.growthRate}%`}
                        change={`${dashboardStats.growthRate >= 0 ? '+' : ''}${dashboardStats.growthRate}%`}
                        isPositive={false}
                        Icon={TrendingUp}
                    />
                </div>

                <div className="orders-grid">
                    <RecentOrders />
                </div>
            </main>
            <Outlet />
        </div>
    );
}

export default Dashboard;