#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// WLAN-Zugangsdaten – bitte anpassen!
const char* ssid     = "pandora-n";
const char* password = "aron2000";

// MQTT-Server-Konfiguration für HiveMQ (öffentlicher Broker)
const char* mqttServer = "172.27.11.101";
const int   mqttPort   = 1883;
const char* mqttTopic  = "sensor/data";

// WLAN und MQTT Client
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Definition der Pins für die Sensoren
#define SENSOR_PIN   A0     // Analoger Pin für den Lichtsensor
#define ONE_WIRE_BUS D0     // Anschluss für den Temperatursensor (OneWire)

// Sensoren initialisieren
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Timer für das periodische Senden
unsigned long lastMsgTime = 0;

void reconnectMQTT() {
  // Versuche, bis zur erfolgreichen Verbindung zum MQTT-Broker ...
  while (!mqttClient.connected()) {
    Serial.print("Verbinde mit MQTT-Broker ");
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("verbunden");
      // Hier könntest du unter Umständen auch noch subscriben.
    } else {
      Serial.print("Verbindung fehlgeschlagen, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" -> Erneuter Versuch in 5 Sekunden");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(9600);
  delay(10);

  // Sensoren starten
  sensors.begin();

  // Mit dem WLAN verbinden
  Serial.print("Verbinde mit WLAN ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  WiFi.localIP();
  Serial.println();
  Serial.println("WLAN verbunden | IP-Adresse: ");
  Serial.println(WiFi.localIP());

  // MQTT-Server einstellen (HiveMQ)
  mqttClient.setServer(mqttServer, mqttPort);

  // Mit dem MQTT-Broker verbinden
  reconnectMQTT();
}

void loop() {
  // Prüfe, ob die MQTT-Verbindung aktiv ist
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Alle 1000 ms werden Sensorwerte ausgelesen und publiziert
  if (millis() - lastMsgTime > 1000) {
    lastMsgTime = millis();

    // Temperatur aus dem DS18B20 anfordern und lesen
    sensors.requestTemperatures();
    float temperature = sensors.getTempCByIndex(0);

    // Lichtsensorwert über den analogen Eingang lesen 
    int lightValue = analogRead(SENSOR_PIN);

    // Erstelle einen JSON-String z.B. {"temperature":23.45,"light":512}
    String jsonPayload = "{";
    jsonPayload += "\"temperature\":";
    jsonPayload += temperature;
    jsonPayload += ",\"light\":";
    jsonPayload += lightValue;
    jsonPayload += "}";

    // Ausgabe im Serial-Monitor
    Serial.print("Sende Nachricht: ");
    Serial.println(jsonPayload);

    // Veröffentliche die JSON-Daten zum angegebenen Topic
    mqttClient.publish(mqttTopic, jsonPayload.c_str());
  }
}