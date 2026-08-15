const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  
const apiClient = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ... (options.headers || {}),
    },
    ...options
  }
);
let data = null;
try{
  data = await response.json();
}catch{
  data = null;
}
if (!response.ok) {
  const error = new Error(data?.message || 'An error occurred while processing the request.');
  error.status = response.status;
  throw error;
}
return data;
};

export default apiClient;