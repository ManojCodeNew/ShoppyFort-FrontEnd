import React, { useCallback, useEffect, useState } from 'react'
import '../../styles/components/Address.scss';
import sendPostRequestToBackend from '../Request/Post.jsx';
import sendGetRequestToBackend from '../Request/Get.jsx';
import PriceDetails from '../PriceDetails';
import { useCart } from '@/contexts/CartContext';
import AddressDisplay from '../AddressDisplay';
import { useAddress } from '@/contexts/AddressContext';
import { useNavigate } from 'react-router-dom';
import { useOrderDetails } from '@/contexts/OrderDetailsContext';
import { useNotification } from '../Notify/NotificationProvider.jsx';
import Loader from '../Load/Loader.jsx';
import PaymentForm from './PaymentForm';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProducts } from '@/contexts/ProductsContext.jsx';
import { useWallet } from '@/contexts/WalletContext.jsx';

// Validation utility functions
const validateMobileNumber = (mobile) => {
  const cleanMobile = mobile.replace(/\s|-/g, '');
  // UAE mobile number patterns: +971XXXXXXXXX, 971XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXXX
  const uaePattern = /^(\+971|971|0)?[5][0-9]{8}$/;
  return uaePattern.test(cleanMobile);
};

const validatePOBox = (pobox) => {
  if (!pobox) return true; // Optional field
  const poboxPattern = /^\d{1,6}$/;
  return poboxPattern.test(pobox);
};

const validateName = (name) => {
  if (!name || name.trim().length < 2) return false;
  // Allow letters, spaces, hyphens, and apostrophes
  const namePattern = /^[a-zA-Z\s'-]{2,50}$/;
  return namePattern.test(name.trim());
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
  const { orderDetails, setOrderDetails } = useOrderDetails();
  const { selectedAddressPresence } = useAddress();
  const { showNotification } = useNotification();

  const navigate = useNavigate();
  const { cartItems, fetchCartItems, totalCostwithVAT, VAT_Price, clearCart } = useCart();
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState({
    homebtn: false,
    workbtn: false
  });
  const { user, token } = useAuth();
  const { fetchProducts } = useProducts();
  const totalMRP = cartItems.reduce((total, item) => total + item.originalPrice * (item.quantity || 1), 0);
  const discountMRP = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const [remainingAmount, setRemainingAmount] = useState(0);
  const [walletUsed, setWalletUsed] = useState(0);
  const [useWalletMoney, setUseWalletMoney] = useState(false);
  const [orderPlacementInitiated, setOrderPlacementInitiated] = useState(false);

  const { wallet, processWalletPayment, loading: walletLoading } = useWallet();

  const totalAmount = parseFloat(totalCostwithVAT || 0);

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
    if (!user || !token) return;
    setLoading(true);
    try {
      const response = await sendGetRequestToBackend(`checkout/Address`, token);
      if (response.address?.length > 0) {
        
        setAddressList(response.address);
        setShowAddressForm(false);
      } else {
        setAddressList([]);
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      showNotification("Error fetching products", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showNotification, user]);

  useEffect(() => {
    if (user && token) {
      fetchAddress();
      fetchCartItems();
    }
  }, [user, token, fetchAddress, fetchCartItems]);

  useEffect(() => {
    if (paymentMethod === 'Online') {
      const paymentForm = document.querySelector('.payment-form');
      if (paymentForm) {
        paymentForm.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (!cartItems.length && user) {
      showNotification("Your cart is empty", "error")
      navigate("/");
    }
  }, [user, cartItems.length, showNotification, navigate]);


  useEffect(() => {
    if (wallet?.balance > 0) {
      const usableAmount = Math.min(wallet.balance, totalAmount);
      setWalletUsed(parseFloat(usableAmount.toFixed(2)));
      setRemainingAmount(parseFloat(Math.max(0, totalAmount - usableAmount).toFixed(2)));
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

    if (!user) {
      showNotification('Please login first', 'error');
      navigate('/login');
      return; // Prevent further execution
    }

    // Validate form
    if (!validateAddressForm()) {
      // Scroll to first error field
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    const addressWithUser = {
      ...address,
      userid: user._id,
      username: address.username.trim(),
      mobileno: address.mobileno.trim(),
      buildingNumber: address.buildingNumber.trim(),
      streetName: address.streetName.trim(),
      area: address.area.trim(),
      city: address.city.trim(),
      pobox: address.pobox.trim(),
    }
    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await sendPostRequestToBackend('checkout/addAddress', addressWithUser, token);
      if (response.success) {
        showNotification('Address added successfully', 'success');
        await fetchAddress(); //Refresh address list
        setShowAddressForm(false);
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
      } else {
        showNotification(response.error || 'Failed to add address', 'error');
      }
    } catch (error) {
      console.error('Add address error:', error);
      showNotification('Error while adding address', 'error');
    } finally {
      setLoading(false);
      setIsSubmitting(false);

    }
  }

  const toggleAddressForm = () => {
    setShowAddressForm(true);
    setFormErrors({});

  }
  const validatePayment = () => {
    if (!paymentMethod && !useWalletMoney) {
      showNotification("Please select a payment method", "error");
      return false;
    }

    if (!selectedAddressPresence) {
      showNotification("Please select a delivery address", "error");
      return false;
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validatePayment()) return;
    // if (!paymentMethod && !useWalletMoney) {
    //   showNotification("Please select Payment option", "error");
    //   return;
    // }
    if (orderPlacementInitiated) {
      showNotification("Order placement is already in progress.", "warning");
      return;
    }

    setOrderPlacementInitiated(true);
    setLoading(true);

    let orderData;
    try {
      if (useWalletMoney) {
        let paymentResult = await processWalletPayment(
          totalAmount,
          orderDetails.orderid,
          'wallet'
        );

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Wallet payment failed');
        }
        orderData = {
          ...orderDetails,
          paymentMethod: paymentResult?.remainingAmount > 0 ? 'wallet_partial' : 'wallet',
          paymentDetails: {
            amount: totalAmount,
            currency: 'aed',
            method: 'wallet',
            status: 'succeeded'
          },
          amountPaidFromWallet: paymentResult?.amountPaid || 0,
          isPaid: remainingAmount === 0
        };

      } else if (paymentMethod === 'COD') {
        orderData = {
          ...orderDetails,
          paymentMethod: 'COD',
          paymentDetails: {
            method: 'cash',
            status: 'pending',
            amount: totalAmount,
            currency: 'aed'
          },
          isPaid: false,
          amountPaidFromWallet: 0
        };

      } else {
        throw new Error('Invalid payment method selected');
      }

      setOrderDetails(orderData);

      const response = await sendPostRequestToBackend('order/addOrder', orderData, token);
      if (response.success) {
        clearCart();
        await fetchProducts();
        navigate('/successToOrder');
      } else {
        throw new Error(response.error || "Error placing order");
      }
    } catch (error) {
      console.error('Order placement error:', error);
      showNotification(error.message || "Failed to place order", "error");
    } finally {
      setLoading(false);
      setOrderPlacementInitiated(false);
    }

  }


  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setUseWalletMoney(false);
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
                <div className={`payment-option online_method ${paymentMethod === 'Online' && !useWalletMoney ? 'selected' : ''}`}>
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
                  <div className={`payment-option wallet_method ${useWalletMoney ? 'selected' : ''}`}>
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
                <button className="place-order-btn" onClick={placeOrder} disabled={walletLoading || orderPlacementInitiated || loading}>
                  {walletLoading ? 'Processing...' : orderPlacementInitiated ? 'Placing Order...' : 'Place Order'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

    </>
  )
}