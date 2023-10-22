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

fs.ensureFile("colors.json")
  .catch(console.error);

let colorData = fs.readFileSync("./colors.json").toString();

if (!colorData) {
  try {
    fs.writeJsonSync("./colors.json", {"colors" : []});
    colorData = '{"colors": []}';
  } catch (err) {
    console.error(err);
  }
}

colorData = JSON.parse(colorData);
// console.log(colorData.colors);

app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended : true }));

app.get("/", (_, res) => {
  res.render("index");
});

app.get("/getswatches", (_, res) => {
  res.send(colorData);
});

app.post("/addfav", (req, res) => {
  const color = req.body.color;
  colorData.colors.push(color);

  try {
    fs.writeJsonSync("colors.json", colorData);
  } catch (err) {
    console.error(err);
  }

  res.send();
});

app.delete("/deleteswatch/:id", (req, res) => {
  colorData.colors.splice(req.params.id, 1);

  try {
    fs.writeJsonSync("colors.json", colorData);
  } catch (err) {
    console.error(err);
  }

  res.send();
});

server.listen(process.env.PORT || 5500, () => {
  console.log("running on https://localhost:5500");
});