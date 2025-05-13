# Projektdokumentation

## Höhere technische Bundeslehr- und Versuchsanstalt Villach

**Ausbildungszweig:**  
Informationstechnologie – Netzwerktechnik

**Projekt:**  
MQTT.d

**Erstellt von:**  
NOTT Julian  
3AHITN  
am 19.02.2025

**Auftraggeber:**  
Prof.Ing. BEd MSc Herbert Kleber

**Projektbetreuer:**  
Prof.Ing. BEd MSc Herbert Kleber

---

## 1. Inhaltsverzeichnis

1. Inhaltsverzeichnis  
2. Einleitung  
3. Konzept  
4. Projektmanagement  
5. Technische Dokumentation  
6. Resümee  
7. Ausblick  
8. Wichtige Verzeichnisse  

---

## 2. Einleitung

### 2.1 Überblick

Das Projekt „MQTT.d“ ist eine moderne Web-Applikation zur Visualisierung und Verwaltung von Sensordaten. Die Sensordaten werden über einen MQTT-Broker empfangen und im Dashboard dargestellt. Die Sensorverwaltung erfolgt ebenfalls über MQTT. Das Dashboard ist modular aufgebaut und erkennt neue Sensoren automatisch.

### 2.2 Motivation

Das Projektteam möchte sich im Bereich IoT und Sensordatenverarbeitung weiterentwickeln und neue Technologien wie MQTT, Next.js und Docker praktisch anwenden.

### 2.3 Organisation

Die Projektorganisation erfolgt über Microsoft Teams, GitHub Repository und GitHub Projects.  
- **Microsoft Teams:** Dokumentenübergabe und Strukturierung  
- **GitHub Repository:** Zentrale Codeverwaltung, Branches für Frontend/Backend  
- **GitHub Projects:** Kanban-Board für Aufgabenmanagement

### 2.4 Kommunikation

Die interne Kommunikation findet über Discord statt, um schnelle Abstimmung zu ermöglichen.

---

## 3. Konzept

### 3.1 Projektplanung

#### 3.1.1 Ablaufplanung

Vor jedem Meilenstein werden Aufgaben in Meetings besprochen, in Arbeitspakete unterteilt und in GitHub Projects dokumentiert.

#### 3.1.2 Meilensteine

1. 09.04.2025 – Prototyp Datenvisualisierung & erste Sensordaten  
2. 13.05.2025 – Prototyp Baukastensystem & automatische Sensorverwaltung  
3. 10.06.2025 – Endpräsentation, Fertigstellung Frontend & Backend

#### 3.1.3 Ziele (SMART)

- **S:** Entwicklung einer modularen Web-App zur Visualisierung von Sensordaten via MQTT  
- **M:** Anzeige von Daten von mindestens 2 Sensoren  
- **A:** Hohe Übersichtlichkeit und Benutzerfreundlichkeit  
- **R:** Modulare, flexibel erweiterbare Architektur  
- **T:** Fertigstellung bis 10.06.2025

#### 3.1.4 Risikomanagement

Risiken werden in einer Excel-Tabelle dokumentiert und bewertet.

#### 3.1.5 Controlling

Controlling erfolgt über Clockify (Zeiterfassung) und GitHub Projects (Aufgabenfortschritt).

### 3.2 Big-Picture

Das System besteht aus Sensoren, einem MQTT-Broker (HiveMQ4, Docker), einem Next.js-Frontend und optionalen Backend-Komponenten. Sensordaten werden nahezu live verarbeitet und angezeigt.

### 3.3 Planung Frontend

- **Framework:** Next.js (React-basiert)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Responsiveness:** Moderne, anpassbare UI
- **Navigation:** Dynamisch, ausgefahren/kondensiert

### 3.4 Planung Backend

- **API:** Next.js API-Routen für Sensorverwaltung, MQTT-Kommunikation, Konfiguration
- **Datenspeicherung:** JSON/YAML-Dateien pro Sensor, keine relationale Datenbank

### 3.5 Technisches Konzept

#### 3.5.1 MQTT-Broker

HiveMQ4 läuft als Docker-Container und stellt ein Webinterface für Debugging bereit.

#### 3.5.2 Sensordaten

Sensoren (z.B. Temperatur, LDR) senden Daten per MQTT. Die Sensoren sind WLAN-fähig und kommunizieren mit dem Broker.

#### 3.5.3 Frontend – Styleguide

