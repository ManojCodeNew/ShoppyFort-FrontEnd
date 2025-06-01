const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
async function sendPostRequestToBackend(path, data, token) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);


        const response = await fetch(`${API_BASE_URL}/${path}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
            signal: controller.signal

        });
        clearTimeout(timeoutId);

        console.log("headers :", headers);
        if (!response.ok) {
            // Handle different HTTP status codes
            if (response.status === 401) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.error === 'TokenExpired') {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminAuth');
                    window.alert('Session expired, please log in again.');
                    window.location.href = '/admin/login';
                    return null;

                }
                return {
                    error: errorData.error || 'Unauthorized',
                    status: 401,
                    tokenExpired: errorData.error === 'TokenExpired'
                };
            } else if (response.status === 404) {
                return { error: 'Endpoint not found', status: 404 };
            } else if (response.status >= 500) {
                return { error: 'Server error. Please try again later.', status: response.status };
            }
            // For other error statuses
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData.error || 'Request failed', status: response.status };
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('POST request error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { error: 'Network error. Please check your connection.' };
        }
        return { error: error.message || 'Request failed' };
    }
}
export default sendPostRequestToBackend;

