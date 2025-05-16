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
import UserNotificationsProvider from './contexts/UserNotificationContext.jsx';
import WalletProvider from './contexts/WalletContext.jsx';
import AdminOffersProvider from './components/AdminPanel/Context/AdminOffersContext.jsx';
import { OffersProvider } from './contexts/OffersContext';
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <WalletProvider>
            <GoogleOAuthProvider clientId="994690946679-8sjellqs7o44r8b3ij4oqduasatgmc91.apps.googleusercontent.com">
              <ProductProvider>
                <CartProvider>
                  <UserProvider>
                    <OrderProvider>
                      <AddressProvider>
                        <WishlistProvider>
                          <AdminOffersProvider>
                            <OrderDetailsProvider>
                              <AdminProductsProvider>
                                <UserNotificationsProvider>
                                  <ManageReturnProvider>
                                    <OffersProvider>
                                      <App />
                                    </OffersProvider>
                                  </ManageReturnProvider>
                                </UserNotificationsProvider>
                              </AdminProductsProvider>
                            </OrderDetailsProvider>
                          </AdminOffersProvider>
                        </WishlistProvider>
                      </AddressProvider>
                    </OrderProvider>
                  </UserProvider>
                </CartProvider>
              </ProductProvider>
            </GoogleOAuthProvider>
          </WalletProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>

  </React.StrictMode >
);