import React, { useState } from 'react'
import { useProducts } from '@/contexts/ProductsContext';
import ProductCard from './ProductCard';
import '../styles/components/Offers.scss';
function Offers() {
    const { products } = useProducts();
    const [offerProduct, setOfferProduct] = useState(products);
    // console.log(offerProduct);

    return (
        <>
        <h2 className='offers-title' >Offers</h2>
        <div className='offerProduct-container'>
            
            {offerProduct.map((product) =>
                product.discount >= 50 &&  (
                    <ProductCard key={product.id} product={product} />
                )
            )}
        </div>
        </>
    )
}

export default Offers
