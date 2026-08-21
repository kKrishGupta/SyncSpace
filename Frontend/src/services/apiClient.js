import websocketClient from '../websocket/websocketClient';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

  if (options.body instanceof FormData) {
    delete defaultHeaders["Content-Type"];
  }

  let response =
    await fetch(
      `${API_BASE_URL}${url}`,
      {
        credentials: "include",
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      }
    );

  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/refresh')) {
    const originalRequestParams = {
      url,
      options: {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      }
    };
    
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          
          if (refreshRes.ok) {
             const refreshData = await refreshRes.json();
             const { accessToken, refreshToken: newRefreshToken } = refreshData.data;
             localStorage.setItem('accessToken', accessToken);
             localStorage.setItem('refreshToken', newRefreshToken);
             
             websocketClient.disconnect();
             websocketClient.connect(accessToken);
             
             isRefreshing = false;
             processQueue(null, accessToken);
             
             originalRequestParams.options.headers["Authorization"] = `Bearer ${accessToken}`;
             response = await fetch(`${API_BASE_URL}${originalRequestParams.url}`, {
               credentials: "include",
               ...originalRequestParams.options
             });
          } else {
             throw new Error('Refresh failed');
          }
        } catch (err) {
          isRefreshing = false;
          processQueue(err, null);
          window.dispatchEvent(new Event('auth:logout'));
        }
      } else {
        isRefreshing = false;
        window.dispatchEvent(new Event('auth:logout'));
      }
    } else {
      try {
        const newToken = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        
        originalRequestParams.options.headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${originalRequestParams.url}`, {
          credentials: "include",
          ...originalRequestParams.options
        });
      } catch (err) {
        // Refresh failed, let the error propagate or handled below
      }
    }
  }


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