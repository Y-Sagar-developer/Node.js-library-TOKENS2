const express = require("express");
const jwt = require("jsonwebtoken");
const connections = require("./db.js");
const app = express();
app.use(express.json());
const port = 3002;

let secret_key = "abcdefghijklmnopqrstuvwxyz0123456789";

app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!['developer', 'admin', 'full stack'].includes(role)) {
    return res.status(400).send("Invalid role. Role must be 'developer', 'admin', or 'full stack'.");
  }

  let sql = `INSERT INTO students (name, email, password, role) VALUES (?, ?, ?, ?)`;
  connections.query(sql, [name, email, password, role], (err, result) => {
    if (err) {
      return res.send(err);  
    } else {
      return res.send("User registered successfully");  // Ensure to return after sending the response
    }
  });
});

// Login and generate token
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  let sql = `SELECT * FROM students WHERE name=? AND password=?`;
  
  connections.query(sql, [username, password], (err, result) => {
    if (err) {
      return res.send(err);  
    } else {
      if (result.length > 0) {
        const user = result[0]; 
        let token = jwt.sign({ name: user.name, role: user.role }, secret_key);
        console.log(token)

        // Update the token in the database
        let up_sql = `UPDATE students SET token=? WHERE name=?`;
        connections.query(up_sql, [token, user.name], (up_err, up_res) => {
          if (up_err) {
            return res.send(up_err);  
          } else {
            return res.send({ message: "Login successful", token: token });  
          }
        });
      } else {
        return res.send("Invalid credentials");  
      }
    }
  });
});

app.get("/users", (req, res) => {
  const token = req.header("Authorization");

  
  if (!token) {
    return res.status(403).send("Access denied. No token provided.");
  }

  // Verify the token
  jwt.verify(token, secret_key, (err, decoded) => {
    if (err) {
      return res.status(400).send("Invalid token.");
    }

    // Ensure decoded object has the expected properties
    if (!decoded || !decoded.role) {
      return res.status(400).send("Token is missing the 'role' property.");
    }

    const userRole = decoded.role;
    let sql;

    // Based on role, fetch different user lists
    if (userRole === "developer") {
      sql = `SELECT * FROM students WHERE role="developer"`;
    } else if (userRole === "admin") {
      sql = `SELECT * FROM students`; // Admin can see all users
    } else if (userRole === "full stack") {
      sql = `SELECT * FROM students WHERE role="full stack"`;
    }

    connections.query(sql, (err, result) => {
      if (err) {
        return res.send(err);  // Ensure to return after sending the response
      } else {
        return res.json(result);  // Ensure to return after sending the response
      }
    });
  });
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
