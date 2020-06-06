
var settings = {};
var mqtt_client = null;
var default_message_interval = null;

$(function () {
  init();
})

function init() {
  $.getJSON('./settings', function (data) {
    settings = data;
    console.log(data)
    $('#input-mqtt_server').val(settings.mqtt_server);
    $('#input-mqtt_port').val(settings.mqtt_port);
    $('#input-mqtt_username').val(settings.mqtt_username);
    $('#input-mqtt_password').val(settings.mqtt_password);
    $("#input-mqtt_destinationName").val(settings.mqtt_destinationName);

    $("form#form-mqtt-server").on("submit", function (e) {
      e.preventDefault();
      updateSettings();
      connect();
    });

    $("form#form-mqtt-message").on("submit", function (e) {
      e.preventDefault();
      sendMessage();
    });

    default_message_interval = setInterval(function(){
      var m = "message sent at "+moment().format();
      $("#input-messageString").val(m);
    },1000)
    
    $("#input-messageString").on("focus", function(){
      clearInterval(default_message_interval);
    })
    
    
  });
}

function updateSettings(){
  settings.mqtt_server = $('#input-mqtt_server').val();
  settings.mqtt_port = $('#input-mqtt_port').val();
  settings.mqtt_username = $('#input-mqtt_username').val();
  settings.mqtt_password = $('#input-mqtt_password').val();
}


function connect(){
  //https://www.cloudmqtt.com/docs/websocket.html

  // Create a mqtt_client instance
  mqtt_client = new Paho.MQTT.Client(settings.mqtt_server, 36246, "web_" + parseInt(Math.random() * 100, 10));
  //Example mqtt_client = new Paho.MQTT.client("m11.cloudmqtt.com", 32903, "web_" + parseInt(Math.random() * 100, 10));

  // set callback handlers
  mqtt_client.onConnectionLost = onConnectionLost;
  mqtt_client.onMessageArrived = onMessageArrived;
  var options = {
    useSSL: true,
    userName: settings.mqtt_username,
    password: settings.mqtt_password,
    onSuccess: onConnect,
    onFailure: doFail
  }

  // connect the mqtt_client
  mqtt_client.connect(options);
}

// called when the mqtt_client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  // mqtt_client.subscribe(settings.mqtt_destinationName);
  // message = new Paho.MQTT.Message("Hello CloudMQTT");
  // message.destinationName = settings.mqtt_destinationName;
  // mqtt_client.send(message);
  sendMessage()

  $("#badge-mqtt-serber-status").text("connected").addClass("badge-success").removeClass("badge-secondary");
}


function doFail(e) {
  console.log(e);
}

// called when the mqtt_client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:" + message.payloadString);
}


function sendMessage(destinationName, message){
  var destinationName = $('#input-mqtt_destinationName').val();
  var messageString = $('#input-messageString').val();
  mqtt_client.subscribe(destinationName);
  message = new Paho.MQTT.Message(messageString);
  message.destinationName = destinationName;
  mqtt_client.send(message);
}