- **Farben:** Modernes, anpassbares Farbschema
- **Schriftarten:** Geist Sans, Geist Mono
- **Displays:** Modular, konfigurierbar, verschiedene Typen (z.B. Temperatur, Helligkeit)

#### 3.5.4 Backend-Datenspeicherung

Sensor-Konfigurationen und Nachrichten werden als JSON/YAML-Dateien im Dateisystem abgelegt.  
Beispiel:  
- `sensor-data/<sensorID>/<sensorID>.json`  
- `sensor-data/<sensorID>/configurations/<dataType>-config.json`  
- `sensor-data/<sensorID>/messages/<dataType>-messages.json`

#### 3.5.5 Forciertes Updaten der Sensoren

Über eine spezielle API-Route (`/api/mqtt/force-update`) kann ein MQTT-Update für einen Sensor ausgelöst werden.

#### 3.5.6 Sensor-Konfiguration

Das Frontend bietet ein Formular zur Konfiguration von Sensoren (ID, Name, Standort, Typ, Grenzwerte etc.). Die Konfiguration wird validiert (Zod) und als Datei gespeichert.

#### 3.5.7 WIFI

Sensoren und Broker befinden sich im selben Netzwerk. Sensoren erhalten IPs per DHCP, der Broker hat eine feste Adresse.

---

## 4. Projektmanagement

### 4.1 Controlling

Arbeitszeiten und Aufgaben werden regelmäßig dokumentiert und ausgewertet.

### 4.2 Risikomanagement

Risiken werden laufend bewertet und Maßnahmen dokumentiert.

---

## 5. Technische Dokumentation

### 5.1 Frontend

#### 5.1.1 Struktur

- **public/** – Statische Assets (Bilder, Icons, Fonts)
- **src/app/** – Seiten, Routing, Error Pages, globales CSS
- **src/components/** – Wiederverwendbare UI-Komponenten (Displays, Navigation)
- **src/lib/** – TypeScript-Typen, Zod-Schemas, Utility-Funktionen
- **src/app/api/** – Next.js API-Routen (Sensoren, MQTT, Geräte, Räume)

#### 5.1.2 Beispiel: Sensor-API

Die Route [`src/app/api/sensors/route.ts`](src/frontend/src/app/api/sensors/route.ts) verarbeitet POST-Anfragen zur Registrierung neuer Sensoren.  
- Validiert Daten mit Zod  
- Legt Verzeichnisse für Sensor, Konfiguration und Nachrichten an  
- Speichert Konfigurationen und initialisiert Nachrichten-Dateien

#### 5.1.3 Beispiel: Räume-Seite

Die Seite [`src/app/rooms/page.tsx`](src/frontend/src/app/rooms/page.tsx) gruppiert Sensoren nach Standort (Stockwerk, Raum) und zeigt sie übersichtlich an.

### 5.2 Backend

- Keine klassische Datenbank, sondern Dateispeicherung im `sensor-data`-Verzeichnis
- API-Routen für CRUD-Operationen an Sensoren und Konfigurationen

### 5.3 MQTT-Broker

- HiveMQ4 als Docker-Container
- Webinterface für Monitoring

### 5.4 Sensor(-en)

- WLAN-fähige Sensoren (z.B. Temperatur, LDR)
- Kommunikation via MQTT

### 5.5 WIFI

- Eigenes, passwortgeschütztes Netzwerk für Sensoren und Broker

### 5.6 Docker

- Dockerfile und docker-compose.yml für einfaches Deployment von Frontend, Backend und Broker

---

## 6. Resümee

### 6.1 Persönliche Erfahrungen

#### 6.1.1 Julian Nott

*Eigene Reflexion und Erfahrungen mit dem Projekt.*

### 6.2 Projektcontrolling

- Abschlussbericht und Zielerreichung werden dokumentiert

---

## 7. Ausblick

### 7.1 Lessons Learned

- Erfahrungen mit neuen Technologien, Teamarbeit und Projektmanagement

### 7.2 Weiterentwicklungsmöglichkeiten

- Erweiterung um weitere Sensortypen
- Integration einer Datenbank
- Verbesserte Visualisierungen

---

## 8. Wichtige Verzeichnisse

### 8.1 Abbildungsverzeichnis

*Hier werden alle verwendeten Abbildungen gelistet.*

### 8.2 Codeverzeichnis

*Hier werden alle wichtigen Code-Dateien und deren Pfade gelistet.*

### 8.3 Quellenverzeichnis

*Hier werden alle verwendeten Quellen und Referenzen aufgeführt.*

---