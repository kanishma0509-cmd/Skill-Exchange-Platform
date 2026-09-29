requireAuth();

const errorEl = document.getElementById('error');
const userList = document.getElementById('userList');
const searchInput = document.getElementById('searchInput');
const requestFormWrap = document.getElementById('requestFormWrap');
const reqError = document.getElementById('reqError');

document.getElementById('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });

let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => loadUsers(searchInput.value.trim()), 300);
});

function renderUsers(users) {
  if (users.length === 0) {
    userList.innerHTML = '<div class="empty-state">No members found. Try a different search.</div>';
    return;
  }
  userList.innerHTML = users.map(u => `
    <div class="card">
      <h3>${escapeHtml(u.name)}</h3>
      ${u.ratingCount > 0 ? `<p class="stars">${'★'.repeat(Math.round(u.ratingAvg))} ${u.ratingAvg} (${u.ratingCount})</p>` : ''}
      ${u.bio ? `<p class="hint">${escapeHtml(u.bio)}</p>` : ''}
      <div style="margin:10px 0;">
        ${(u.skillsTeach || []).map(s => `<span class="tag">Teaches: ${escapeHtml(s)}</span>`).join('')}
        ${(u.skillsWant || []).map(s => `<span class="tag amber">Wants: ${escapeHtml(s)}</span>`).join('')}
      </div>
      <button class="btn btn-sm" onclick="openRequestForm('${u._id}', '${escapeHtml(u.name).replace(/'/g, "\\'")}')">Send request</button>
    </div>
  `).join('');
}

async function loadUsers(skill) {
  try {
    const query = skill ? `?skill=${encodeURIComponent(skill)}` : '';
    const users = await apiRequest(`/users${query}`);
    renderUsers(users);
  } catch (err) {
    showError(errorEl, err.message);
  }
}

function openRequestForm(userId, userName) {
  document.getElementById('targetUserId').value = userId;
  document.getElementById('targetName').textContent = userName;
  requestFormWrap.style.display = 'block';
  requestFormWrap.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('cancelRequest').addEventListener('click', () => {
  requestFormWrap.style.display = 'none';
});

document.getElementById('requestForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError(reqError);

  const toUser = document.getElementById('targetUserId').value;
  const skillOffered = document.getElementById('skillOffered').value.trim();
  const skillWanted = document.getElementById('skillWanted').value.trim();
  const message = document.getElementById('reqMessage').value.trim();

  try {
    await apiRequest('/requests', {
      method: 'POST',
      body: { toUser, skillOffered, skillWanted, message }
    });
    requestFormWrap.style.display = 'none';
    document.getElementById('requestForm').reset();
    alert('Request sent! Check the Requests page to track it.');
  } catch (err) {
    showError(reqError, err.message);
  }
});

loadUsers();
