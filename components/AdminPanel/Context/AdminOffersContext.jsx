import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotification } from '@/components/Notify/NotificationProvider';
import sendGetRequestToBackend from '@/components/Request/Get';
import sendDeleteRequestToBackend from '@/components/Request/Delete';
import { useUserContext } from './ManageUsersContext'; // Assuming you need the token

const AdminOffersContext = createContext();

function AdminOffersProvider({ children }) {
    const [offers, setOffers] = useState([]);
    const { showNotification } = useNotification();
    const { token } = useUserContext();

    const getOffers = useCallback(async () => {
        try {
            const response = await sendGetRequestToBackend("admin/offers", token);
            if (response.offers) {
                setOffers(response.offers);
            } else if (response.error) {
                showNotification(response.error, "error");
            }
        } catch (error) {
            console.error("Error fetching offers:", error);
            showNotification("Failed to fetch offers.", "error");
        }
    }, [token]);

    const deleteOffer = useCallback(async (offerId) => {
        try {
            const response = await sendDeleteRequestToBackend("admin/offers/delete-offer", { offerId }, token); // Adjust the backend route
            if (response.success) {
                showNotification(response.success, "success");
                setOffers(prevOffers => prevOffers.filter(offer => offer._id !== offerId));
            } else if (response.error) {
                showNotification(response.error, "error");
            }
        } catch (error) {
            console.error("Error deleting offer:", error);
            showNotification("Failed to delete offer.", "error");
        }
    }, [token]);

    useEffect(() => {
        getOffers();
    }, [getOffers]);

    const value = {
        offers,
        getOffers,
        deleteOffer,
    };

    return (
        <AdminOffersContext.Provider value={value}>
            {children}
        </AdminOffersContext.Provider>
    );
}

export default AdminOffersProvider;

export function useAdminOffers() {
    const context = useContext(AdminOffersContext);
    if (!context) {
        throw new Error("useAdminOffers must be used within a AdminOffersProvider");
    }
    return context;
}