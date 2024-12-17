import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import '../styles/components/cart-modal.scss';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const CartModal = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, totalItems, totalAmount } = useCart();
  // console.log("Items",items);
  const navigation = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="cart-modal">
        <div className="cart-header">
          <div className="header-content">
            <ShoppingBag />
            <h2>Shopping Bag ({totalItems})</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} />
              <p>Your shopping bag is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <div className="item-info">
                    <h3>{item.brand}</h3>
                    <p>{item.name}</p>
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(0, item.quantity - 1))}
                        className="quantity-btn"
                      >
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="price-info">
                      <p className="price">₹{item.price * item.quantity}</p>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="total">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
            <Link to="/checkout/Address">
              <button className="checkout-btn"
                onClick={() => {
                  onClose();
                  navigation('/checkout/Address');
                  

                }
                } >
                Place Order
              </button>
            </Link>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;