var express = require("express"),
  app = express(),
  router = express.Router(),
  port = process.env.PORT || 3000,
  bodyParser = require("body-parser"),
  urlencodedParser = bodyParser.urlencoded({ extended: true }),
  jsonParser = bodyParser.json({ limit: "500mb" }),
  mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  passwordHash = require("password-hash");

mongoose.connect(
  "mongodb://fugrammer:efds123password@ds155934.mlab.com:55934/dotusersdatabase"
);

router.get("/", function(req, res) {
  res.redirect("/HQ");
});

var userSchema = new Schema(
  {
    NRIC: String,
    PWD: String
  },
  { versionKey: false }
);

var parentBSchema = new Schema(
  {
    NRIC: String,
    REMARKS: String,
    VALIDATED: String,
    AGE: String,
    CHILDREN: String,
    PETS: String,
    LOCATION: String
  },
  { versionKey: false }
);

var parentASchema = new Schema(
  {
    NRIC: String,
    REMARKS: String,
    AGE: String,
    CHILDREN: String,
    PETS: String
  },
  { versionKey: false }
);

var ParentA = mongoose.model("ParentA", parentASchema);
var ParentB = mongoose.model("ParentB", parentBSchema);
var User = mongoose.model("User", userSchema);

app.post("/login", [urlencodedParser, jsonParser], function(req, res) {
  User.find({ NRIC: req.body.NRIC }, function(err, user) {
    if (!user.length) {
      res.json({ Status: "Fail" });
    } else {
      res.json({ Status: "Success" });
    }
  });
});

app.post("/createUser", [urlencodedParser, jsonParser], function(req, res) {
  try {
    res.json({ Status: "Success" });
    console.log(req.body);
    var user = User({
      NRIC: req.body.NRIC,
      PWD: passwordHash.generate(req.body.PWD)
    });
    user.save(function(err, dat) {
      if (err) console.log("Failed to save crisis log");
    });
  } catch (e) {}
});

app.post("/createAUser", [urlencodedParser, jsonParser], function(req, res) {
  try {
    res.json({ Status: "Success" });
    var user = ParentA({
      NRIC: req.body.NRIC,
      REMARKS: req.body.REMARKS,
      AGE: req.body.AGE,
      CHILDREN: req.body.CHILDREN,
      PETS: req.body.PETS
    });
    user.save(function(err, dat) {
      if (err) console.log("Failed to save crisis log");
    });
  } catch (e) {}
});

app.post("/createBUser", [urlencodedParser, jsonParser], function(req, res) {
  try {
    res.json({ Status: "Success" });
    var user = ParentB({
      NRIC: req.body.NRIC,
      REMARKS: req.body.REMARKS,
      VALIDATED: "false",
      AGE: req.body.AGE,
      CHILDREN: req.body.CHILDREN,
      PETS: req.body.PETS,
      LOCATION: req.body.LOCATION
    });
    user.save(function(err, dat) {
      if (err) console.log("Failed to save crisis log");
    });
  } catch (e) {}
});

app.get("/getValidatingUsers", [urlencodedParser, jsonParser], function(
  req,
  res
) {
  try {
    ParentB.find({}, function(err, users) {
      var arrayUsers = [];
      for (let user of users) {
        if (user.VALIDATED === "false") {
          arrayUsers.push({
            NRIC: user.NRIC
          });
        }
      }
      res.json(arrayUsers);
      return;
    });
  } catch (e) {}
});

app.post("/validateUser", [urlencodedParser, jsonParser], function(req, res) {
  try {
    var query = { NRIC: req.body.NRIC };
    const doc = {
      VALIDATED: "true"
    };
    console.log(req.body);
    ParentB.findOneAndUpdate(query, doc, { upsert: true }, function(err, doc) {
      if (err) return res.send(500, { error: err });
      res.send("succesfully saved");
    });
  } catch (e) {}
});

app.post("/getListings", [urlencodedParser, jsonParser], function(req, res) {
  //res.json({ Status: "Success" });
  try {
    console.log(req.body);
    ParentA.find({ NRIC: req.body.NRIC }, function(err, users) {
      console.log(users[0].NRIC);
      NRIC = users[0].NRIC;
      ParentB.find({ LOCATION: req.body.LOCATION }, function(err, users) {
        var listings = [];
        for (let user of users) {
          console.log(user);
          PETS: users[0].PETS;
          if (user.VALIDATED === "true" && user.NRIC != NRIC) {
            if (!(users[0].PETS == "NO" && user.PETS === "YES"))
              listings.push(user);
          }
        }
        res.json(listings);
        return;
      });
    });
  } catch (e) {}
});

app.listen(port, function() {
  console.log(`Listening on port ${port}...`);
});
