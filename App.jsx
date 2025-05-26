import React from 'react';
import { useState } from 'react';
import './index.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import AdminPanelLogin from './components/AdminPanel/AdminPanelLogin';
import Address from './components/checkout/Address.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderPlaced from './pages/OrdePlaced.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import Offers from './components/Offers.jsx';
import Dashboard from './components/AdminPanel/Dashboard.jsx';
import MainAdminLayout from './components/AdminPanel/MainAdminLayout.jsx';
import ProductViewPage from './pages/ProductViewPage.jsx';
import ManageProduct from './components/AdminPanel/ManageProduct.jsx';
import ProductAddForm from './components/AdminPanel/ProductAddForm.jsx';
import ManageOrder from './components/AdminPanel/ManageOrder.jsx';
import ProductDetails from './components/AdminPanel/ProductDetails.jsx';
import UserNotification from './components/UserNotification.jsx'
import ManageReturn from './components/AdminPanel/ManageReturn.jsx';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Wallet from './pages/Wallet.jsx';
import AddOffers from './components/AdminPanel/AddOffers.jsx';
import AboutUs from './pages/AboutUs';
const stripePromise = loadStripe('pk_test_51RIf4KJHqmIFNNwkbUYJvZA9dTAi3HW6bDIEYYnDOqG6JTw68x8JjiuSluNPb5iemtpiLdOcxqp1irCCddXp6p3U001PeLWXNf'); // Replace with your actual publishable key
const App = () => {

  return (
    <>

      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminPanelLogin />} />
        <Route path="/admin" element={
          <MainAdminLayout />
        }>

          <Route index element={<Dashboard />} />
          <Route path="products/manage" element={< ManageProduct />} />
          <Route path="products/add" element={<ProductAddForm />} />
          <Route path="products/edit" element={<ProductAddForm />} />
          <Route path="products/view" element={<ProductDetails />} />
          <Route path="customers/view" element={<ProductDetails />} />

          <Route path='add-offer' element={<AddOffers />} />
          <Route path="manage-order" element={<ManageOrder />} />
          <Route path="manage-return" element={<ManageReturn />} />



        </Route>


        {/* Public Routes */}
        <Route path="*" element={
          <>
            <Navbar />
            <main >
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about-us' element={<AboutUs />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="orders" element={<OrderDetails />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path='wallet' element={<Wallet />} />
                <Route path="category/:gender" element={<CategoryPage />} />
                <Route path="category/:gender/:category" element={<CategoryPage />} />
                <Route path="category/:gender/:category/:subcategory" element={<CategoryPage />} />
                <Route path="product/view/:id" element={<ProductViewPage />} />
                <Route path="product/search/:id" element={<ProductViewPage />} />
                <Route path="checkout/address" element={
                  <Elements stripe={stripePromise}>
                    <Address />
                  </Elements>
                } />
                <Route path="successToOrder" element={<OrderPlaced />} />
                <Route path="/offers/:offerId" element={<Offers />} />
                <Route path="notifications" element={<UserNotification />} />


              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </>
  );
};

export default App;