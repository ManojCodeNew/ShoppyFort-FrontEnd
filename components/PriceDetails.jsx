import React from 'react'
import "../styles/components/ProductDetails.scss";
export default function PriceDetails({ totalMRP, discountMRP,totalCost }) {
    // console.log(totalCost,totalMRP,discountMRP);
    
    return (
        <>
        <div>
            <h3>PRICE DETAILS</h3>
            <table className='price-details-container'>
                <tbody className='price-details-body'>
                    <tr>
                        <td>Total MRP</td>
                        <td className='td'>&#8377;{totalMRP}</td>

                    </tr>
                    <tr className='discount-on-MRP'>
                        <td >Discount on MRP</td>
                        <td className='td'>-&#8377;{totalMRP - discountMRP}</td>

                    </tr>
                    <tr className='platform-fee'>
                        <td >Platform fee <span>Know More</span></td>
                        <td className='td'>  Free</td>

                    </tr>
                    <tr >
                        <td className='shipping-fee'>Shipping fee <span className='Know-more'>Know More</span> <p className='free-shipping-for-you'> shipping for you</p></td>
                        <td className='shipping-fee-free'><span className='strikeout-amt'>&#8377;79</span>   Free</td>
                    </tr>

                    {/* <hr /> */}

                    <tr className="Total-amt">
                        <td>Total Amount</td>
                        <td>&#8377;{totalCost}</td>

                    </tr>
                </tbody>
            </table>

            
        </div>

        </>
    )
}
