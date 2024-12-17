const sendGetRequestToBackend = async (path) => {
    const response = await fetch(`http://localhost:3000/${path}`);
    const jsondata = await response.json();
    return jsondata;
  }

  export default sendGetRequestToBackend;

