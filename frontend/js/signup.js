const form = document.getElementById('signupForm');
const errorEl = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError(errorEl);

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: { name, email, password }
    });
    saveSession(data.token, data.user);
    window.location.href = 'dashboard.html';
   } catch (err) {
    showError(errorEl, err.message);
    if (err.message.includes('already exists')) {
      document.getElementById('emailTakenHint').style.display = 'block';
    }
  }
});
