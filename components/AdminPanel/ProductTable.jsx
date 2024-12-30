import React from "react";
import "./styles/ProductTable.css";

const products = [
    {
        id: 1,
        name: "Urban Explorer Sneakers",
        category: "Accessories",
        createdAt: "29 Nov 2024, 1:05 am",
        stock: "out of stock",
        price: "$83.74",
        publishStatus: "Draft",
        image: "sneakers.jpg",
    },
    {
        id: 2,
        name: "Classic Leather Loafers",
        category: "Shoes",
        createdAt: "28 Nov 2024, 12:05 am",
        stock: "72 in stock",
        price: "$97.14",
        publishStatus: "Published",
        image: "loafers.jpg",
    },
    {
        id: 3,
        name: "Mountain Trekking Boots",
        category: "Apparel",
        createdAt: "26 Nov 2024, 11:05 pm",
        stock: "10 low stock",
        price: "$68.71",
        publishStatus: "Published",
        image: "boots.jpg",
    },
    {
        id: 4,
        name: "Elegance Stiletto Heels",
        category: "Shoes",
        createdAt: "25 Nov 2024, 10:05 pm",
        stock: "72 in stock",
        price: "$85.21",
        publishStatus: "Draft",
        image: "heels.jpg",
    },
];

const ProductTable = () => {
    return (
        <div className="table-container">
            <table className="product-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Product</th>
                        <th>Create at</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Publish</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>
                                <input type="checkbox" />
                            </td>
                            <td>
                                <div className="product-info">
                                    <img src={product.image} alt={product.name} />
                                    <div>
                                        <p>{product.name}</p>
                                        <span>{product.category}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{product.createdAt}</td>
                            <td>
                                <span className={`stock ${getStockClass(product.stock)}`}>
                                    {product.stock}
                                </span>
                            </td>
                            <td>{product.price}</td>
                            <td>
                                <span
                                    className={`status ${product.publishStatus === "Published"
                                            ? "published"
                                            : "draft"
                                        }`}
                                >
                                    {product.publishStatus}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const getStockClass = (stock) => {
    if (stock.includes("out of stock")) return "out";
    if (stock.includes("low stock")) return "low";
    return "in";
};

export default ProductTable;
