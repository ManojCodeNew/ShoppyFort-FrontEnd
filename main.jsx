import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
// import './styles/main.scss';
import ProductProvider from './contexts/ProductsContext';
import { AddressProvider } from './contexts/AddressContext';
import { OrderDetailsProvider } from './contexts/OrderDetailsContext';
import { OrderProvider } from './components/AdminPanel/Context/ManageOrderContext';
import { BrowserRouter } from 'react-router-dom';
import AdminProductsProvider from './components/AdminPanel/Context/AdminProductsContext.jsx';
import { NotificationProvider } from './components/Notify/NotificationProvider.jsx';
import { UserProvider } from './components/AdminPanel/Context/ManageUsersContext.jsx';
import { ManageReturnProvider } from './components/AdminPanel/Context/ManageReturnContext.jsx';
const root = createRoot(document.getElementById('root'));
import { GoogleOAuthProvider } from '@react-oauth/google';
import "bootstrap/dist/css/bootstrap.min.css";
import UserNotificationsProvider from './contexts/UserNotificationContext';
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId="994690946679-8sjellqs7o44r8b3ij4oqduasatgmc91.apps.googleusercontent.com">
        <NotificationProvider>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <UserProvider>
                  <OrderProvider>
                    <AddressProvider>
                      <WishlistProvider>
                        <OrderDetailsProvider>
                          <AdminProductsProvider>
                            <UserNotificationsProvider>
                              <ManageReturnProvider>

                                <App />

                              </ManageReturnProvider>
                            </UserNotificationsProvider>
                          </AdminProductsProvider>
                        </OrderDetailsProvider>
                      </WishlistProvider>
                    </AddressProvider>
                  </OrderProvider>
                </UserProvider>
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </NotificationProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>

  </React.StrictMode >
);