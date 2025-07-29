import sendGetRequestToBackend from "@/components/Request/Get";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotification } from "@/components/Notify/NotificationProvider";
import { useAuth } from "./AuthContext.jsx";

// Create Context
const OffersContext = createContext();

// Create the provider
export function OffersProvider({ children }) {
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const fetchOffersForUser = async () => {
    setLoadingOffers(true);
    setErrorOffers(null);
    try {
      const response = await sendGetRequestToBackend('api/offers', token);
      if (response && response.success && Array.isArray(response.offers)) {
        setOffers(response.offers);
      } else {
        setErrorOffers("Failed to fetch offers or invalid response format");
      }
    } catch (error) {
      setErrorOffers("Error fetching offers: " + error.message);
      showNotification("Error fetching offers", "error");
    } finally {
      setLoadingOffers(false);
    }
  };

  return (
    <OffersContext.Provider value={{ offers, loadingOffers, errorOffers, fetchOffersForUser }}>
      {children}
    </OffersContext.Provider>
  );
}

// Create a custom hook to use the context
export function useOffers() {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error("useOffers must be used within an OffersProvider");
  }
  return context;
}