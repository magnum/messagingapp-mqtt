require("dotenv").config();

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get("/settings", function (req, res) {
  var data = {
    "mqtt_server": process.env.MQTT_SERVER,
    "mqtt_port": process.env.MQTT_PORT,
    "mqtt_username": process.env.MQTT_USERNAME,
    "mqtt_password": process.env.MQTT_PASSWORD,
    "mqtt_destinationName": process.env.MQTT_DESTINATION_NAME
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
});

app.listen(process.env.PORT || 3000);