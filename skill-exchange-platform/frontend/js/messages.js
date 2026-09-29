requireAuth();
const me = getCurrentUser();

const params = new URLSearchParams(window.location.search);
const requestId = params.get('requestId');

const errorEl = document.getElementById('error');
const thread = document.getElementById('thread');

document.getElementById('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });

if (!requestId) {
  showError(errorEl, 'No conversation selected. Go back to Requests and click Message on an accepted request.');
}

function renderMessages(messages) {
  if (messages.length === 0) {
    thread.innerHTML = '<p class="hint" style="text-align:center;">No messages yet. Say hello!</p>';
    return;
  }
  thread.innerHTML = messages.map(m => {
    const mine = m.sender._id === me.id;
    return `
      <div class="msg-bubble ${mine ? 'msg-mine' : 'msg-theirs'}">
        ${!mine ? `<div class="msg-sender">${escapeHtml(m.sender.name)}</div>` : ''}
        ${escapeHtml(m.text)}
      </div>
    `;
  }).join('');
  thread.scrollTop = thread.scrollHeight;
}

async function loadMessages() {
  if (!requestId) return;
  try {
    const messages = await apiRequest(`/messages/${requestId}`);
    renderMessages(messages);
  } catch (err) {
    showError(errorEl, err.message);
  }
}

document.getElementById('msgForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requestId) return;
  const input = document.getElementById('msgText');
  const text = input.value.trim();
  if (!text) return;

  try {
    await apiRequest('/messages', { method: 'POST', body: { requestId, text } });
    input.value = '';
    loadMessages();
  } catch (err) {
    showError(errorEl, err.message);
  }
});

loadMessages();
// Simple polling every 4 seconds so both sides see new messages without a manual refresh
if (requestId) setInterval(loadMessages, 4000);
