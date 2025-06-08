import React from 'react'
import "../styles/components/ProductDetails.scss";
import { useCart } from '../contexts/CartContext';
export default function PriceDetails({ totalMRP, discountMRP }) {
    const { totalCostwithVAT, VAT_Price, totalCost_of_products } = useCart(); // Use the context values
    console.log("PriceDetails component rendered with totalMRP:", totalMRP, "discountMRP:", discountMRP, "totalCost:", totalCostwithVAT, "VAT_Price:", VAT_Price);

    return (
        <>
            <div>
                <h3>PRICE DETAILS</h3>
                <table className='price-details-container'>
                    <tbody className='price-details-body'>
                        <tr>
                            <td>Total MRP</td>
                            <td className='td'> <small className="currency-label">AED</small>{totalMRP}</td>

                        </tr>
                        <tr className='discount-on-MRP'>
                            <td >Discount on MRP</td>
                            <td className='td'>- <small className="currency-label">AED</small>{totalMRP - discountMRP}</td>

                        </tr>
                        <tr className='VAT-rate'>
                            <td >VAT</td>
                            {/* Total 5% VAT value display Here  */}
                            <td className='td'> <small className="currency-label">AED</small>{VAT_Price}</td>

                        </tr>
                        <tr className='platform-fee'>
                            <td >Platform fee <span>Know More</span></td>
                            <td className='td'>  Free</td>

                        </tr>
                        <tr >
                            <td className='shipping-fee'>Shipping fee <span className='Know-more'>Know More</span> <p className='free-shipping-for-you'> shipping for you</p></td>
                            <td className='shipping-fee-free'><span className='strikeout-amt'> <small className="currency-label">AED</small>79</span>   Free</td>
                        </tr>

                        {/* <hr /> */}

                        <tr className="Total-amt">
                            <td>Total Amount</td>
                            <td> <small className="currency-label">AED</small>{totalCostwithVAT}</td>

                        </tr>
                    </tbody>
                </table>


            </div>

        </>
    )
}
