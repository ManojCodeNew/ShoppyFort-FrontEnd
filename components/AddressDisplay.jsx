
import React, { useEffect, useState } from "react";
import "../styles/components/AddressDisplay.scss"; // Make sure to include styles
import { useAddress } from "@/contexts/AddressContext";
import sendPostRequestToBackend from "./Request/Post";
import { useNavigate } from "react-router-dom";
import { useOrderDetails } from "@/contexts/OrderDetailsContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
const AddressDisplay = ({ addressList, toggleAddressForm }) => {
    const [addressData, setAddressData] = useState(addressList);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const { selectedAddressPresence, setSelectedAddressPresence } = useAddress();
    const { cartItems, totalCost } = useCart();
    const { user, token } = useAuth();

    // Access Token

    const navigate = useNavigate();
    const addNewAddress = () => {
        toggleAddressForm();
    };

    const { setOrderDetails } = useOrderDetails();

    const setOrderDetailsDataToContext = () => {
        if (token) {
            const generateOrderId = () => {
                return `SH-${Math.floor(1000 + Math.random() * 9000)}`; // Generates SH-XXXX (4-digit number)
            };

            const shippingAddress = addressData.find(address => address._id === selectedAddress);

            if (shippingAddress) {
                const orderDetails = {
                    orderid: generateOrderId(),
                    userid: user._id,
                    shippingaddress: shippingAddress,
                    items: cartItems,
                    totalprice: totalCost
                }
                setOrderDetails(orderDetails);
            }
        }
    }



    useEffect(() => {
        const defaultaddress = addressData.find(address => address.defaultaddress === "true");
        if (defaultaddress) {

            setSelectedAddress(defaultaddress._id);

        }
        if (addressData.length <= 0) {
            window.location.reload();
            navigate('checkout/Address');
        }

    }, [addressData])

    useEffect(() => {
        if (selectedAddress) {
            setSelectedAddressPresence(selectedAddress)
            setOrderDetailsDataToContext();
        }
    }, [selectedAddress]);

    const removeAddress = async (addressid) => {
        const response = await sendPostRequestToBackend('checkout/address/remove', { addressid });
        if (response.success) {
            setAddressData(currentItems => currentItems.filter(item => item._id !== addressid));
        }
    };

    const handleCheckboxChange = (addressId) => {
        setSelectedAddress(addressId);
        setSelectedAddressPresence(addressId);
    };

    return (
        <div className="addressDisplay-page">
            <div className="addressDisplayPage-container">
                <h2>Select Delivery Address</h2>
                {addressData.map((address) => (
                    <div className="addressDisplay-card" key={address._id}>
                        <div className="addressDisplay-card-left">
                            <input
                                type="radio"
                                name="selectedAddress"
                                value={address._id}
                                checked={selectedAddress === address._id}
                                onChange={() => handleCheckboxChange(address._id)}
                            />
                            <div className="addressDisplay-details">
                                <p>{address.username} <span className="home-tag">{address.savedaddressas}</span></p>
                                <p>{address.deliveryaddress}</p>
                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                <p>Mobile: {address.mobileno}</p>
                            </div>
                        </div>
                        <div className="addressDisplay-card-right">
                            <p onClick={() => removeAddress(address._id)} className="removeAddress-btn"> X</p>
                        </div>
                    </div>
                ))}
                {addressData.length < 3 && (
                    <button className="add-new-address" onClick={addNewAddress}>Add New Address</button>
                )}
            </div>
        </div>
    );
};

export default AddressDisplay;

