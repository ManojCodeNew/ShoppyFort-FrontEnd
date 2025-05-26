async function sendPostRequestToBackend(path, data, token) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://localhost:3000/${path}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });

    console.log("headers :",headers);
    
    const result = await response.json();
    if (result) {
        console.log("RESULT", result);
        // Handle token expiration globally
        if (result.error === 'TokenExpired') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminAuth');
            window.alert('Session expired, please log in again.');
            window.location.href = '/admin/login';
            return null; // Prevent further processing
        }
    }
    return result;
}
export default sendPostRequestToBackend;

