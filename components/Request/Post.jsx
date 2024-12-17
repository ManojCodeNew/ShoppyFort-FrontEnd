async function sendPostRequestToBackend(path, data) {

    const response = await fetch(`http://127.0.0.1:3000/${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
}
export default sendPostRequestToBackend;

