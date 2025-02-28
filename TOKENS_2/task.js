const express = require("express");
const app = express();
app.use(express.json());
const port = 3002;
const jwt = require("jsonwebtoken");
const connection = require("./db.js");

let secret_key = "abcdefghijklmnopqrstuvwxyz0123456789";

app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!["developer", "admin", "full stack"].includes(role)) {
    res.send(
      "Invalid role. Role must be 'developer', 'admin', or 'full stack'."
    );
  }

  let sql = `INSERT INTO students (name, email, password, role) VALUES (?, ?, ?, ?)`;
  connection.query(sql, [name, email, password, role], (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send("User registered successfully");
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  let sql = `SELECT * FROM students WHERE name=? AND password=?`;

  connection.query(sql, [username, password], (err, result) => {
    if (err) {
      res.send(err);
    } else {
      if (result.length > 0) {
        const user = result[0];
        console.log(user);
        let token = jwt.sign({ name: user.name, role: user.role }, secret_key);
        console.log(token);

        let up_sql = `UPDATE students SET token=? WHERE name=?`;
        connection.query(up_sql, [token, user.name], (up_err, up_res) => {
          if (up_err) {
            res.send(up_err);
          } else {
            res.send("Login successful");
          }
        });
      } else {
        res.send("Invalid credentials");
      }
    }
  });
});

app.get("/users", (req, res) => {
    const token = req.header("Authorization");
  
    if (!token) {
      res.send("Access denied. No token provided.");
    }
  
    jwt.verify(token, secret_key, (err, decoded) => {
      if (err) {
        res.send("Invalid token.");
      }
  
      if (!decoded || !decoded.role) {
        res.send("Token is missing the 'role' property.");
      }
  
      const userRole = decoded.role;
      let sql;
  
      if (userRole === "developer") {
        sql = `SELECT * FROM students WHERE role="developer"`;
      } else if (userRole === "admin") {
        sql = `SELECT * FROM students`;
      } else if (userRole === "full stack") {
        sql = `SELECT * FROM students WHERE role="full stack"`;
      }
  
      connection.query(sql, (err, result) => {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
      });
    });
  });
  

app.listen(port, (err) => {
  err ? console.log(err) : console.log("server is running");
});
