async function sendDeleteRequestToBackend(path, data, token) {
    const response = await fetch(`http://localhost:3000/${path}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data) // Sending productId in the request body
    });

    const result = await response.json();
    if (result) {
        console.log("RESULT", result);
    }
    return result;
}

export default sendDeleteRequestToBackend;
