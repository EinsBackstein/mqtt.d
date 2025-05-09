#include "env.h"

#include <Arduino.h>
#include "Wire.h"
#include <ESP8266WiFi.h>
#include <ESP8266Ping.h>
#include <PubSubClient.h>       // MQTT
#include <ArduinoJson.h>        // https://github.com/bblanchon/ArduinoJson.git
#include <NTPClient.h>          // https://github.com/taranais/NTPClient
#include <WiFiUdp.h>
#include <OneWire.h>            // OneWire bus for Sensors
#include <DallasTemperature.h>  // read Dallas Temp. Sensors
#include <EEPROM.h>

// Definition der Pins für die Sensoren
#define SENSOR_PIN   A0     // Analoger Pin für den Lichtsensor
#define ONE_WIRE_BUS D0     // Anschluss für den Temperatursensor (OneWire)

// Sensoren initialisieren
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// WIFI & MQTT
WiFiClient espClient;
PubSubClient mqttClient(espClient);

String sensorTypes[2] = {
  "Licht",
  "Temperatur",
};

const char *clientType = "ESP8266";
String clientId;

String sensor_topic = "sensors/";  // Changed to String for easy concatenation

// EEPROM Configuration
#define EEPROM_SIGNATURE 0xAA
#define EEPROM_SIZE      5  // 1 byte signature + 4 bytes ID

// Timestamp
unsigned long lastMsgTime = 0;
const unsigned long lastMsgInterval = 10000; // 10s

bool forceUpdate = false;
String command_topic = "sensors/" + String(clientType) + "/" + clientId + "/forceUpdate";

JsonDocument odoc;  // Using JsonDocument to avoid deprecation warnings

void initClientID(){
  EEPROM.begin(EEPROM_SIZE);
  byte signature = EEPROM.read(0);
  
  if (signature == EEPROM_SIGNATURE) {
    char storedId[5] = {0};
    for (int i = 0; i < 4; i++) {
      storedId[i] = EEPROM.read(i + 1);
    }
    clientId = String(storedId);
    Serial.print("Loaded clientId from EEPROM: ");
    Serial.println(clientId);
  } else {
    clientId = String(random(0xffff), HEX);
    clientId.toUpperCase();
    // Pad with leading zeros to ensure 4 characters
    while (clientId.length() < 4) {
      clientId = "0" + clientId;
    }
    EEPROM.write(0, EEPROM_SIGNATURE);
    for (int i = 0; i < 4; i++) {
      EEPROM.write(i + 1, clientId[i]);
    }
    EEPROM.commit();
    Serial.print("Generated new clientId: ");
    Serial.println(clientId);
  }
  EEPROM.end();
}

// WIFI Connection Function
void connectWifi() {
  Serial.print("Verbinde mit WLAN ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WLAN verbunden | IP-Adresse: ");
  Serial.println(WiFi.localIP());
}

void connectMqtt() {
  Serial.print("Verbinde mit MQTT Broker ");
  mqttClient.setServer(mqttServer, mqttPort);

  while (!mqttClient.connected()) {
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("verbunden");
    } else {
      Serial.print("Verbindung fehlgeschlagen, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" -> Erneuter Versuch in 5 Sekunden");
      delay(5000);
    }
  }

  Serial.println("Verbindungstest: ");

  if (Ping.ping(mqttServer, 4)) {
    Serial.println("Ping erfolgreich!");
  } else {
    Serial.println("Ping fehlgeschlagen!");
  }
}

void subscribeMqtt() {
  for (int i = 0; i < 2; i++) {  // Fixed loop condition
    String topic = sensor_topic + sensorTypes[i];
    mqttClient.subscribe(topic.c_str());
  }
  mqttClient.subscribe("sensors/#");
  mqttClient.subscribe("home/#");
  mqttClient.subscribe(command_topic.c_str()); // Subscribe to command topic
}

void publishMqtt(const char *topic, const char *event, const char *data_type, const char *data_value) {
  JsonDocument odoc;  // Using JsonDocument
  String jsonString;
  odoc["event"] = event;
  odoc["topic"] = topic;
  odoc["clientType"] = clientType;
  odoc["clientId"] = clientId;
  odoc["dataType"] = data_type;
  odoc["dataValue"] = data_value;
  odoc["WIFI SSID"] = WiFi.SSID();

  serializeJsonPretty(odoc, Serial);   // generate & print JSON to Serial
  Serial.println("");

  serializeJson(odoc, jsonString);     // generate JSON to String

  mqttClient.publish(topic, jsonString.c_str()); // publish JSON to MQTT Broker
}

void callbackMqtt(char* topic, byte* payload, unsigned int length){
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.println("]");

  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  if (String(topic) == command_topic) {
    if (message == "UPDATE") {
      forceUpdate = true;
      Serial.println("Force update triggered via MQTT Broker");
    }
  }
}

void setup() {
  Serial.begin(9600);
  delay(10);
  
  // Initialize clientId from EEPROM or generate new
  initClientID();
  
  // Build topics after clientId is initialized
  sensor_topic = sensor_topic + clientType + "/" + clientId + "/";
  command_topic = sensor_topic + "forceUpdate";
  
  sensors.begin();
  connectWifi();
  
  mqttClient.setCallback(callbackMqtt);
  connectMqtt();
  subscribeMqtt();
}

void loop() {
  if (!mqttClient.connected()) {
    connectMqtt();
    subscribeMqtt();
  }
  mqttClient.loop();

  bool shouldUpdate = forceUpdate || (millis() - lastMsgTime >= lastMsgInterval);

  if (millis() - lastMsgTime >= lastMsgInterval || forceUpdate) {
    lastMsgTime = millis();
    
    // Lichtsensor
    int lightValue = analogRead(SENSOR_PIN);
    publishMqtt(
      (sensor_topic + sensorTypes[0]).c_str(),
      forceUpdate ? "Command-Triggered Update" : "Regular Data Upload",
      sensorTypes[0].c_str(),
      String(lightValue).c_str()
    );
    
    // Temperatursensor
    sensors.requestTemperatures();
    float temperature = sensors.getTempCByIndex(0);
    publishMqtt(
      (sensor_topic + sensorTypes[1]).c_str(),
      forceUpdate ? "Command-Triggered Update" : "Regular Data Upload",
      sensorTypes[1].c_str(),
      String(temperature).c_str()
    );

    forceUpdate = false;
  }
}

