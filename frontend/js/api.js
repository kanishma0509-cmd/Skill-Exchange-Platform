// Small shared helper used by every page for talking to the backend API
// and keeping track of the logged-in user's token.

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getCurrentUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Redirect to login if there's no token. Call at the top of any protected page.
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      // session expired or missing - send back to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    }
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
}

function showError(el, message) {
  el.textContent = message;
  el.style.display = 'block';
}

function hideError(el) {
  el.style.display = 'none';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
