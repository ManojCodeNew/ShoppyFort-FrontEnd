import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ProductProvider from './contexts/ProductsContext';
import { AddressProvider } from './contexts/AddressContext';
import { OrderDetailsProvider } from './contexts/OrderDetailsContext';
import { OrderProvider } from './components/AdminPanel/Context/ManageOrderContext';
import { BrowserRouter } from 'react-router-dom';
import { AdminProductsProvider } from './components/AdminPanel/Context/AdminProductsContext.jsx';
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
            <GoogleOAuthProvider
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              onScriptLoadError={() => console.error('Google OAuth script failed to load')}
              onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
            >
              <OrderDetailsProvider>
                <ProductProvider>
                  <CartProvider>
                    <AddressProvider>
                      <WishlistProvider>
                        <UserNotificationsProvider>
                          <OffersProvider>
                            <App />
                          </OffersProvider>
                        </UserNotificationsProvider>
                      </WishlistProvider>
                    </AddressProvider>
                  </CartProvider>
                </ProductProvider>
              </OrderDetailsProvider>
            </GoogleOAuthProvider>
          </WalletProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>

  </React.StrictMode >
);