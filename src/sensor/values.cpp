#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>


//Defines PINs
#define LED1_PIN D4
#define SENSOR_PIN A0
#define ONE_WIRE_BUS D0


//WLAN hinzufügen
const char* ssid = "ssid"; //SSID des WLANs angeben
const char* password = "pw"; //Passwort des WLANs angeben (am besten Plain-Text)


OneWire oneWire(ONE_WIRE_BUS);// OneWire-Instanz für den Bus erstellen
DallasTemperature sensors(&oneWire);// DallasTemperature-Objekt mit OneWire verbinden
ESP8266WebServer server(80);


void handleRoot() {
  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);
  int sensorValueLight = analogRead(SENSOR_PIN);

  String html = "<html>";
  html += "<head> <meta charset=\"UTF-8\"/> </head>";
  html += "<body>";
  html += "<h1>ESP8266 Webserver</h1>";
  html += "<p>Temperatur: " + String(temperatureC) + " °C</p>";
  html += "<p>Lichtwert: " + String(sensorValueLight) + "</p>";
  html += "</body></html>";

  server.send(200, "text/html", html);
}

void setup() {
  pinMode(LED1_PIN, OUTPUT);
  pinMode(SENSOR_PIN, INPUT);

  Serial.begin(9600);
  sensors.begin();


  // WLAN-Verbindung herstellen
  WiFi.begin(ssid, password);
  Serial.print("Verbinde mit WLAN...");
  
  while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
  }

  Serial.println("\nVerbunden mit WiFi!");
  Serial.print("IP-Adresse: ");
  Serial.println(WiFi.localIP());

  //? sensors.begin();
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);
  Serial.print("Temperatur: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  int sensorValueLight = analogRead(SENSOR_PIN); // Sensorwert auslesen
  Serial.print("Lichtsensorwert: ");
  Serial.println(sensorValueLight);

  if (sensorValueLight < 500) {
      digitalWrite(LED1_PIN, HIGH); // LED an
  } else {
      digitalWrite(LED1_PIN, LOW);  // LED aus
  }
  delay(500);

  server.handleClient(); // Anfragen bearbeiten
}