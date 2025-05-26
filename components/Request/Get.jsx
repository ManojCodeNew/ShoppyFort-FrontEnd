const sendGetRequestToBackend = async (path, token) => {
  if (!path) {
    throw new Error('API path is required');
  }
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`http://localhost:3000/${path}`, {
    method: "GET",
    headers: headers
  });
console.log("Product Response :",response);

  const jsondata = await response.json();
  return jsondata;
}

export default sendGetRequestToBackend;

