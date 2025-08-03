import React, { useCallback, useEffect, useState } from 'react'
import '../../styles/components/Address.scss';
import sendPostRequestToBackend from '../Request/Post.jsx';
import sendGetRequestToBackend from '../Request/Get.jsx';
import PriceDetails from '../PriceDetails.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import AddressDisplay from '../AddressDisplay.jsx';
import { useAddress } from '../../contexts/AddressContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useOrderDetails } from '../../contexts/OrderDetailsContext.jsx';
import { useNotification } from '../Notify/NotificationProvider.jsx';
import Loader from '../Load/Loader.jsx';
import PaymentForm from './PaymentForm.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProducts } from '../../contexts/ProductsContext.jsx';
import { useWallet } from '../../contexts/WalletContext.jsx';
// Validation utility functions
const validateMobileNumber = (mobile) => {
  const cleanMobile = mobile.replace(/\s|-/g, '');
  const uaePattern = /^(\+971|971|0)?(50|51|52|54|55|56|58)[0-9]{7}$/;
  return uaePattern.test(cleanMobile);
};

const validatePOBox = (pobox) => {
  if (!pobox) return true;
  return /^\d{1,6}$/.test(pobox);
};

const validateName = (name) => {
  if (!name || name.trim().length < 2) return false;
  // Supports international characters
  return /^[\p{L}\s'-]{2,50}$/u.test(name.trim());
};

const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export default function Address() {
  const [address, setAddress] = useState({
    userid: '',
    username: '',
    mobileno: '',
    buildingNumber: '',
    streetName: '',
    area: '',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'United Arab Emirates',
    pobox: '',
    savedaddressas: '',
    defaultaddress: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emirates = [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah'
  ];

  const [addressList, setAddressList] = useState([]);

  // Using context hooks
  const navigate = useNavigate();
  const { selectedAddressPresence } = useAddress();
  const { orderDetails, setOrderDetails } = useOrderDetails();
  const { showNotification } = useNotification();
  const { cartItems, fetchCartItems, totalCostwithVAT, VAT_Price, clearCart, totalItems } = useCart();
  const { user, token } = useAuth();
  const { fetchProducts } = useProducts();
  const { wallet = { initialized: false },
    processWalletPayment,
    loading: walletLoading = false,
    getWallet } = useWallet();

  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState({
    homebtn: false,
    workbtn: false
  });

  const totalMRP = cartItems.reduce((total, item) => total + item.originalPrice * (item.quantity || 1), 0);
  const discountMRP = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const [remainingAmount, setRemainingAmount] = useState(0);
  const [walletUsed, setWalletUsed] = useState(0);
  const [useWalletMoney, setUseWalletMoney] = useState(false);
  const [orderPlacementInitiated, setOrderPlacementInitiated] = useState(false);

  const totalAmount = parseFloat(totalCostwithVAT || 0);

  // Fetch wallet and cart data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        if (cartItems.length === 0) {
          await fetchCartItems();
        }
        if (!wallet.initialized && !wallet.loading) {
          await getWallet(true);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      initializeData();
    }
  }, [user, token, getWallet, fetchCartItems, cartItems.length, wallet?.initialized, wallet.loading]);
  // Comprehensive validation function
  const validateAddressForm = () => {
    const errors = {};

    // Required field validations
    if (!validateRequired(address.username)) {
      errors.username = 'Name is required';
    } else if (!validateName(address.username)) {
      errors.username = 'Please enter a valid name (2-50 characters, letters only)';
    }

    if (!validateRequired(address.mobileno)) {
      errors.mobileno = 'Mobile number is required';
    } else if (!validateMobileNumber(address.mobileno)) {
      errors.mobileno = 'Please enter a valid UAE mobile number (e.g., +971 50 123 4567)';
    }

    if (!validateRequired(address.buildingNumber)) {
      errors.buildingNumber = 'Building number is required';
    } else if (address.buildingNumber.trim().length > 20) {
      errors.buildingNumber = 'Building number is too long';
    }

    if (!validateRequired(address.streetName)) {
      errors.streetName = 'Street name is required';
    } else if (address.streetName.trim().length > 100) {
      errors.streetName = 'Street name is too long';
    }

    if (!validateRequired(address.area)) {
      errors.area = 'Area is required';
    } else if (address.area.trim().length > 100) {
      errors.area = 'Area name is too long';
    }

    if (!validateRequired(address.city)) {
      errors.city = 'City is required';
    }

    if (!validateRequired(address.emirate)) {
      errors.emirate = 'Emirate selection is required';
    }

    if (!validateRequired(address.savedaddressas)) {
      errors.savedaddressas = 'Please select Home or Work';
    }

    // Optional field validations
    if (address.pobox && !validatePOBox(address.pobox)) {
      errors.pobox = 'PO Box should contain only numbers (max 6 digits)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchAddress = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await sendGetRequestToBackend('checkout/Address', token);
      console.log('Address API Response:', response); // Debug log

      if (response?.success) {
        // Handle both response.address and response.addresses for API consistency
        const addresses = response.address || response.addresses || [];
        setAddressList(addresses);
        setShowAddressForm(addresses.length === 0);
      } else {
        setError(response?.error || 'Failed to load addresses');
        setAddressList([]);
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Address fetch error:', error);
      setError(error.message || 'Network error loading addresses');
      setAddressList([]);
      setShowAddressForm(true);
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  // Fetch addresses on mount and when token changes
  useEffect(() => {
    if (user && token) {
      fetchAddress();
    }
  }, [user, token, fetchAddress]);


  useEffect(() => {
    if (paymentMethod === 'Online') {
      const paymentForm = document.querySelector('.payment-form');
      if (paymentForm) {
        paymentForm.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [paymentMethod]);

  useEffect(() => {
    // Wallet balance is greater than required total amount
    if (wallet?.balance > 0) {
      const usableAmount = Math.min(wallet.balance, totalAmount);
      const fixedUsable = Math.round(usableAmount * 100) / 100;
      const fixedRemaining = Math.round((totalAmount - fixedUsable) * 100) / 100;

      setWalletUsed(fixedUsable);
      setRemainingAmount(fixedRemaining);
    } else {
      setWalletUsed(0);
      setRemainingAmount(totalAmount);
    }
  }, [wallet, totalAmount]);

  // Clear specific field error when user starts typing
  const clearFieldError = (fieldName) => {
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };


  // store form data to the state
  const handleChange = (e) => {
    const { value, type, name, checked } = e.target;
    setAddress((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearFieldError(name);
  }

  //Button active code
  const activeButton = (e) => {
    const buttonType = e.target.classList.contains('homebtn') ? 'Home' : 'Work';

    setActive({
      homebtn: buttonType === 'Home',
      workbtn: buttonType === 'Work'
    });
    setAddress((prevData) => ({
      ...prevData,
      savedaddressas: buttonType,
    }));
    clearFieldError('savedaddressas');
  };


  const addAddress = async (e) => {
    e.preventDefault();

    if (!user || !token) {
      showNotification('Please login first', 'error');
      navigate('/login');
      return;
    }

    // Validate form
    if (!validateAddressForm()) {
      const firstError = Object.keys(formErrors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.focus();
      }
      return;
    }

    const addressData = {
      userid: user._id,
      username: address.username.trim(),
      mobileno: address.mobileno.trim(),
      buildingNumber: address.buildingNumber.trim(),
      streetName: address.streetName.trim(),
      area: address.area.trim(),
      city: address.city.trim(),
      emirate: address.emirate.trim(),
      country: address.country.trim(),
      pobox: address.pobox.trim(),
      savedaddressas: address.savedaddressas.trim(),
      defaultaddress: Boolean(address.defaultaddress)
    };

    setIsSubmitting(true);
    setLoading(true);
    console.log("Address Data:", addressData);
    try {
      const response = await sendPostRequestToBackend(
        'checkout/addAddress',
        addressData,
        token
      );
      console.log("Address Response:", response, token);
      if (response?.success) {
        showNotification('Address added successfully', 'success');
        await fetchAddress(); // Refresh the address list
        setShowAddressForm(false);
        resetAddressForm();
      } else {
        const errorMsg = response?.error || response?.message || 'Failed to add address';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Add address error:', error);
      showNotification(error.message || 'Error adding address', 'error');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const resetAddressForm = () => {
    setAddress({
      userid: '',
      username: '',
      mobileno: '',
      buildingNumber: '',
      streetName: '',
      area: '',
      city: 'Dubai',
      emirate: 'Dubai',
      country: 'United Arab Emirates',
      pobox: '',
      savedaddressas: '',
      defaultaddress: false
    });
    setActive({ homebtn: false, workbtn: false });
    setFormErrors({});
  };

  const toggleAddressForm = () => {
    setShowAddressForm(true);
    setFormErrors({});

  }
  const validatePayment = () => {
    if (!selectedAddressPresence) {
      showNotification("Please select a delivery address", "error");
      return false;
    }
    if (!paymentMethod && !useWalletMoney) {
      showNotification("Please select a payment method", "error");
      return false;
    }
    if (useWalletMoney && wallet?.balance <= 0) {
      showNotification("Wallet balance is insufficient", "error");
      return false;
    }

    return true;
  };

  const placeOrder = async () => {
    if (orderPlacementInitiated || wallet.loading) return;
    if (!validatePayment()) return;

    if (orderPlacementInitiated) {
      showNotification("Order placement is already in progress.", "warning");
      return;
    }

    setOrderPlacementInitiated(true);
    setLoading(true);

    try {
      // // Update orderDetails with the latest totalprice and other necessary fields
      // setOrderDetails((prev) => ({
      //   ...prev,
      //   userid: user._id,
      //   items: cartItems.map((item) => ({
      //     productid: item._id,
      //     quantity: item.quantity || 1,
      //     price: item.price,
      //     selections: item.selections || {}
      //   })),
      //   shippingaddress: selectedAddressPresence,
      //   totalprice: totalAmount, // Ensure totalprice is set correctly
      //   paymentMethod: useWalletMoney
      //     ? (walletUsed < totalAmount ? 'wallet_partial' : 'wallet')
      //     : paymentMethod,
      //   paymentDetails: {
      //     amount: totalAmount,
      //     currency: 'AED',
      //     method: useWalletMoney ? 'wallet' : paymentMethod.toLowerCase(),
      //     status: 'pending',
      //     walletAmount: useWalletMoney ? walletUsed : 0,
      //     remainingAmount: useWalletMoney ? remainingAmount : totalAmount
      //   },
      //   isPaid: false
      // }));

      const orderData = {
        ...orderDetails,
        paymentMethod: useWalletMoney
          ? (walletUsed < totalAmount ? 'wallet_partial' : 'wallet')
          : paymentMethod,
        paymentDetails: {
          amount: totalAmount,
          currency: 'AED',
          method: useWalletMoney ? 'wallet' : paymentMethod.toLowerCase(),
          status: 'pending',
          walletAmount: useWalletMoney ? walletUsed : 0,
          remainingAmount: useWalletMoney ? remainingAmount : totalAmount
        },
        isPaid: false
      };
      console.log("Order Data:", orderData);
      const response = await sendPostRequestToBackend('order/addOrder', orderData, token);
      console.log("Order Response:", response);
      if (!response.success) {
        throw new Error(response.error || "Failed to place order");
      }
      setOrderDetails(response.order);


      let paymentResult = null;

      if (useWalletMoney && response.success) {
        try {
          paymentResult = await processWalletPayment(
            walletUsed,
            response.order.orderid || orderDetails.orderid,
            'wallet'
          );


          if (!paymentResult.success) {
            throw new Error(paymentResult.error || 'Wallet payment failed');
          }
          const paymentUpdateData = {
            orderId: response.order._id,
            paymentStatus: paymentResult.remaining > 0 ? 'partial' : 'completed',
            paidAmount: paymentResult.amountPaid,
            paymentMethod: paymentResult.remaining > 0 ? 'wallet_partial' : 'wallet'
          };

          const paymetStatusUpdateResponse = await sendPostRequestToBackend('order/updatePaymentStatus', paymentUpdateData, token);
          if (!paymetStatusUpdateResponse.success) {
            throw new Error(paymetStatusUpdateResponse.error || 'Failed to update payment status');
          }
          setOrderDetails(paymetStatusUpdateResponse.order);

        } catch (walletError) {
          console.error('Wallet payment error:', walletError);
          // Since order is already created, you could either:
          // 1. Cancel the order, or 
          // 2. Keep it as pending payment
          showNotification("Order created but wallet payment failed. Please contact support.", "warning");
          throw walletError;
        }
      }
      await clearCart();
      await fetchProducts();
      showNotification("Order placed successfully!", "success");
      navigate('/successToOrder');

    } catch (error) {
      console.error('Order placement error:', error);
      showNotification(error.message || "Failed to place order", "error");

    } finally {
      setLoading(false);
      setOrderPlacementInitiated(false);
    }

  }


  const handlePaymentMethodChange = (method) => {
    if (method === 'wallet') {
      setUseWalletMoney(true);
      setPaymentMethod('');
    } else {
      setUseWalletMoney(false);
      setPaymentMethod(method);
    }
  };

  const handleWalletPaymentChange = () => {
    setUseWalletMoney(true);
    setPaymentMethod('');
  };

  return (
    <>
      {/* Loader */}
      {loading && <Loader />}

      <div className='Address-page'>
        {showAddressForm ? (
          <div className='Address-container'>
            <form action="" className='contact-details' onSubmit={addAddress}>
              <div className="form-section">
                <h3 className="section-title"> CONTACT DETAILS</h3>
                <div className='input-group'>
                  <input
                    type="text"
                    name="username"
                    value={address.username}
                    className={`form-input name ${formErrors.username ? 'error' : ''}`}
                    placeholder='Full Name*'
                    onChange={handleChange}
                    maxLength="50"
                    required
                  />
                  {formErrors.username && <span className="error-message">{formErrors.username}</span>}
                </div>

                <div className="input-group">
                  <input
                    type="tel"
                    name="mobileno"
                    pattern="^(\+971|971|0)?(50|51|52|54|55|56|58)[0-9]{7}$"
                    value={address.mobileno}
                    className='form-input mobile-number'
                    placeholder='Mobile Number* (+971 50 123 4567)'
                    onChange={handleChange}
                    required
                  />
                  {formErrors.mobileno && <span className="error-message">{formErrors.mobileno}</span>}
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">🏠 ADDRESS DETAILS</h3>

                <div className="address-row">
                  <div className="input-group">
                    <input
                      type="text"
                      name="buildingNumber"
                      value={address.buildingNumber}
                      className={`form-input building-number ${formErrors.buildingNumber ? 'error' : ''}`}
                      placeholder='Building Number*'
                      onChange={handleChange}
                      maxLength="20"
                      required
                    />
                    {formErrors.buildingNumber && <span className="error-message">{formErrors.buildingNumber}</span>}
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      name="streetName"
                      value={address.streetName}
                      className={`form-input street-name ${formErrors.streetName ? 'error' : ''}`}
                      placeholder='Street Name*'
                      onChange={handleChange}
                      maxLength="100"
                      required
                    />
                    {formErrors.streetName && <span className="error-message">{formErrors.streetName}</span>}
                  </div>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="area"
                    value={address.area}
                    className={`form-input area ${formErrors.area ? 'error' : ''}`}
                    placeholder='Area/Neighborhood*'
                    onChange={handleChange}
                    maxLength="100"
                    required
                  />
                  {formErrors.area && <span className="error-message">{formErrors.area}</span>}
                </div>

                <div className="city-and-emirate">
                  <div className="input-group">
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      className={`form-input city ${formErrors.city ? 'error' : ''}`}
                      placeholder='City*'
                      onChange={handleChange}
                      required
                    />
                    {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                  </div>

                  <div className="input-group">
                    <select
                      name="emirate"
                      value={address.emirate}
                      className={`form-input emirate-select ${formErrors.emirate ? 'error' : ''}`}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Emirate*</option>
                      {emirates.map(emirate => (
                        <option key={emirate} value={emirate}>{emirate}</option>
                      ))}
                    </select>
                    {formErrors.emirate && <span className="error-message">{formErrors.emirate}</span>}
                  </div>
                </div>

                <div className="additional-info">
                  <div className="input-group">
                    <input
                      type="text"
                      name="pobox"
                      value={address.pobox}
                      className={`form-input pobox ${formErrors.pobox ? 'error' : ''}`}
                      placeholder='PO Box (Optional)'
                      onChange={handleChange}
                      maxLength="6"
                    />
                    {formErrors.pobox && <span className="error-message">{formErrors.pobox}</span>}
                  </div>
                </div>

              </div>

              <div className="save-address-section">
                <label className='save-address-as'>SAVE ADDRESS AS</label>
                <div className='save-address-btn-container'>
                  <button
                    type='button'
                    className={`homebtn ${active.homebtn ? 'active' : ''}`}
                    onClick={activeButton}
                  >Home</button>
                  <button
                    type='button'
                    className={`workbtn ${active.workbtn ? 'active' : ''}`}
                    onClick={activeButton}
                  >Work</button>
                </div>
                {formErrors.savedaddressas && <span className="error-message">{formErrors.savedaddressas}</span>}
              </div>

              <div className="checkbox-container">
                <input type="checkbox" name="defaultaddress" className='default-Address-checkbox' onChange={handleChange} checked={address.defaultaddress} /><label>Make this address default  </label>
              </div>

              <button className='add-address-btn' type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'ADD ADDRESS'}</button>
            </form>

          </div>
        ) : (
          <div className="AddressDisplay-container">
            <AddressDisplay addressList={addressList} toggleAddressForm={toggleAddressForm} />
          </div>

        )}
        <div className='cart-price-details'>
          <PriceDetails totalMRP={totalMRP} discountMRP={discountMRP} totalCost={totalAmount} VAT_Price={VAT_Price} />
          {selectedAddressPresence && (
            <>
              <div className="payment-method-title">Choose Payment Method</div>

              <div className="payment-method">
                <div className={`payment-option ${paymentMethod === 'Online' && !useWalletMoney ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    className="radio-btn"
                    checked={paymentMethod === 'Online' && !useWalletMoney}
                    onChange={() => handlePaymentMethodChange('Online')}
                  />
                  <div className="payment-content">
                    <label className="payment-label">
                      <div className="payment-icon card-icon">💳</div>
                      Card Payment
                    </label>
                    <div className="payment-description">
                      Pay securely with your credit or debit card
                    </div>
                    {paymentMethod === 'Online' && !useWalletMoney && (
                      <div className="payment-form">
                        <PaymentForm />
                      </div>
                    )}
                  </div>
                </div>


                <div className={`payment-option COD_method ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    className="radio-btn"
                    checked={paymentMethod === 'COD'}
                    onChange={() => handlePaymentMethodChange('COD')}
                  />
                  <div className="payment-content">
                    <label className="payment-label">
                      <div className="payment-icon cod-icon">💰</div>
                      Cash on Delivery
                    </label>
                    <div className="payment-description">
                      Pay with cash when your order is delivered
                    </div>
                  </div>
                </div>

                {wallet?.balance > 0 && (
                  <div className={`payment-option ${useWalletMoney ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      className="radio-btn"
                      checked={useWalletMoney}
                      onChange={handleWalletPaymentChange}

                    />
                    <div className="payment-content">
                      <label className="payment-label">
                        <div className="payment-icon wallet-icon">🏦</div>
                        Pay with Wallet
                        <span className="wallet-balance">(AED {wallet.balance} available)</span>
                      </label>
                      <div className="payment-description">
                        Use your wallet balance for instant payment
                      </div>
                      {useWalletMoney && (
                        <div className="wallet-payment-info">
                          <p>Using AED {walletUsed.toFixed(2)} from wallet</p>
                          {remainingAmount > 0 && (
                            <p>Remaining: AED {remainingAmount.toFixed(2)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
              {(paymentMethod === 'COD' || useWalletMoney) && (
                <button
                  className="place-order-btn"
                  onClick={placeOrder}
                  disabled={loading || orderPlacementInitiated || walletLoading}
                >
                  {loading || orderPlacementInitiated ? (
                    <>
                      <span className="spinner"></span> Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

    </>
  )
}