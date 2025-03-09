import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import './styles/main.scss';
import ProductProvider from './contexts/ProductsContext';
import { AddressProvider } from './contexts/AddressContext';
import { OrderDetailsProvider } from './contexts/OrderDetailsContext';
import { OrderProvider } from './components/AdminPanel/Context/ManageOrderContext';
import { BrowserRouter } from 'react-router-dom';
import AdminProductsProvider from './components/AdminPanel/Context/AdminProductsContext';
import { NotificationProvider } from './components/Notify/NotificationProvider';
const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <OrderProvider>
          <AuthProvider>
            <ProductProvider>
              <AddressProvider>
                <CartProvider>
                  <WishlistProvider>
                    <OrderDetailsProvider>
                      <AdminProductsProvider>
                        <App />
                      </AdminProductsProvider>
                    </OrderDetailsProvider>
                  </WishlistProvider>
                </CartProvider>
              </AddressProvider>
            </ProductProvider>
          </AuthProvider>
        </OrderProvider>
      </NotificationProvider>
    </BrowserRouter>

  </React.StrictMode>
);