const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const port = 3003;
const db = require("./db.js");

app.use(express.json());

let secret_key = "i_am_sagar";

// In-memory database (mocked for this example)
let usersDB = [
  // Example of pre-existing users in the "database"
  { id: 1, name: "sagar", password: "password", role: "fullstack" },
  { id: 2, name: "john", password: "john123", role: "developer" }
];

// Route to register a new user (simulated user registration)
app.post("/register", (req, res) => {
  const { name, password, role } = req.body;

  // Check if user already exists
  const existingUser = usersDB.find(user => user.name === name);
  if (existingUser) {
    return res.status(400).send("User already exists");
  }

  // Create a new user and store it in the mock database
  const newUser = { id: usersDB.length + 1, name, password, role };
  usersDB.push(newUser);
  res.send("User registered successfully!");
});

// Route to login and generate JWT token
app.post("/login", (req, res) => {
  const { name, password } = req.body;

  // Find user in the database
  const user = usersDB.find(user => user.name === name && user.password === password);

  if (!user) {
    return res.status(401).send("Invalid credentials");
  }

  // Generate a JWT token based on the user's role
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, secret_key);
  res.json({ message: "Login successful", token: token });
});

// Middleware to verify the JWT token
function verifyToken(req, res, next) {
  const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];

  if (!token) {
    return res.status(403).send("Access denied. No token provided.");
  }

  jwt.verify(token, secret_key, (err, decoded) => {
    if (err) {
      return res.status(400).send("Invalid token.");
    }
    req.user = decoded;  // Attach the decoded token (user info) to the request object
    next();
  });
}

// Route to get users based on role (only fullstack can view the users list)
app.get("/getusers", verifyToken, (req, res) => {
  const { role } = req.user;

  if (role === "fullstack") {
    // Return all users for fullstack role (can replace with database query)
    res.json(usersDB);
  } else if (role === "admin") {
    // Admin can see all users (can replace with database query)
    res.json(usersDB);
  } else {
    res.status(403).send("Not authorized to view this resource.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
