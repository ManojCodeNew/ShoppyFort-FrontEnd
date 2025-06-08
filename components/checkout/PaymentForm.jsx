import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/contexts/CartContext';
import { useOrderDetails } from '@/contexts/OrderDetailsContext';
import { useNotification } from '../Notify/NotificationProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import sendPostRequestToBackend from '../Request/Post.jsx';
import "@/styles/checkout/PaymentForm.scss";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#32325d',
            '::placeholder': { color: '#aab7c4' },
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
        },
    },
};
const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { totalCostwithVAT, clearCart } = useCart();
    const { orderDetails, setOrderDetails } = useOrderDetails();
    const { showNotification } = useNotification();
    const { token, user } = useAuth();
    const navigate = useNavigate();


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [zipCode, setZipCode] = useState('');

    const handleZipChange = (e) => {
        setZipCode(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        if (!/^\d{5}$/.test(zipCode)) {
            setError('ZIP code must be exactly 5 digits.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Math.round(totalCostwithVAT * 100) }),
            });
            const data = await response.json();
            console.log("Payment Response:", data);
            if (!response.ok) {
                showNotification(`HTTP error! status: ${response.status}`, "error");
                setLoading(false);
                return;
            }

            const { clientSecret } = data;
            const card = elements.getElement(CardNumberElement);

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card,
                        billing_details: {
                            name: user?.name || 'Customer',
                            email: user?.email || '',
                        },
                    },
                });
            console.log("Stripe Payment Intent:", paymentIntent);
            if (stripeError) {
                setError(stripeError.message);
                showNotification(stripeError.message, 'error');
                setLoading(false);
                return;
            } else if (paymentIntent.status === 'succeeded') {
                try {
                    // Payment successful! Now place the order
                    const orderData = {
                        ...orderDetails,
                        paymentMethod: 'Online',
                        isPaid: true,
                        paymentDetails: {
                            paymentIntentId: paymentIntent.id,
                            amount: paymentIntent.amount / 100, // Convert to base unit
                            currency: paymentIntent.currency,
                            method: 'card',
                            cardLast4: paymentIntent.payment_method?.card?.last4 || '',
                            status: paymentIntent.status
                        },
                        zipCode,
                    };
                    console.log("Final Order Data:", orderData);

                    const orderResponse = await sendPostRequestToBackend('order/addOrder', orderData, token);

                    if (orderResponse.success) {
                        clearCart();
                        navigate('/successToOrder');
                    } else {
                        showNotification(orderResponse.error || "Order placement failed.", "error");
                    }
                } catch (error) {
                    console.error("Order placement error:", err);
                    showNotification(err.message, "error");
                }

            } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method') {
                setError('Authentication required or payment method declined. Please try another card.');
                showNotification('Payment failed: Authentication required or card was declined.', 'error');
            } else {
                setError('Unexpected payment status. Please try again.');
                showNotification(`Unexpected status: ${paymentIntent.status}`, 'error');
            }

        } catch (err) {
            console.error("Payment error:", err);
            showNotification("Payment processing failed.", "error");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className='payment-form'>
            <div className="card-element-wrapper">
                <div className="stripe-box">
                    <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                </div>

                <div className="stripe-row">
                    <div className="stripe-box">
                        <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                    <div className="stripe-box">
                        <CardCvcElement options={CARD_ELEMENT_OPTIONS} className="stripe-input" />
                    </div>
                </div>
            </div>

            <div className="zip-code-wrapper">
                <input
                    type="text"
                    id="zip-code"
                    value={zipCode}
                    onChange={handleZipChange}
                    maxLength="5"
                    placeholder="Enter ZIP Code"
                    required
                />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={!stripe || loading || !/^\d{5}$/.test(zipCode)} className='pay-button'>
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
};

export default PaymentForm;