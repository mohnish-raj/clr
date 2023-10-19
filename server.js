const express = require("express");
const https = require("https");
const fs = require("fs-extra");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const server = https.createServer({
  key: fs.readFileSync("./certs/server.key"),
  cert: fs.readFileSync("./certs/server.cert"),
}, app);

app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended : true }));

app.get("/", (_, res) => {
  res.render("index");
});

app.post("/addfav", (req, res) => {
  
});

server.listen(5500, () => {
  console.log("running on https://localhost:5500");
});