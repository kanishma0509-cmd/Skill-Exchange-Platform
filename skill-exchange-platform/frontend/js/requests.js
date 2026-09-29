requireAuth();
const me = getCurrentUser();

const errorEl = document.getElementById('error');
const receivedList = document.getElementById('receivedList');
const sentList = document.getElementById('sentList');
const ratingFormWrap = document.getElementById('ratingFormWrap');
const rateError = document.getElementById('rateError');

document.getElementById('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });

function statusPill(status) {
  return `<span class="status-pill status-${status}">${status}</span>`;
}

function renderReceived(requests) {
  const received = requests.filter(r => r.toUser._id === me.id);
  if (received.length === 0) {
    receivedList.innerHTML = '<div class="empty-state">No requests received yet.</div>';
    return;
  }
  receivedList.innerHTML = received.map(r => `
    <div class="card">
      <h3>${escapeHtml(r.fromUser.name)} ${statusPill(r.status)}</h3>
      <p>Offers to teach you <strong>${escapeHtml(r.skillOffered)}</strong> in exchange for <strong>${escapeHtml(r.skillWanted)}</strong></p>
      ${r.message ? `<p class="hint">"${escapeHtml(r.message)}"</p>` : ''}
      <div style="margin-top:10px;">
        ${r.status === 'pending' ? `
          <button class="btn btn-sm" onclick="updateStatus('${r._id}', 'accepted')">Accept</button>
          <button class="btn btn-sm btn-danger" onclick="updateStatus('${r._id}', 'rejected')">Reject</button>
        ` : ''}
        ${r.status === 'accepted' ? `
          <a class="btn btn-sm btn-outline" href="messages.html?requestId=${r._id}">Message</a>
          <button class="btn btn-sm" onclick="openRatingForm('${r._id}')">Mark complete & rate</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function renderSent(requests) {
  const sent = requests.filter(r => r.fromUser._id === me.id);
  if (sent.length === 0) {
    sentList.innerHTML = '<div class="empty-state">You haven\'t sent any requests yet. Go to Browse to find someone!</div>';
    return;
  }
  sentList.innerHTML = sent.map(r => `
    <div class="card">
      <h3>${escapeHtml(r.toUser.name)} ${statusPill(r.status)}</h3>
      <p>You offered <strong>${escapeHtml(r.skillOffered)}</strong> for <strong>${escapeHtml(r.skillWanted)}</strong></p>
      ${r.message ? `<p class="hint">"${escapeHtml(r.message)}"</p>` : ''}
      <div style="margin-top:10px;">
        ${r.status === 'accepted' ? `
          <a class="btn btn-sm btn-outline" href="messages.html?requestId=${r._id}">Message</a>
          <button class="btn btn-sm" onclick="openRatingForm('${r._id}')">Mark complete & rate</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function loadRequests() {
  try {
    const requests = await apiRequest('/requests');
    renderReceived(requests);
    renderSent(requests);
  } catch (err) {
    showError(errorEl, err.message);
  }
}

async function updateStatus(id, status) {
  try {
    await apiRequest(`/requests/${id}`, { method: 'PUT', body: { status } });
    loadRequests();
  } catch (err) {
    showError(errorEl, err.message);
  }
}

function openRatingForm(requestId) {
  document.getElementById('ratingRequestId').value = requestId;
  ratingFormWrap.style.display = 'block';
  ratingFormWrap.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('cancelRating').addEventListener('click', () => {
  ratingFormWrap.style.display = 'none';
});

document.getElementById('ratingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError(rateError);

  const requestId = document.getElementById('ratingRequestId').value;
  const stars = Number(document.getElementById('stars').value);
  const comment = document.getElementById('comment').value.trim();

  try {
    await apiRequest('/ratings', { method: 'POST', body: { requestId, stars, comment } });
    await apiRequest(`/requests/${requestId}`, { method: 'PUT', body: { status: 'completed' } });
    ratingFormWrap.style.display = 'none';
    document.getElementById('ratingForm').reset();
    loadRequests();
  } catch (err) {
    showError(rateError, err.message);
  }
});

loadRequests();
