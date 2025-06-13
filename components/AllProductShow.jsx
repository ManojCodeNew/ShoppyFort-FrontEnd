import { useProducts } from '@/contexts/ProductsContext'
import React from 'react'
import ProductCard from './ProductCard';
import '../styles/components/AllProductShow.scss';

function AllProductShow() {
    const { products } = useProducts();

    return (
        <div className='AllProductShow-container'>
            <h3 className='Products-title'> Products</h3>
            <div className="AllProducts">
                {products &&(
                    products.map((product) => {
                        return (
                            <ProductCard key={product._id} product={product} />
                        )
                    })
                )
                }
            </div>
        </div>
    )
}

export default AllProductShow
