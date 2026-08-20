const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  
const apiClient = async (
  url,
  options = {}
) => {

  const token = localStorage.getItem('accessToken');
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response =
    await fetch(
      `${API_BASE_URL}${url}`,
      {
        credentials: "include",
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        },
        ...options
      }
    );


  let data = null;

  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    const error =
      new Error(
        data?.message ||
        "Request failed."
      );


    /*
     * VERY IMPORTANT
     *
     * KanbanBoard uses this
     * to detect 409 Conflict.
     */

    error.status =
      response.status;


    error.data =
      data;


    throw error;
  }


  return data;
};


export default apiClient;