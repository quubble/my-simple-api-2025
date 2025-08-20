const form = document.getElementById('userForm');
const responseEl = document.getElementById('response');
const usersTableBody = document.querySelector('#usersTable tbody');
const userIdInput = document.getElementById('userId');
const cancelEditBtn = document.getElementById('cancelEdit');

// Helper: Robust fetch wrapper
async function fetchJson(url, options) {
  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch {
    // If not JSON, get text
    const text = await res.text();
    throw new Error('Server error: ' + text);
  }
  if (!res.ok) {
    throw new Error(data.message || 'Server error');
  }
  return data;
}

// Fetch and show all users
function loadUsers() {
  fetchJson('/users')
    .then(users => {
      usersTableBody.innerHTML = ''; // Clear table
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>
            <button onclick="editUser(${user.id})">Edit</button>
            <button onclick="deleteUser(${user.id})">Delete</button>
          </td>
        `;
        usersTableBody.appendChild(row);
      });
    })
    .catch(error => {
      responseEl.textContent = error;
    });
}

// Clear form inputs and reset edit state
function resetForm() {
  userIdInput.value = '';
  form.name.value = '';
  form.email.value = '';
  cancelEditBtn.style.display = 'none';
  form.querySelector('button[type=submit]').textContent = 'Save User';
  responseEl.textContent = '';
}

// Edit user: populate form with user data for editing
function editUser(id) {
  fetchJson(`/users/${id}`)
    .then(user => {
      userIdInput.value = user.id;
      form.name.value = user.name;
      form.email.value = user.email;
      cancelEditBtn.style.display = 'inline';
      form.querySelector('button[type=submit]').textContent = 'Update User';
      responseEl.textContent = '';
    })
    .catch(error => {
      responseEl.textContent = error;
    });
}

// Delete user by ID
function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  fetchJson(`/users/${id}`, { method: 'DELETE' })
    .then(data => {
      responseEl.textContent = data.message;
      loadUsers();
      resetForm();
    })
    .catch(error => {
      responseEl.textContent = error;
    });
}

// Handle form submit for create or update
form.addEventListener('submit', function(event) {
  event.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const id = userIdInput.value;

  if (!name || !email) {
    responseEl.textContent = 'Please fill out all fields.';
    return;
  }

  const userData = { name, email };
  let url = '/users';
  let method = 'POST';

  if (id) {
    url = `/users/${id}`;
    method = 'PUT';
  }

  fetchJson(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
    .then(data => {
      responseEl.textContent = data.message;
      loadUsers();
      resetForm();
    })
    .catch(error => {
      responseEl.textContent = error;
    });
});

// Cancel edit button click handler
cancelEditBtn.addEventListener('click', resetForm);

// Initial load of users
loadUsers();
