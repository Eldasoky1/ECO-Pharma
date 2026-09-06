const API_BASE_URL = 'http://localhost:8000/api/v1';

function getHeaders() {
  const token = localStorage.getItem('supabase.auth.token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorDetail = 'API Error';
    try {
      const data = await res.json();
      errorDetail = data.detail || data.error || errorDetail;
    } catch (e) {
      // Ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}
