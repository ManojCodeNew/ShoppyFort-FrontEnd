import React from "react";
import { motion } from "framer-motion";
import "./Loader.css"
const Loader = () => {
    return (
        <div className="loader-overlay">
            <motion.div
                className="loader"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
        </div>
    );
};

export default Loader;
