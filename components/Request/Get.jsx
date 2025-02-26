const sendGetRequestToBackend = async (path, token) => {
  const response = await fetch(`http://localhost:3000/${path}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }
  );
  const jsondata = await response.json();
  return jsondata;
}

export default sendGetRequestToBackend;

