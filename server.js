const express = require('express');
const path = require('path');
const app = express();

// Set port from environment or default to 3000
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory array to hold user objects with IDs
let users = [];
let nextId = 1;  // To assign unique IDs to users

// POST /users: Create a new user
app.post('/users', (req, res) => {
  const newUser = req.body;
  newUser.id = nextId++;  // Assign a unique ID
  users.push(newUser);
  res.json({ message: 'User created', user: newUser });
});

// GET /users: Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// GET /users/:id: Get a single user by ID
app.get('/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  const user = users.find(u => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: `User with ID ${userId} not found` });
  }
});

// PUT /users/:id: Update a user by ID (replace entire user)
app.put('/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  const updatedUser = req.body;
  const index = users.findIndex(u => u.id === userId);

  if (index !== -1) {
    updatedUser.id = userId;  // Keep the same ID
    users[index] = updatedUser;
    res.json({ message: `User with ID ${userId} updated`, user: updatedUser });
  } else {
    res.status(404).json({ message: `User with ID ${userId} not found` });
  }
});

// DELETE /users/:id: Delete a user by ID
app.delete('/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  const index = users.findIndex(u => u.id === userId);

  if (index !== -1) {
    users.splice(index, 1);
    res.json({ message: `User with ID ${userId} deleted` });
  } else {
    res.status(404).json({ message: `User with ID ${userId} not found` });
  }
});

// Serve the HTML frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
