import React, { useEffect, useState } from "react";
import "./styles/ProductTable.css";
import { useNavigate } from "react-router-dom";
import { useAdminProducts } from "./Context/AdminProductsContext";
import Loader from "../Load/Loader";
import ConfirmationModal from "./ConfirmationModel";

const ProductTable = () => {
    const { products, setInitialData, deleteProduct } = useAdminProducts();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    useEffect(() => {
        setIsLoading(!products || products.length === 0);
    }, [products]);

    const confirmDelete = (productId) => {
        const product = products.find(p => p._id === productId);
        setSelectedProduct(product);
        setShowDeleteModal(true);

    }
    const handleDeleteConfirm = (productId) => {
        console.log("handleDeleteConfirm",productId);
        
        deleteProduct(productId);
        setShowDeleteModal(false);
        setSelectedProduct(null);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setSelectedProduct(null);
    };
    return (
        <>
            <div className="table-container">
                <h1 className="manage-product-title">Manage Product</h1>
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>SL. No</th>
                            <th>Product id</th>
                            <th>Product</th>
                            <th>Created At</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>
                                    <Loader />
                                </td>
                            </tr>
                        ) : products && products.length > 0 ? (
                            products.map((product, index) => (
                                <tr key={product._id}>
                                    <td>
                                        <b>{index + 1}</b>
                                    </td>
                                    <td>
                                        <p>{product.productid ? product.productid : "N/A"}</p>
                                    </td>
                                    <td>
                                        <div className="product-info">
                                            <img src={product.defaultImg} alt={product.name} />
                                            <div>
                                                <p>{product.name}</p>
                                                <span>{product.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.createdAt ? new Date(product.createdAt).toLocaleString() : "N/A"}</td>
                                    <td className="stock-column">
                                        <span className={`stock ${getStockClass(product.stock)}`}>
                                            {product.stock} in stock
                                        </span>
                                    </td>
                                    <td>{product.price}</td>

                                    <td className="action-btn">
                                        <button className="view-btn" onClick={() => {
                                            setInitialData(product);
                                            navigate('/admin/products/view')
                                        }}>View</button>
                                        <button className="edit-btn" onClick={() => {
                                            setInitialData(product);
                                            navigate("/admin/products/edit");
                                        }}>Edit</button>

                                        <button className="delete-btn" onClick={() => confirmDelete(product._id)}  >Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>
                                    No record found!
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div >
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                product={selectedProduct}
            />
        </>
    );
};

const getStockClass = (stock) => {
    if (stock <= 0) return "out";
    if (stock > 0 && stock < 20) return "low";
    return "in";
};

export default ProductTable;
