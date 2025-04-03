import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import "../styles/pages/CartPage.scss";
import PriceDetails from '../components/PriceDetails.jsx';
import { useNavigate } from 'react-router-dom';
const CartPage = () => {
    const { cartItems, handleRemove, handleQuantityChange, totalCost } = useCart(); // Use the context values
    console.log("ITEM DARTA  originalPrice  price quantity", cartItems);
    // const [defaultImage,setDefaultImage]=useState(cartItems.)

    const navigate=useNavigate();

    const totalMRP = cartItems.reduce((total, item) => total + item.originalPrice * item.quantity, 0);
    const discountMRP = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    return (
        <div className="cart-container">
            <h1 className='cart-heading'>Your Shopping Cart</h1>
            <div className="cart-summary">
                <p className='cart-summary-text'>Total Items: {cartItems.length}</p>
                <p className='cart-summary-text'>Total Cost: ₹{totalCost.toFixed(2)}</p>
            </div>
            {cartItems.length > 0 ? (
                <div className="cartPage-container">
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item._id} className="cart-item">
                                <img src={item.defaultImg} alt={item.name} className="cart-item-image" />
                                <div className="cart-item-details">
                                    <h3 className='cart-item-title'>{item.name}</h3>
                                    {/* {brand.length > 15 ? brand.slice(0, 13) + "...":brand} */}
                                    {/* <p className='cart-item-description'>{item.description.length>50?item.description.slice(0,50)+"...":item.description}</p> */}
                                    <p className='cart-item-price'>Price: ₹{item.price.toFixed(2)}</p>
                                    <div className="cart-item-actions">
                                        <button
                                            className='cart-item-action-btn'
                                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            className='cart-item-action-btn'
                                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="selections">
                                        {item.selections.color && (
                                            <>
                                                <p className='color-title'>Color :<span className='color-Name'> {item.selections.color}</span> </p>
                                            </>)
                                        }
                                        {item.selections.size && (
                                            <>
                                                <p className='size-title'>size :<span className='size-Name'> {item.selections.size}</span> </p>
                                            </>)
                                        }
                                    </div>
                                    <button className="remove-btn" onClick={() => handleRemove(item._id)}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                        <div className='cart-price-details'>
                            <PriceDetails totalMRP={totalMRP} discountMRP={discountMRP} totalCost={totalCost} />

                        <button className="continue-btn" onClick={()=>navigate('/checkout/address')} >Continue</button>
                        </div>

                </div>

            ) : (
                <p className="empty-cart-message">Your cart is empty.</p>
            )}
        </div>
    );
};

export default CartPage;
