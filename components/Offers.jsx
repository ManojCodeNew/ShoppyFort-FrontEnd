// Offers.jsx
import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { useOffers } from '@/contexts/OffersContext';
import { useProducts } from '@/contexts/ProductsContext';
import { Loader } from 'lucide-react';
import '../styles/components/Offers.scss';
import { useParams } from 'react-router-dom';
function Offers() {
    const { offers, loadingOffers, errorOffers } = useOffers();
    const { products } = useProducts();
    const { offerId } = useParams();
    console.log("OfferId :", offerId, "Offers :", offers);

    const [productsToShow, setProductsToShow] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchRelevantProducts = async () => {
            setLoading(true);
            setError(null);

            if (offerId && offers && offers.length > 0 && products && products.length > 0) {
                const currentOffer = offers.find(offer => offer._id === offerId);

                if (currentOffer) {
                    if (currentOffer.productIds && currentOffer.productIds.length > 0) {
                        console.log("Filtering products by productIds");

                        // Filter products based on productIds from the offer
                        const filteredByProductId = products.filter(product =>
                            currentOffer.productIds.includes(product.productid)
                        );
                        console.log("Filtered Products by Product IDs:", filteredByProductId, " Products:", products);

                        setProductsToShow(filteredByProductId);
                    } else if (currentOffer.productIds && currentOffer.discount > 0) {
                        console.log("Filtering products by productIds and discount");

                        const filteredByDiscountAndProductId = products.filter(product =>
                            currentOffer.productIds.includes(product.productid) && product.discount >= currentOffer.discount
                        )
                        setProductsToShow(filteredByDiscountAndProductId);
                    }
                    else if (currentOffer.discountText) {
                        console.log("Filtering products by discountText");

                        // Filter products based on discountText from the offer
                        const discountValue = parseInt(currentOffer.discountText);
                        if (!isNaN(discountValue)) {
                            const filteredByDiscount = products.filter(product =>
                                product.discount >= discountValue
                            );
                            setProductsToShow(filteredByDiscount);
                        } else {
                            setError("Invalid discount text in offer.");
                        }
                    } else {
                        // If no productIds or discountText, show all products or a default message
                        setProductsToShow(products); // Or set a message like "No specific criteria found."
                    }
                } else {
                    setError("Offer not found.");
                }
            } else if (offerId && (!offers || offers.length === 0)) {
                setError("Loading offers...");
            } else if (offerId && (!products || products.length === 0)) {
                setError("Loading products...");
            }

            setLoading(false);
        };

        fetchRelevantProducts();
    }, [offerId, offers, products]);

    if (loading || loadingOffers) {
        return <div className="offers-loading"><Loader className="spinner" /><p>Loading Products...</p></div>;
    }

    if (error || errorOffers) {
        return <div className="offers-error">Error: {error || errorOffers}</div>;
    }

    return (
        <div className='offers-container'>
            <h2 className="offers-title">{offerId ? 'Products Related to Offer' : 'All Offers'}</h2>
            <div className="offerProduct-container">
                {productsToShow.length > 0 ? (
                    productsToShow.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))
                ) : (
                    <p>{offerId ? 'No products found for this offer.' : 'No offers available.'}</p>
                )}
            </div>
        </div>
    );
}

export default Offers;