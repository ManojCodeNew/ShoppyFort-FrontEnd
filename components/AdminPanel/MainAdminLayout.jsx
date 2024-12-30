import React from 'react';
import './styles/MainAdminLayout.css';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

function MainAdminLayout() {
    return (
        <>
        <div className="adminPanel-container">
            <div className="sidebar">
                <Sidebar />
            </div>
            <div className="content">
                <Outlet />
            </div>
            
            
        </div>
        </>
    )
}

export default MainAdminLayout
