import paho.mqtt.client as mqtt
import threading
import sys

# MQTT Broker configuration
broker = "192.168.1.100"
port = 1883
topic = "sensors/ESP8266/6840/#"
command_topic = ""  # Will be set after client ID input

# Get client ID from user
client_id = input("Enter ESP8266 client ID (hex value): ").strip()
command_topic = f"sensors/ESP8266/{client_id}/forceUpdate"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
        client.subscribe(topic)
        print(f"Subscribed to {topic}")
        print(f"Command topic: {command_topic}")
    else:
        print(f"Connection failed with code {rc}")

def on_message(client, userdata, msg):
    print(f"\n[INCOMING] {msg.topic}: {msg.payload.decode()}")

def input_listener():
    while True:
        cmd = input("\nPress 'u' to force update | 'q' to quit: ").lower()
        if cmd == 'u':
            print("\nSending UPDATE command...")
            client.publish(command_topic, "UPDATE")
        elif cmd == 'q':
            print("Exiting...")
            client.disconnect()
            sys.exit(0)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print(f"Connecting to broker {broker}:{port}...")
client.connect(broker, port, keepalive=60)

# Start input thread
thread = threading.Thread(target=input_listener, daemon=True)
thread.start()

# Start MQTT loop
client.loop_forever()