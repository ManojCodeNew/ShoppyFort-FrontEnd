import React, { useEffect } from 'react';
import './styles/MainAdminLayout.css';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { useUserContext } from './Context/ManageUsersContext.jsx';
import { useNavigate } from 'react-router-dom';
function MainAdminLayout() {
    const { token } = useUserContext();
    const navigate = useNavigate();
    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
        }
    }, [token, navigate]);
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

export default MainAdminLayout;
