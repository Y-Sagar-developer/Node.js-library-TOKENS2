const express = require("express");
const app = express();
app.use(express.json());
const port = 3005;
const jwt = require("jsonwebtoken");
const db = require("./db.js");

let secret_key = "i_am_sagar";

app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  let sql = `INSERT INTO students (name, email, password, role) VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, email, password, role], (err, result) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    } else {
      const token = jwt.sign({ email, role }, secret_key);

      return res.status(201).json({
        message: "User registered successfully",
        token: token,
      });
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  let sql = `SELECT * FROM students WHERE name=? AND password=?`;

  db.query(sql, [username, password], (err, result) => {
    if (err) {
      return res.send(err);
    } else {
      if (result.length > 0) {
        const user = result[0];
        let token = jwt.sign({ name: user.name, role: user.role }, secret_key);
        console.log(token);

        let up_sql = `UPDATE students SET token=? WHERE name=?`;
        db.query(up_sql, [token, user.name], (up_err, up_res) => {
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

app.get("/getusers", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);
  if (!token) {
    return res.status(400).send("Token missing");
  }

  jwt.verify(token, secret_key, (err, user) => {
    if (err) {
      return res.status(403).send("Token is invalid or expired");
    }

    console.log(user);

    let sql = "";

    if (user.role === "admin") {
      sql = "SELECT * FROM students";
    } else if (user.role === "fullstack") {
      sql = "SELECT * FROM students WHERE role = 'fullstack'";
    } else if (user.role === "frontend") {
      sql = "SELECT * FROM students WHERE role = 'frontend'";
    } else if (user.role === "backend") {
      sql = "SELECT * FROM students WHERE role = 'backend'";
    } else {
      return res.status(403).send("Unauthorized role");
    }

    db.query(sql, (err, users) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (users.length > 0) {
        return res.status(200).json(users);
      } else {
        return res.status(404).send("No users found");
      }
    });
  });
});

app.listen(port, () => {
  console.log("server is running");
});
