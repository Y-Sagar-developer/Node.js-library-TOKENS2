const express = require("express");
const app = express();
app.use(express.json());
const port = 3001;
const jwt = require("jsonwebtoken");
const db = require("./db.js");

let secret_key = "i_am_sagar";

let details = {
  id: 1,
  name: "sagar",
  role: "fullstack",
};

let token = jwt.sign(details, secret_key);
// console.log(token)

app.get("/getusers", (req, res) => {
//   let user = jwt.decode(req.headers.authorization.split(" ")[1]);
  let user = jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InNhZ2FyIiwicm9sZSI6ImZ1bGxzdGFjayIsImlhdCI6MTc0MDQ3NDYxNH0.UtKdHSpUy1zczbhxmgrHzW_lNvTLMWn4UxW_ZXhndEQ",secret_key);
  console.log(user)

  //   console.log(user.role)

  if (user.role == "fullstack") {
    let sql = `select * from users`;
    db.query(sql, (err, info) => {
      err
        ? res.send(err)
        : info.length > 0
        ? res.send(info)
        : res.send("data not available");
    });
  } else {
    res.send("not authorized");
  }
});




// let users=jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InNhZ2FyIiwicm9sZSI6ImZ1bGxzdGFjayIsImlhdCI6MTc0MDQ3NDYxNH0.UtKdHSpUy1zczbhxmgrHzW_lNvTLMWn4UxW_ZXhndEQ",secret_key)
// console.log(users)


app.listen(port, () => {
  console.log("server is running");
});

