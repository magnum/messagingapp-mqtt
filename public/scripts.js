
function init() {
  $.getJSON('./settings', function (data) {
    settings = data;
    console.log(data)
    $('#input-mqtt_server').val(settings.mqtt_server);
    $('#input-mqtt_port').val(settings.mqtt_port);
    $('#input-mqtt_username').val(settings.mqtt_username);
    $('#input-mqtt_password').val(settings.mqtt_password);
    $("#input-mqtt_topic").val(settings.mqtt_topic);

    $("form#form-mqtt-server").on("submit", function (e) {
      $.LoadingOverlay("show");
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
      $("#input-message-string").val(m);
    },1000)
    
    $("#input-message-string").on("focus", function(){
      clearInterval(default_message_interval);
    })

    $("#reset-messages").on("click", function(e){
      e.preventDefault();
      $("#input-messages").val("")
    });
    
    printMessage();
    
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
  mqtt_client.onMessageDelivered = onMessageDelivered;
  var options = {
    useSSL: true,
    userName: settings.mqtt_username,
    password: settings.mqtt_password,
    onSuccess: onConnect,
    onFailure: doFail
  };

  // connect the mqtt_client
  mqtt_client.connect(options);
}

// called when the mqtt_client connects
function onConnect() {
  $.LoadingOverlay("hide");
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  // mqtt_client.subscribe(settings.mqtt_topic);
  // message = new Paho.MQTT.Message("Hello CloudMQTT");
  // message.topic = settings.mqtt_topic;
  // mqtt_client.send(message);
  connected = true;
  $("#submit-message").attr("disabled",false);
  sendMessage()
  $("#badge-mqtt-server-status").text("connected").addClass("badge-success").removeClass("badge-secondary");
}


function doFail(e) {
  showModal(e.message, "doFail");
  console.log(e);
}

// called when the mqtt_client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    showModal(responseObject.errorMessage, "onConnectionLost", true);
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

function onMessageDelivered(message){
  console.log("onMessageDelivered:" + message.payloadString);
  $.LoadingOverlay("hide");
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:" + message.payloadString);
  printMessage(message.payloadString);
}


function sendMessage(){
  $.LoadingOverlay("show");
  var topic = $('#input-mqtt_topic').val();
  var string = $('#input-message-string').val();
  var qos = parseInt($("#input-message-qos").val());
  var retained = $("#input-message-retain").is(":checked");
  mqtt_client.subscribe(topic);
  // message = new Paho.MQTT.Message(string);
  // message.destinationName = topic;
  //mqtt_client.send(message); //https://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html
  console.log('sending message: "'+string+'", topic: '+topic+', qos: '+qos+', retained: '+retained);
  mqtt_client.send(topic, string, qos, retained);
}


function showModal(content, title, isCode) {
  if(title == "undefined") title = "Message";
  if(isCode == "undefined") isCode = false;
  $("#modalDialogLabel").text(title);
  $.LoadingOverlay("hide");
  var modalContent = isCode ? "<pre>" + content + "</pre>" : content;
  $("#modalDialog .modal-body").html(modalContent);
  var options = {};
  $("#modalDialog").modal(options);
} 

function printMessage(messageString){
  var count = 0;
  if (messageString == "undefined") messageString = false;
  if (messageString){
    var rowSeparator = "\r";
    var content = $("#input-messages").text().trim();
    content = messageString + rowSeparator + content;
    $("#input-messages").text(content);
    count = content.split(rowSeparator).length;
  }
  $("#messagesInfo").text("count: " + count);
}


var connected = false;
var settings = {};
var mqtt_client = null;
var default_message_interval = null;

$(function () {
  init();
});
