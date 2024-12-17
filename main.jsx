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
import { BrowserRouter } from 'react-router-dom';
const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
                <BrowserRouter>

    <AuthProvider>
      <ProductProvider>
        <AddressProvider>
          <CartProvider>
            <WishlistProvider>
              <OrderDetailsProvider>
                  <App />
              </OrderDetailsProvider>
            </WishlistProvider>
          </CartProvider>
        </AddressProvider>
      </ProductProvider>
    </AuthProvider>
    </BrowserRouter>

  </React.StrictMode>
);