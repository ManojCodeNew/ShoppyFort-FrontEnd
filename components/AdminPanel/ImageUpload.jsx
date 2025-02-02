import React, { useState } from "react";
import { useAdminProducts } from "./Context/AdminProductsContext";

function ImageUpload({productName}) {
    const {setImages}=useAdminProducts();
    const [colorImageData, setColorImageData] = useState({});
    const [newColor, setNewColor] = useState("");
    const [selectedImages, setSelectedImages] = useState({});

    // Add a new color section
    const addColor = (colorName) => {
        if (colorName.trim() && !colorImageData[colorName]) {
            setColorImageData({ ...colorImageData, [colorName]: [] });
            setSelectedImages({ ...selectedImages, [colorName]: [] });
            setNewColor("");
        }
    };

    // Handle image selection
    const handleImageSelection = (e, colorName) => {
        const files = Array.from(e.target.files).map((file) => {
            const formattedProductName = productName.trimStart().replace(/\s+/g, '+');
            // Add the product name as a prefix to the file name
            const newFileName = `product_images/${formattedProductName}/${colorName}/${file.name}`; // Concatenate productName with the file name
            return newFileName; // Create a new object with the updated file name
        });
        setSelectedImages((prevImages) => ({
            ...prevImages,
            [colorName]: [...(prevImages[colorName] || []), ...files], // Store only file names
        }));
        console.log(productName,files);
    };
    

    // Handle submit button click to upload all images to the backend
    const handleSubmit = async () => {
        setImages(selectedImages);


        // Clear data after upload
        setColorImageData({});
        setSelectedImages({});
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2>Product Image Uploader</h2>

            {/* Product Name Input */}
            {/* <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Enter product name (e.g., Shirt, Shoes)"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    style={{
                        marginRight: "10px",
                        padding: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        width: "300px",
                    }}
                />
            </div> */}

            {/* Add New Color Section */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Enter color name (e.g., Red, Green)"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    style={{
                        marginRight: "10px",
                        padding: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        width: "300px",
                    }}
                />
                <button
                type="button"
                    onClick={() => addColor(newColor)}
                    style={{
                        padding: "5px 10px",
                        backgroundColor: "blue",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Add Color
                </button>
            </div>

            {/* Display Color Sections */}
            {Object.keys(colorImageData).map((color) => (
                <div
                    key={color}
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        border: "2px solid #333",
                        borderRadius: "5px",
                        backgroundColor: "#f9f9f9",
                    }}
                >
                    <h3>{color}</h3>

                    {/* File Input for Selecting Images */}
                    <input
                        type="file"
                        multiple
                        onChange={(e) => handleImageSelection(e, color)}
                        style={{
                            marginBottom: "10px",
                            padding: "5px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />

                    {/* Preview Selected Images */}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            marginTop: "10px",
                        }}
                    >
                        {/* {(selectedImages[color] || []).map((file, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(file)}
                                alt={`${color} Image ${index + 1}`}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    margin: "5px",
                                    objectFit: "cover",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            />
                        ))} */}
                    </div>
                </div>
            ))}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                Submit All
            </button>
        </div>
    );
}

export default ImageUpload;
