import React, { useState } from 'react'
import { useProducts } from '@/contexts/ProductsContext';
import ProductCard from './ProductCard';
import '../styles/components/Offers.scss';
function Offers() {
    const { products } = useProducts();
    const [offerProduct, setOfferProduct] = useState(products);
    // console.log(offerProduct);

    return (
        <div className='offerProduct-container'>
            {offerProduct.map((product) =>
                product.discount >= 40 && product.gender=='men' || 'women' &&  (
                    <ProductCard key={product.id} product={product} />
                )
            )}
        </div>
    )
}

export default Offers
