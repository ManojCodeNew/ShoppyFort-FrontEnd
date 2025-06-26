import React, { useEffect, useState } from "react";
import "../styles/components/AddressDisplay.scss"; 
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
    const { cartItems, totalCostwithVAT } = useCart();
    const { user, token } = useAuth();

    // Access Token

    const navigate = useNavigate();
    const { setOrderDetails } = useOrderDetails();
    const addNewAddress = () => {
        toggleAddressForm();
    };

    const generateOrderId = () => {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 6);
        return `SH-${timestamp}-${randomStr}`.toUpperCase();
    };

    const setOrderDetailsDataToContext = () => {
        if (token && selectedAddress) {
            const shippingAddress = addressData.find(address => address._id === selectedAddress);

            if (shippingAddress) {
                const orderDetails = {
                    orderid: generateOrderId(),
                    userid: user._id,
                    shippingaddress: shippingAddress,
                    items: cartItems,
                    totalprice: totalCostwithVAT
                }
                setOrderDetails(orderDetails);
            }
        }
    };



    useEffect(() => {
        const defaultaddress = addressData.find(address => address.defaultaddress === "true");
        if (defaultaddress) {
            setSelectedAddress(defaultaddress._id);
        }
        // If no addresses, do not reload. Show message instead in render.
    }, [addressData])

    useEffect(() => {
        if (selectedAddress) {
            setSelectedAddressPresence(selectedAddress)
            setOrderDetailsDataToContext();
        }
    }, [selectedAddress, addressData, cartItems, totalCostwithVAT, token, user]);

    // Keep addressData in sync with addressList prop
    useEffect(() => {
        setAddressData(addressList);
    }, [addressList]);

    const removeAddress = async (addressid) => {
        try {
            const response = await sendPostRequestToBackend('checkout/address/remove', { addressid });
            if (response.success) {
                setAddressData(currentItems => currentItems.filter(item => item._id !== addressid));
                // If removed address was selected, clear selection
                if (selectedAddress === addressid) {
                    setSelectedAddress(null);
                    setSelectedAddressPresence(null);
                }
            }
        } catch (error) {
            console.error('Error removing address:', error);
        }
    };

    const handleCheckboxChange = (addressId) => {
        setSelectedAddress(addressId);
    };
    // Helper function to format address display
    const formatAddress = (address) => {
        const parts = [];

        if (address.buildingNumber) parts.push(address.buildingNumber);
        if (address.streetName) parts.push(address.streetName);
        if (address.area) parts.push(address.area);

        return parts.join(', ');
    };
    const formatCityState = (address) => {
        const parts = [];

        if (address.city) parts.push(address.city);
        if (address.emirate) parts.push(address.emirate);
        if (address.pobox) parts.push(`P.O. Box: ${address.pobox}`);

        return parts.join(', ');
    };

    return (
        <div className="addressDisplay-page">
            <div className="addressDisplayPage-container">
                <h2>Select Delivery Address</h2>
                {addressData.length === 0 ? (
                    <div className="no-address-message">
                        <p>No addresses found. Please add a new address to continue.</p>
                        <button className="add-new-address" onClick={addNewAddress}>Add New Address</button>
                    </div>
                ) : (
                    addressData.map((address) => (
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
                                    <p>
                                        {address.username}
                                        <span className="home-tag">{address.savedaddressas}</span>
                                        {address.defaultaddress && <span className="default-tag">Default</span>}
                                    </p>
                                    <p>{formatAddress(address)}</p>
                                    <p>{formatCityState(address)}</p>
                                    <p>{address.country}</p>
                                    <p>Mobile: {address.mobileno}</p>
                                </div>
                            </div>
                            <div className="addressDisplay-card-right">
                                <p onClick={() => removeAddress(address._id)} className="removeAddress-btn" aria-label="Remove address"> X</p>
                            </div>
                        </div>
                    ))
                )}
                {addressData.length > 0 && addressData.length < 3 && (
                    <button className="add-new-address" onClick={addNewAddress}>Add New Address</button>
                )}
            </div>
        </div>
    );
};

export default AddressDisplay;
