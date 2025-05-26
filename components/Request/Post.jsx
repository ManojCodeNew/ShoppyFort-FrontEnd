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
    }
    return result;
}
export default sendPostRequestToBackend;

