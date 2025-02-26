import React, { useEffect, useState } from "react";
import { useAdminProducts } from "./Context/AdminProductsContext";

function ImageUpload({ productName, colors }) {
    const { setImages, initialData } = useAdminProducts();
    const [selectedImages, setSelectedImages] = useState({});

    useEffect(() => {
        const initialImagesState = colors.reduce((acc, color) => {
            acc[color] = initialData?.colorImages?.[color]?.map(imageUrl => ({
                name: imageUrl.split('/').pop(),
                url: imageUrl,
                file: null
            })) || [];
            return acc;
        }, {});
        setSelectedImages(initialImagesState);
    }, [colors, initialData]);

    const handleImageSelection = (e, colorName) => {
        const files = Array.from(e.target.files);
        const formattedProductName = productName.replace(/\s+/g, '+');
        const formattedColorName = colorName.replace(/\s+/g, '+');

        const newFiles = files.map(file => ({
            name: `product_images/${formattedProductName}/${formattedColorName}/${file.name}`,
            url: URL.createObjectURL(file),
            file
        }));

        setSelectedImages(prevImages => ({
            ...prevImages,
            [colorName]: [...(prevImages[colorName] || []), ...newFiles],
        }));
    };

    const removeImage = async (colorName, index, e) => {
        e.preventDefault();
        const updatedImages = [...selectedImages[colorName]];
        const { url, file } = updatedImages[index];

        if (!file) {
            let imagePath = url.split("https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/")[1];
            imagePath = imagePath.replace(/\+/g, " ");
            const response = await fetch("http://localhost:3000/delete-image", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imagePath }),
            });
            const data = await response.json();
            if (data.success) {
                console.log("remove Img RES",data,colorName,index);
                
                updatedImages.splice(index, 1);
                setSelectedImages(prevImages => ({ ...prevImages, [colorName]: updatedImages }));
                setImages(prevImages => {
                    const updatedState = { ...prevImages };
                    if (updatedState[colorName]) {
                        updatedState[colorName] = updatedState[colorName].filter(img => img.name !== imagePath);
                    }
            console.log("IMAGES",updatedState);

                    return updatedState;
                });
            }
            
        } else {
            URL.revokeObjectURL(url);
            updatedImages.splice(index, 1);
            setSelectedImages(prevImages => ({ ...prevImages, [colorName]: updatedImages }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isUpdate = false;

        const formData = new FormData();
        formData.append("productName", productName);

        const colorImagesMap = {}; // Store { "Red": ["newImage1.jpg"], "Blue": ["newImage2.jpg"] }
        const deletedImages = []; // Store images to delete from DB and S3

        Object.entries(selectedImages).forEach(([color, images]) => {
            const newImages = [];
            images.forEach((image) => {
                if (image.file) { // ✅ Only send new images
                    formData.append("images", image.file); // Append actual file
                    isUpdate = true;
                    newImages.push(image.file.name);
                }
            });

            if (newImages.length > 0) {
                colorImagesMap[color] = newImages;
            }
        });

        // ✅ Append colorImages only if new images are added
        if (Object.keys(colorImagesMap).length > 0) {
            formData.append("colorImages", JSON.stringify(colorImagesMap));
        }

        // ✅ If images were deleted, send them to the backend for deletion
        if (deletedImages.length > 0) {
            formData.append("deletedImages", JSON.stringify(deletedImages));
        }

        if (isUpdate) {
            try {
                const response = await fetch("http://localhost:3000/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();
                console.log("Upload successful PATH:", data);

                if (data.path) {
                    const updatedImages = data.path.reduce((acc, { color, keys }) => {
                        acc[color] = keys.map((imageUrl) => ({
                            name: imageUrl,
                            url: `https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/${imageUrl}`,
                            file: null // No file because it's already uploaded
                        }));
                        return acc;
                    }, {});

                    setSelectedImages((prevImgs) => ({
                        ...prevImgs,
                        ...updatedImages,
                    }));

                    setImages((prevImages) => ({
                        ...prevImages,
                        ...updatedImages,
                    }));
                    console.log("UPDATED IMAGES", updatedImages);
                }
            } catch (error) {
                console.error("Upload failed:", error);
            }
        }
    };


    return (
        <div style={{ padding: "20px" }}>
            <h2>Product Image Uploader</h2>
            {colors.length > 0 ? colors.map(color => (
                <div key={color} style={{ marginTop: "20px", padding: "10px", border: "2px solid #333", borderRadius: "5px" }}>
                    <h3>{color}</h3>
                    <input type="file" multiple onChange={(e) => handleImageSelection(e, color)} />
                    <div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px" }}>
                        {(selectedImages[color] || []).map((image, index) => (
                            <div key={index} style={{ position: "relative", margin: "5px" }}>
                                <img src={image.url} alt={`${color} Image ${index + 1}`} style={{ width: "100px", height: "100px" }} />
                                <button onClick={(e) => removeImage(color, index, e)} style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white" }}>x</button>
                            </div>
                        ))}
                    </div>
                </div>
            )) : <p>You haven't selected any colors yet.</p>}
            <button onClick={handleSubmit} style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "green", color: "white" }}>Submit All</button>
        </div>
    );
}

export default ImageUpload;
