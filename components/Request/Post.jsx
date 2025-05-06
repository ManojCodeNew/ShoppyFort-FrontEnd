async function sendPostRequestToBackend(path, data, token) {

    const response = await fetch(`http://localhost:3000/${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result) {
        console.log("RESULT",result);
    }
    return result;
}
export default sendPostRequestToBackend;

