import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCategories from './pages/admin/Categories';
import AdminProducts from './pages/admin/Products';
import AdminAttributes from './pages/admin/Attributes';
import AdminLayout from './components/admin/Layout';
import Address from './components/checkout/Address';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import CartPage from './pages/CartPage';
import OrderPlaced from './pages/OrdePlaced';

const App = () => {
  return (
    <div className="app">

      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="attributes" element={<AdminAttributes />} />
        </Route>

        {/* Public Routes */}
        <Route path="*" element={
          <>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<WishlistPage />} />

                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />

                <Route path="/:gender" element={<CategoryPage />} />
                <Route path="/:gender/:category" element={<CategoryPage />} />

                <Route path="/:gender/:category/:subcategory" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path='/checkout/Address' element={<Address />} />
                <Route path='/successToOrder' element={<OrderPlaced />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
};

export default App;