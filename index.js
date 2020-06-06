require("dotenv").config();

var fs = require("fs");
var express = require('express');
var app = express();

var publicdir = __dirname + "/public";
app.use(function (req, res, next) {
  if (req.path.indexOf(".") === -1) {
    var file = publicdir + req.path + ".html";
    fs.exists(file, function (exists) {
      if (exists) req.url += ".html";
      next();
    });
  } else next();
});
app.use(express.static(publicdir));

app.get("/settings", function (req, res) {
  var data = {
    "mqtt_server": process.env.MQTT_SERVER,
    "mqtt_port": process.env.MQTT_PORT,
    "mqtt_username": process.env.MQTT_USERNAME,
    "mqtt_password": process.env.MQTT_PASSWORD,
    "mqtt_topic": process.env.MQTT_TOPIC
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
});

app.listen(process.env.PORT || 3000);