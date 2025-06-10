# MQTT.d 

---

## Features

- **HiveMQ**: MQTT broker for sensor data.
- **Frontend**: Next.js dashboard for sensor monitoring and configuration.
- **Backend**: Node.js API for sensor data and alert management.
- **Data & User Volumes**: Persistent storage for sensor and user data.
- **Nginx**: Reverse proxy for secure access.
- **Hot-reload**: Bind mounts for development.

---

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) and [Docker Compose](https://docs.docker.com/compose/)
- (Optional) [Git](https://git-scm.com/)

---

## Quick Start

1. **Clone the repository**

   ```sh
   git clone https://github.com/EinsBackstein/mqtt.d.git
   cd mqtt.d
   ```

2. **Configure environment variables**

   Copy the example file and adjust as needed:

   ```sh
   cp .env.example .env
   ```

   Edit `.env` to set your preferences (e.g., `NEXT_PUBLIC_ALERT_BEST_MATCH_ONLY`).

2.5. **Create user-data folder in src/ if it doesn't exsist**

3. **Build and start all services**

   ```sh
   docker compose up --build
   ```

   This will build and start all containers in the background.

4. **Access the services**

   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **HiveMQ Web UI**: [http://localhost:8080](http://localhost:8080)
   - **MQTT Broker**: `localhost:1883`

---

## Folder Structure

- `docker/` - Dockerfiles and Nginx config
- `src/frontend/` - Next.js frontend app
- `src/backend/` - Node.js backend API
- `src/user-data/` - User data (mounted to `/data` in user container)
- `src/backend-data/` - Sensor data (mounted to `/data` in data container)

---

## Useful Commands

- **Stop all containers:**
  ```sh
  docker compose down
  ```

- **View logs:**
  ```sh
  docker compose logs -f
  ```

- **Rebuild a single service:**
  ```sh
  docker compose build frontend
  docker compose up -d frontend
  ```

---

## Notes

- Data and user folders are persisted using Docker volumes.
- The `.env` file controls alert system behavior and can be extended for more configuration.
- For production, configure SSL certificates in `docker/nginx/certs`.

---

## Troubleshooting

- If you change dependencies or Dockerfiles, always rebuild with `docker compose up --build`.
- Make sure ports `1883`, `3000`, `8080`, and `80`/`443` are not in use by other applications.

---

## License

MIT
