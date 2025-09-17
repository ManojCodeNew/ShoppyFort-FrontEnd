// Offers.jsx
import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { useOffers } from '@/contexts/OffersContext';
import { useProducts } from '@/contexts/ProductsContext';
import { Loader } from 'lucide-react';
import '../styles/components/Offers.scss';
import { useParams } from 'react-router-dom';
function Offers() {
    const { offers, loadingOffers, errorOffers, fetchOffersForUser } = useOffers();
    const { products } = useProducts();
    const { offerId } = useParams();

    const [productsToShow, setProductsToShow] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //Fetch offers when the page loads
    useEffect(() => {
        fetchOffersForUser();
    }, [])

    useEffect(() => {
        const fetchRelevantProducts = async () => {
            setLoading(true);
            setError(null);

            if (offerId && offers && offers.length > 0 && products && products.length > 0) {
                const currentOffer = offers.find(offer => offer._id === offerId);
                // console.log("current offers :", currentOffer);

                if (currentOffer) {
                    const { productIds = [], discountText } = currentOffer;
                    let filteredProducts = [];
                    let productIdProducts = [];
                    let discountProducts = [];

                    // 1. If productIds are present, get those products first
                    if (productIds && productIds.length > 0) {
                        productIdProducts = products.filter(product =>
                            productIds.includes(product.productid)
                        );
                    }

                    // 2. If discountText is present, get products with discount <= discountValue
                    if (discountText) {
                        // Extract numeric value from discount text (e.g., "30% OFF" -> 30)
                        const discountMatch = discountText.match(/\d+/);
                        if (discountMatch) {
                            const discountValue = parseInt(discountMatch[0]);
                            discountProducts = products.filter(product =>
                                product.discount && product.discount <= discountValue && product.discount > 0
                            );
                        }
                    }

                    // 3. Combine results (productIds first, then discount products, no duplicates)
                    if (productIdProducts.length > 0 || discountProducts.length > 0) {
                        const productIdSet = new Set(productIdProducts.map(p => p._id));
                        
                        // Start with productId products
                        filteredProducts = [...productIdProducts];
                        
                        // Add discount products that aren't already included
                        const additionalDiscountProducts = discountProducts.filter(p => !productIdSet.has(p._id));
                        filteredProducts = [...filteredProducts, ...additionalDiscountProducts];
                        
                        // Sort by discount descending (highest discount first)
                        filteredProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
                    } else {
                        filteredProducts = [];
                    }

                    setProductsToShow(filteredProducts);
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
            {/* Offer Banner Section */}
            {offerId && offers && offers.length > 0 && (
                (() => {
                    const currentOffer = offers.find(offer => offer._id === offerId);
                    if (!currentOffer) return null;
                    return (
                        <div className="offer-hero-banner">
                            <img className="offer-hero-image" src={currentOffer.imageUrl} alt={currentOffer.title} />
                            <div className="offer-hero-content">
                                <h1 className="offer-hero-title">{currentOffer.title}</h1>
                                {currentOffer.description && <p className="offer-hero-desc">{currentOffer.description}</p>}
                                {currentOffer.discountText && <span className="offer-hero-discount">{currentOffer.discountText}</span>}
                            </div>
                        </div>
                    );
                })()
            )}
            <div className="offers-card">
                <h2 className="offers-title">
                    {offerId ? (
                        (() => {
                            const currentOffer = offers.find(offer => offer._id === offerId);
                            const discountMatch = currentOffer?.discountText?.match(/\d+/);
                            const discountValue = discountMatch ? discountMatch[0] : null;
                            return discountValue ? 
                                `Products with up to ${discountValue}% discount` : 
                                'Products Related to Offer';
                        })()
                    ) : 'All Offers'}
                </h2>
                <div className="offerProduct-container">
                    {productsToShow.length > 0 ? (
                        productsToShow.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    ) : (
                        <p className="offers-empty">{offerId ? 'No products found for this offer.' : 'No offers available.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Offers;