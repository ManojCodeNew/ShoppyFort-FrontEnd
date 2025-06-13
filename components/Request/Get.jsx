const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("APi URL", API_BASE_URL);
const sendGetRequestToBackend = async (path, token, abortSignal = null) => {
  try {
    if (!path) {
      throw new Error('API path is required');
    }

    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    let controller;
    let timeoutId;

    if (abortSignal) {
      // Use the provided signal (from component)
      controller = null;
    } else {
      // Create our own controller with timeout
      controller = new AbortController();
      timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // Increased to 30 seconds
    }
    const response = await fetch(`${API_BASE_URL}/${path}`, {
      method: "GET",
      headers: headers,
      signal: controller.signal
    });
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // Handle different HTTP status codes
    if (!response.ok) {
      let errorData = {};

      try {
        errorData = await response.json();
      } catch (parseError) {
        console.warn('Failed to parse error response as JSON');
      }

      switch (response.status) {
        case 401:
          if (errorData.error === 'TokenExpired' || errorData.error?.includes('expired')) {
            return {
              error: 'TokenExpired',
              status: 401,
              tokenExpired: true
            };
          }
          return {
            error: errorData.error || 'Unauthorized access. Please login again.',
            status: 401
          };

        case 403:
          return {
            error: errorData.error || 'Access forbidden. You do not have permission.',
            status: 403
          };

        case 404:
          return {
            error: errorData.error || 'Resource not found',
            status: 404
          };

        case 429:
          return {
            error: 'Too many requests. Please try again later.',
            status: 429
          };

        case 500:
          return {
            error: 'Server error. Please try again later.',
            status: 500
          };

        default:
          return {
            error: errorData.error || `Request failed with status ${response.status}`,
            status: response.status,
            isNetworkError: false,
            isTimeout: false
          };
      }
    }

    // Try to parse the response as JSON
    let jsonData;
    try {
      jsonData = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return {
        error: 'Invalid response format from server'
      };
    }

    return jsonData;

  } catch (error) {
    console.error('GET request error:', error);

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        error: 'Network error. Please check your internet connection.',
        networkError: true
      };
    }

    // Handle timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        error: 'Request timeout. Please try again.',
        timeout: true
      };
    }

    // Handle other errors
    return {
      error: error.message || 'Request failed. Please try again.'
    };
  }
};

export default sendGetRequestToBackend;