import React, { useEffect, useState } from 'react'
import '../../styles/components/Address.scss';
import sendPostRequestToBackend from '../Request/Post.jsx';
import sendGetRequestToBackend from '../Request/Get.jsx';
import { jwtDecode } from 'jwt-decode';
import PriceDetails from '../PriceDetails';
import { useCart } from '@/contexts/CartContext';
import AddressDisplay from '../AddressDisplay';
import { useAddress } from '@/contexts/AddressContext';
import { NavLink } from 'react-router-dom';
import { useOrderDetails } from '@/contexts/OrderDetailsContext';
import { useNavigate } from 'react-router-dom';
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
  const { orderDetails, setOrderDetails } = useOrderDetails();
  const navigate = useNavigate();
  const [showAddressForm, setShowAddressForm] = useState(true);
  const { selectedAddressPresence } = useAddress();

  const [CODSelections, setCODSelections] = useState(false);

  const [active, setActive] = useState({
    homebtn: false,
    workbtn: false
  });
  const { cartItems, totalCost } = useCart(); // Use the context values

  const totalMRP = cartItems.reduce((total, item) => total + item.originalPrice * item.quantity, 0);
  const discountMRP = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const token = localStorage.getItem('user');
  const user = token ? jwtDecode(token) : null;

  useEffect(() => {
    if (user) {
      fetchAddress();
    }else{
      return;
    }
  }, [])

  const fetchAddress = async () => {
    try {

      const response = await sendGetRequestToBackend(`checkout/Address`,token);
      // console.log(response);
      if (response.address.length >= 1) {
        setShowAddressForm(false);
        setAddress(response.address);
      }
    } catch (error) {
      console.error("Error fetching products", error);

    }
  }


  // store form data to the state
  const handleChange = (e) => {
    const { value, type, name, checked } = e.target;
    setAddress((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const addAddress = async (e) => {
    e.preventDefault();
    // console.log("data", address);
    if (user) {
      const addressWithUser = {
        ...address,
        userid: user.id
      }
      if (!active.homebtn && !active.workbtn) {
        alert("Please select an option: Home or Work ");
      } else {
        const response = await sendPostRequestToBackend('checkout/addAddress', addressWithUser,token);
        console.log("RESPONSE OF ADDRSS",response);
        
        if (response.success) {
          window.location.reload();
          setShowAddressForm(false);
        }
      }
    }
  }


  //Button active code
  const activeButton = (e) => {
    const button = e.target.classList[0];
    console.log("clicked class list", button);

    setActive({
      homebtn: button === 'homebtn',
      workbtn: button === 'workbtn'
    });
    setAddress((prevData) => ({
      ...prevData,
      savedaddressas: button === 'homebtn' ? 'Home' : 'Work',
    }))
  }

  const handleCODSelection = () => {
    if (CODSelections === false) {
      setCODSelections(true);
    } else {
      setCODSelections(false);

    }
  }
  const toggleAddressForm = () => {
    setShowAddressForm(true);
  }

  const placeOrder = async () => {
    if (CODSelections === true) {
      setOrderDetails((prevData) => ({
        ...prevData,
        CashOnDelivery: CODSelections,
      })

      );
      const response = await sendPostRequestToBackend('order/addOrder', orderDetails);
      if (response.success) {
        
        navigate('/successToOrder');
      } else {
        alert("Error in placing order ");
      }
    } else {
      alert("Plaese select Payment option")
    }
  }
  return (
    <>


      <div className='Address-page'>
        {showAddressForm ? (
          <div className='Address-container'>
            <form action="" className='contact-details'>
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

              <button className='add-address-btn' onClick={addAddress}>ADD ADDRESS</button>
            </form>

          </div>
        ) :
          <div className="AddressDisplay-container">
            <AddressDisplay addressList={address} toggleAddressForm={toggleAddressForm} />
          </div>

        }
        <div className='cart-price-details'>
          <PriceDetails totalMRP={totalMRP} discountMRP={discountMRP} totalCost={totalCost} />
          {selectedAddressPresence && (
            <>
              <div className="payment-method">
                <input
                  type="radio"
                  className='radio-btn'
                  onClick={handleCODSelection}
                  checked={CODSelections === true}
                />
                <p className='CoD-text'> Cash on Delivery</p>
              </div>
              <button className="place-order-btn" onClick={placeOrder}>Place Order</button>
            </>
          )}

        </div>

      </div>

    </>
  )
}

