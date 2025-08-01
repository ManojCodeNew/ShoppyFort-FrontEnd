const API_BASE_URL = import.meta.env.VITE_API_URL;

async function sendDeleteRequestToBackend(path, data, token) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_BASE_URL}/${path}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data), // Sending productId in the request body
        signal: controller.signal

    });
    
    clearTimeout(timeoutId);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
            error: errorData.error || `Request failed with status ${response.status}`,
            status: response.status
        };
    }
    const result = await response.json();
    return result;
}

export default sendDeleteRequestToBackend;
