requireAuth();

const errorEl = document.getElementById('error');
const savedMsg = document.getElementById('savedMsg');
document.getElementById('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });

async function loadProfile() {
  try {
    const user = await apiRequest('/users/me');
    document.getElementById('name').value = user.name || '';
    document.getElementById('bio').value = user.bio || '';
    document.getElementById('skillsTeach').value = (user.skillsTeach || []).join(', ');
    document.getElementById('skillsWant').value = (user.skillsWant || []).join(', ');

    const ratingSummary = document.getElementById('ratingSummary');
    if (user.ratingCount > 0) {
      ratingSummary.textContent = `${'★'.repeat(Math.round(user.ratingAvg))} ${user.ratingAvg} out of 5 (${user.ratingCount} rating${user.ratingCount > 1 ? 's' : ''})`;
    } else {
      ratingSummary.textContent = 'No ratings yet — complete an exchange to start building your rating.';
    }
  } catch (err) {
    showError(errorEl, err.message);
  }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError(errorEl);
  savedMsg.style.display = 'none';

  const name = document.getElementById('name').value.trim();
  const bio = document.getElementById('bio').value.trim();
  const skillsTeach = document.getElementById('skillsTeach').value
    .split(',').map(s => s.trim()).filter(Boolean);
  const skillsWant = document.getElementById('skillsWant').value
    .split(',').map(s => s.trim()).filter(Boolean);

  try {
    await apiRequest('/users/me', {
      method: 'PUT',
      body: { name, bio, skillsTeach, skillsWant }
    });
    savedMsg.style.display = 'inline';
    setTimeout(() => savedMsg.style.display = 'none', 2500);
  } catch (err) {
    showError(errorEl, err.message);
  }
});

loadProfile();
