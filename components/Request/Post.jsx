const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("Request Going:", API_BASE_URL);
async function sendPostRequestToBackend(path, data, token) {

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        // Log the request details for debugging


        const response = await fetch(`${API_BASE_URL}/${path}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
            mode: 'cors',
            credentials: 'include', // Include cookies in the request
            signal: controller.signal

        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: 'Failed to parse error response' };
            }

            console.log("Error response data:", errorData);

            // Handle different HTTP status codes
            if (response.status === 401) {
                if (errorData.error === 'TokenExpired') {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminAuth');
                    localStorage.removeItem('token');
                    window.alert('Session expired, please log in again.');
                    return null;
                }
                return {
                    error: errorData.error || errorData.msg || 'Unauthorized',
                    status: 401,
                    tokenExpired: errorData.error === 'TokenExpired'
                };
            } else if (response.status === 404) {
                return {
                    error: errorData.error || errorData.msg || 'Endpoint not found',
                    status: 404
                };
            } else if (response.status >= 500) {
                return {
                    error: errorData.error || errorData.msg || 'Server error. Please try again later.',
                    status: response.status
                };
            }
            // For other error statuses
            return {
                error: errorData.error || errorData.msg || 'Request failed',
                status: response.status,
                details: errorData
            };
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('POST request error:', error);

        if (error.name === 'AbortError') {
            return { error: 'Request timeout. Please try again.' };
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { error: 'Network error. Please check your connection and server status.' };
        }

        return { error: error.message || 'Request failed' };
    }
}
export default sendPostRequestToBackend;

