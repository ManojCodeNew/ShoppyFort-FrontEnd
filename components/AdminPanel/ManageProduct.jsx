import React, { useEffect } from "react";
import "./styles/ProductTable.css";
import { useNavigate } from "react-router-dom";
import { useAdminProducts } from "./Context/AdminProductsContext";


const ProductTable = () => {
    const { products, setInitialData } = useAdminProducts();
    const navigate = useNavigate();

    console.log("MANAGE PRODUT DATA", products);



    return (
        <div className="table-container">
            <table className="product-table">
                <thead>
                    <tr>
                        <th>SL. No</th>
                        <th>Product id</th>
                        <th>Product</th>
                        <th>Created At</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Publish</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products ? (
                        <>

                            {products.map((product, index) => (
                                <tr key={product.id}>
                                    <td>
                                        <b>{index + 1}</b>
                                    </td>
                                    <td>
                                        <p>{index}</p>
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
                                        <span className={`stock ${getStockClass(product.quantity)}`}>
                                            {product.quantity} in stock
                                        </span>
                                    </td>
                                    <td>{product.price}</td>
                                    <td>
                                        <span className={`status ${product.publishStatus === "Published" ? "published" : "draft"}`}>
                                            {product.publishStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="view-btn" onClick={()=>{
                                            setInitialData(product);
                                            navigate('/admin/products/view')
                                            }}>View</button>
                                        <button className="edit-btn" onClick={() => {
                                            setInitialData(product);
                                            navigate("/admin/products/add");
                                        }}>Edit</button>
                                    </td>
                                </tr>
                            ))
                            }
                        </>


                    ) :
                        (
                            <p>No record found!</p>
                        )
                    }

                </tbody>
            </table>
        </div>
    );
};

const getStockClass = (stock) => {
    if (stock < 0) return "out";
    if (stock > 0 && stock < 20) return "low";
    return "in";
};

export default ProductTable;
