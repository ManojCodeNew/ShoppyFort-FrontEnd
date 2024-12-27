import React from 'react';
import './styles/MainAdmin.css';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import RecentOrders from './RecentOrders';
import { ShoppingBag, Users, TrendingUp, IndianRupeeIcon } from 'lucide-react';

function MainAdmin() {
    return (
        <div className="app-container">
            <Sidebar />

            <main className="main-content">
                <div className="header">
                    <h1 className="header-title">Dashboard Overview</h1>
                    <p className="header-subtitle">Welcome back, Admin</p>
                </div>

                <div className="stats-grid">
                    <StatCard
                        title="Total Revenue"
                        value="₹54,239"
                        change="+12.5%"
                        isPositive={true}
                        Icon={IndianRupeeIcon}
                    />
                    <StatCard
                        title="Total Orders"
                        value="1,245"
                        change="+8.2%"
                        isPositive={true}
                        Icon={ShoppingBag}
                    />
                    <StatCard
                        title="Total Customers"
                        value="3,427"
                        change="+2.4%"
                        isPositive={true}
                        Icon={Users}
                    />
                    <StatCard
                        title="Growth Rate"
                        value="2.8%"
                        change="-0.5%"
                        isPositive={false}
                        Icon={TrendingUp}
                    />
                </div>

                <div className="orders-grid">
                    <RecentOrders />
                </div>
            </main>
        </div>

    )
}

export default MainAdmin
