const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class ApiClientError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkErr) {
    // fetch itself threw — the API is unreachable (offline, CORS, server down).
    throw new ApiClientError('Could not reach the server. Check your connection and try again.', 0);
  }

  if (res.status === 204) {
    return null;
  }

  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status}).`;
    throw new ApiClientError(message, res.status);
  }

  return body;
}

export const api = {
  getBoard: (boardId) => request(`/api/boards/${boardId}`),
  createTask: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  moveTask: (id, columnId) =>
    request(`/api/tasks/${id}/move`, { method: 'PATCH', body: JSON.stringify({ column_id: columnId }) }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};

export { ApiClientError };
