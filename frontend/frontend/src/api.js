const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("token");
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

export async function get(path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function patch(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function del(path) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}


