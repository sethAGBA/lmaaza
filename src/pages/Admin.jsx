import React from 'react';
import AdminDashboard from '../components/AdminDashboard';

const Admin = ({ menuItems, setMenuItems, services, setServices }) => {
    return (
        <AdminDashboard menuItems={menuItems} setMenuItems={setMenuItems} services={services} setServices={setServices} />
    );
};

export default Admin;