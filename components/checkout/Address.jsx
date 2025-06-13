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

export default function Address() {
  const [address, setAddress] = useState({
    userid: '',
    username: '',
    mobileno: '',
    pincode: '',
    deliveryaddress: '',
    locality: '',
    city: '',
    state: '',
    savedaddressas: '',
    defaultaddress: false
  });

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

  const fetchAddress = useCallback(async () => {
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
      showNotification("Error fetching products", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  useEffect(() => {
    if (user) {
      fetchAddress();
      fetchCartItems();
      if (paymentMethod === 'Online') {
        document.querySelector('.payment-form')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (!cartItems.length) {
        showNotification("Your cart is empty", "error")
        navigate("/");
        return;
      }
    }

  }, [orderDetails, paymentMethod, user, cartItems.length, navigate, showNotification]);

  useEffect(() => {
    if (wallet && wallet.balance > 0) {
      const usableAmount = Math.min(wallet?.balance, totalCostwithVAT);
      setWalletUsed(parseFloat(usableAmount.toFixed(2)));
      setRemainingAmount(parseFloat(Math.max(0, totalCostwithVAT - usableAmount).toFixed(2)));
    }
  }, [wallet, totalCostwithVAT]);

  // store form data to the state
  const handleChange = (e) => {
    const { value, type, name, checked } = e.target;
    setAddress((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
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
  };
  const validateAddressFields = (address, showNotification) => {
    const requiredFields = [
      { key: 'username', label: 'Name' },
      { key: 'mobileno', label: 'Mobile Number' },
      { key: 'pincode', label: 'Pin Code' },
      { key: 'deliveryaddress', label: 'Address' },
      { key: 'locality', label: 'Locality/Town' },
      { key: 'city', label: 'City/District' },
      { key: 'state', label: 'State' },
      { key: 'savedaddressas', label: 'Home or Work (Save As)' },
    ];

    for (const field of requiredFields) {
      if (!address[field.key] || address[field.key].trim() === '') {
        showNotification(`Please fill out the ${field.label}`, 'error');

        // Try to scroll to the missing field
        const inputElement = document.querySelector(`[name="${field.key}"]`);
        if (inputElement) inputElement.scrollIntoView({ behavior: 'smooth' });
        return false;
      }
    }

    // Optional format checks
    if (!/^\d{6}$/.test(address.pincode)) {
      showNotification('Please enter a valid 6-digit pin code', 'error');
      return false;
    }

    if (!/^\d{10}$/.test(address.mobileno)) {
      showNotification('Please enter a valid 10-digit mobile number', 'error');
      return false;
    }

    return true;
  }

  const addAddress = async (e) => {
    e.preventDefault();

    if (!user) {
      showNotification('Please login first', 'error');
      navigate('/login');
      return; // Prevent further execution
    }

    const isValid = validateAddressFields(address, showNotification);
    if (!isValid) return; // Prevent further execution

    if (!address.savedaddressas) {
      showNotification('Please select Home or Work', 'error');
      return;
    }
    const addressWithUser = {
      ...address,
      userid: user._id
    }
    setLoading(true);

    try {
      const response = await sendPostRequestToBackend('checkout/addAddress', addressWithUser, token);
      if (response.success) {
        showNotification('Address added successfully', 'success');
        fetchAddress(); //Refresh address list
        setShowAddressForm(false);
      } else {
        showNotification(response.error || 'Failed to add address', 'error');
      }
    } catch (error) {
      console.error('Add address error:', error);
      showNotification('Error while adding address', 'error');
    } finally {
      setLoading(false);
    }
  }

  const toggleAddressForm = () => {
    setShowAddressForm(true);
  }

  const placeOrder = async () => {
    if (!paymentMethod && !useWalletMoney) {
      showNotification("Please select Payment option", "error");
      return;
    }
    if (orderPlacementInitiated) {
      showNotification("Order placement is already in progress.", "warning");
      return;
    }

    setOrderPlacementInitiated(true);
    setLoading(true);

    let orderData;
    if (useWalletMoney) {
      let paymentResult = await processWalletPayment(
        totalCostwithVAT,
        orderDetails.orderid,
        'wallet'
      );

      if (!paymentResult.success) {
        setLoading(false);
        setOrderPlacementInitiated(false);
        return;
      }
      orderData = {
        ...orderDetails,
        paymentMethod: useWalletMoney ?
          (paymentResult?.remainingAmount > 0 ? 'wallet_partial' : 'wallet') :
          paymentMethod,
        paymentDetails: {
          amount: totalCostwithVAT,
          currency: 'aed',
          method: 'wallet',
          status: 'succeeded'
        },
        amountPaidFromWallet: paymentResult?.amountPaid || 0,
        isPaid: !useWalletMoney ? false : (remainingAmount === 0)
      };

    } else if (paymentMethod === 'COD') {
      orderData = {
        ...orderDetails,
        paymentMethod: 'COD',
        paymentDetails: {
          method: 'cash',
          status: 'pending',
          amount: totalCostwithVAT,
          currency: 'aed'
        },
        isPaid: false,
        amountPaidFromWallet: 0
      };

    } else {
      return;
    }

    setOrderDetails(orderData);
    setLoading(true);


    try {
      const response = await sendPostRequestToBackend('order/addOrder', orderData, token);
      if (response.success) {
        clearCart();
        await fetchProducts();
        navigate('/successToOrder');
      } else {
        showNotification(response.error || "Error placing order", "error");
      }
    } catch (error) {
      showNotification("Failed to place order", "error");
    } finally {
      setLoading(false);
    }

  }





  return (
    <>
      {/* Loader */}
      {loading && <Loader />}

      <div className='Address-page'>
        {showAddressForm ? (
          <div className='Address-container'>
            <form action="" className='contact-details' onSubmit={addAddress}>
              <label htmlFor="contact-details">CONTACT DETAILS</label>

              <input type="text" name="username" value={address.username} className='name' placeholder='Name*' onChange={handleChange} required />

              <input type="telephone" name="mobileno" value={address.mobileno} className='mobile-number' placeholder='Mobile No*' onChange={handleChange} required />

              <label htmlFor="Address">Address</label>
              <input type="number" name="pincode" value={address.pincode} className='pincode' placeholder='Pin Code*' onChange={handleChange} required />
              <input type="text" name="deliveryaddress" value={address.deliveryaddress} className='address' placeholder='Address(House No, Building,Street,Area)*' onChange={handleChange} required />
              <input type="text" name="locality" value={address.locality} className='locality' placeholder='Locality/Town*' onChange={handleChange} required />

              <div className="city-and-state">
                <input type="text" name="city" value={address.city} className='city' placeholder='City/District*' onChange={handleChange} required />
                <input type="text" name="state" value={address.state} className='state' placeholder='State*' onChange={handleChange} required />
              </div>

              <label htmlFor="save-address-as" className='save-address-as'>SAVE ADDRESS AS</label>
              <div className='save-address-btn-container'>
                <p
                  className={`homebtn ${active.homebtn ? 'active' : ''}`}
                  onClick={activeButton}
                >Home</p>
                <p
                  className={`workbtn ${active.workbtn ? 'active' : ''}`}
                  onClick={activeButton}
                >Work</p>
              </div>

              <div className="checkbox-container">
                <input type="checkbox" name="defaultaddress" className='default-Address-checkbox' onChange={handleChange} checked={address.defaultaddress} /><p>Make this address default  </p>
              </div>

              <button className='add-address-btn' type="submit" disabled={loading}>{loading ? 'Saving...' : 'ADD ADDRESS'}</button>
            </form>

          </div>
        ) : (
          <div className="AddressDisplay-container">
            <AddressDisplay addressList={addressList} toggleAddressForm={toggleAddressForm} />
          </div>

        )}
        <div className='cart-price-details'>
          <PriceDetails totalMRP={totalMRP} discountMRP={discountMRP} totalCost={totalCostwithVAT} VAT_Price={VAT_Price} />
          {selectedAddressPresence && (
            <>
              <div className="payment-method">
                <div className="online_method">
                  <input
                    type="radio"
                    className="radio-btn"
                    checked={paymentMethod === 'Online'}
                    onChange={() => {
                      setPaymentMethod('Online');
                      setUseWalletMoney(false)
                    }}
                  />
                  <label>Card Payment</label>
                  {paymentMethod === 'Online' && !useWalletMoney && < PaymentForm />}
                </div>

                <div className="COD_method">
                  <input
                    type="radio"
                    className="radio-btn"
                    checked={paymentMethod === 'COD'}
                    onClick={() => {
                      setPaymentMethod('COD');
                      setUseWalletMoney(false);
                    }}
                  />
                  <label>Cash on Delivery</label>
                </div>

                {wallet?.balance > 0 && (
                  <div className="wallet_method">
                    <input
                      type="radio"
                      className="radio-btn"
                      checked={useWalletMoney}
                      onChange={() => {
                        setUseWalletMoney(true);
                        setPaymentMethod(null);
                      }}
                    />
                    <label>Pay with Wallet (AED {wallet.balance.toFixed(2)} available)</label>
                    {useWalletMoney && (
                      <div className="wallet-payment-info">
                        <p>Using AED {walletUsed.toFixed(2)} from wallet</p>
                        {remainingAmount > 0 && (
                          <p>Remaining: AED {remainingAmount.toFixed(2)}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
              {(paymentMethod === 'COD' || useWalletMoney) && (
                <button className="place-order-btn" onClick={placeOrder} disabled={walletLoading || orderPlacementInitiated}>
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