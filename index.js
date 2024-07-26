var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "data.json");

// let data = [];

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect(
  "mongodb+srv://adityanovadianto:aditNovadianto@cluster0.x9fuvep.mongodb.net/aury?retryWrites=true&w=majority&appName=Cluster0"
);

var db = mongoose.connection;

db.on("error", () => console.log("Error in Connecting to Database"));
db.once("open", () => console.log("Connected to Database"));

app.post("/sign_up", (req, res) => {
  var nim = req.body.nim;
  var password = req.body.password;

  var data = {
    nim: nim,
    password: password,
  };

  db.collection("users").insertOne(data, (err, collection) => {
    if (err) {
      throw err;
    }
    console.log("Record Inserted Successfully");
  });

  return res.redirect("signup_success.html");
});

app.post("/sign_in", async (req, res) => {
  const nim = req.body.nim;
  const password = req.body.password;

  try {
    const user = await db
      .collection("users")
      .findOne({ nim: nim, password: password });
    const dataTranscript = await db
      .collection("data-transcript")
      .findOne({ for_nim: nim });

    let getUser = false;
    let getDataTranscript = false;

    let data = [];

    if (user) {
      getUser = true;

      try {
        data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
      } catch (err) {
        console.log("No existing data file, starting with an empty array.");
      }

      data[0] = user;

      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

      console.log(data);
    }

    if (dataTranscript) {
      getDataTranscript = true;

      try {
        data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
      } catch (err) {
        console.log("No existing data file, starting with an empty array.");
      }

      data[1] = dataTranscript;

      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

      console.log(data);
    }

    if (getUser || getDataTranscript) {
      return res.redirect("home.html");
    } else {
      return res.redirect("signIn.html");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/update_users", (req, res) => {
  var nim = req.body.nim;
  var old_pass = req.body.old_pass;
  var new_pass = req.body.new_pass;
  var name = req.body.name;
  var email = req.body.email;

  db.collection("users").updateOne(
    { nim: nim, password: old_pass },
    {
      $set: {
        nim: nim,
        password: new_pass,
        name: name,
        email: email,
      },
    },
    (err, collection) => {
      if (err) {
        throw err;
      }
      console.log("Record Updated Successfully");
    }
  );

  return res.redirect("signIn.html");
});

app.get("/signIn", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });

  return res.redirect("signIn.html");
});

app.get("/update", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });

  return res.redirect("update.html");
});

// for front-end get data
app.get("/data", (req, res) => {
  let data = [];

  try {
    data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  } catch (err) {
    console.log("No existing data file, starting with an empty array.");
  }

  res.json(data);
});

app.get("/", (req, res) => {
  res.set({
    "Allow-access-Allow-Origin": "*",
  });

  return res.redirect("signUp.html");
});

app.listen(3000, () => {
  console.log("Listening on PORT 3000");
});
