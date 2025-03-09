import React, { useEffect, useState } from "react";
import { useAdminProducts } from "./Context/AdminProductsContext.jsx";
// import Notification from "../Notify/Notification.jsx";
import { useNotification } from "../Notify/NotificationProvider.jsx";
function ImageUpload({ productName, colors }) {
    const { setImages, initialData, removeImgOnDb,setInitialImgData } = useAdminProducts();
    const [selectedImages, setSelectedImages] = useState({});
    const { showNotification } = useNotification();
    let isUpdate = false;

    useEffect(() => {
        const initialImagesState = colors.reduce((acc, color) => {
            acc[color] = initialData?.colorImages?.[color]?.map(imageUrl => ({
                name: imageUrl.split("https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/")[1],
                url: imageUrl,
                file: null
            })) || [];
            return acc;
        }, {});
        setSelectedImages(initialImagesState);
        console.log("Initial Images state :", selectedImages);

    }, [colors, initialData]);

    // console.log("checking selected images: ", selectedImages);

    const handleImageSelection = (e, colorName) => {
        const files = Array.from(e.target.files);

        const newFiles = files.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file),
            file
        }));

        setSelectedImages(prevImages => ({
            ...prevImages,
            [colorName]: [...(prevImages[colorName] || []), ...newFiles],
        }));
        showNotification("Image(s) selected successfully!", "success");
    };

    const removeImage = async (colorName, index, e) => {
        e.preventDefault();
        if (!selectedImages[colorName]) {
            showNotification("Color not found!", "error");
            return;
        }

        const updatedImages = [...selectedImages[colorName]];
        const { url, file } = updatedImages[index] || {};
        if (!url) { showNotification("Selected image is missing!", "error"); return; }

        if (!file) {
            try {
                let imagePath = url.split("https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/")[1];
                console.log("Image Path", url);
                imagePath = imagePath.replace(/\+/g, " ");

                const s3Response = await fetch("http://localhost:3000/delete-image", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imagePath }),
                });

                const s3Result = await s3Response.json();
                console.log("ImageDeleteResponse", s3Result);

                if (s3Result.success) {
                    showNotification(`${s3Result.success}`, "success");
                    let dbResponse = await removeImgOnDb({ id: initialData._id, colorname: colorName, position: index });
                    console.log("dbResponse", dbResponse);
                    if (dbResponse.success) {
                        updatedImages.splice(index, 1);
                        setSelectedImages(prevImages => ({ ...prevImages, [colorName]: updatedImages }));
                        setImages(prevImages => {
                            const updatedState = { ...prevImages };
                            if (updatedState[colorName]) {
                                updatedState[colorName] = updatedState[colorName].filter(img => img.name !== imagePath);
                            }
                            return updatedState;
                        });
                        setInitialImgData(prevImages => {
                            const updatedState = { ...prevImages };
                            if (updatedState[colorName]) {
                                updatedState[colorName] = updatedState[colorName].filter(img => img.name !== imagePath);
                            }
                            return updatedState;
                        });

                        console.log("Updated Frontend State After DB Delete:", updatedImages);

                    } else {
                        showNotification("Failed to remove from DB!", "error");
                    }

                }else {
                    showNotification("Failed to remove from S3!", "error");
                }
            } catch (error) {
                showNotification("ERROR removing an Image", "error");
            }
        } else {
            URL.revokeObjectURL(url);
            updatedImages.splice(index, 1);
            setSelectedImages(prevImages => ({ ...prevImages, [colorName]: updatedImages }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("productName", productName);

        const newImagesMap = {}; // Store only new images to upload
        const updatedImagesMap = {}; // Final image map with S3 paths

        Object.entries(selectedImages).forEach(([color, images]) => {
            const newImages = [];
            const existingImages = [];

            images.forEach((image) => {
                if (image.file) {
                    // ✅ New image: Upload it
                    formData.append("images", image.file);
                    newImages.push(image.file.name);
                    isUpdate = true;
                } else {
                    // ✅ Already existing image from S3
                    existingImages.push(image);
                }

            });


            if (newImages.length > 0) {
                newImagesMap[color] = newImages;
            }

            // Preserve already existing images in updatedImagesMap
            if (existingImages.length > 0) {
                updatedImagesMap[color] = existingImages;
            }

        });

        if (Object.keys(newImagesMap).length > 0) {
            formData.append("colorImages", JSON.stringify(newImagesMap));
        }

        if (isUpdate) {
            try {
                const response = await fetch("http://localhost:3000/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(data.success, "success");

                } else if (data.error) {
                    showNotification(data.error, "error");

                }

                if (data.path) {
                    data.path.forEach(({ color, keys }) => {
                        if (!updatedImagesMap[color]) {
                            updatedImagesMap[color] = [];
                        }

                        updatedImagesMap[color] = [
                            ...(updatedImagesMap[color] || []),
                            ...keys.map(key => ({
                                name: key,
                                url: `https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/${key}`,  // ✅ Store only path, not full URL
                                file: null,
                            })),
                        ];
                    });

                    // ✅ Update frontend state correctly
                    setSelectedImages(updatedImagesMap);
                    console.log("Images ",selectedImages);
                    console.log("Before sending to db", updatedImagesMap);

                    setImages(updatedImagesMap);

                    // ✅ Send only final S3 paths to the database
                    // let imageUpdateResponse = await fetch("http://localhost:3000/admin/updateImages", {
                    //     method: "PUT",
                    //     headers: { "Content-Type": "application/json" },
                    //     body: JSON.stringify({ id: initialData._id, updatedImages: updatedImagesMap }),
                    // });
                    // if (imageUpdateResponse.success) {
                    //     console.log(imageUpdateResponse.success);
                    // }

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
            <button onClick={handleSubmit} style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "green", color: "white" }} >Submit All</button>
        </div>
    );
}

export default ImageUpload;
