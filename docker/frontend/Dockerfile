FROM node:20

WORKDIR /app

# Nur package.json und lockfile zuerst kopieren (besseres Caching)
COPY src/frontend/package*.json ./

RUN npm install

COPY .env ./
# Jetzt den Rest des Codes kopieren
COPY src/frontend/ ./

EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "start"]
# CMD ["sh", "-c", "npm run dev; while true; do sleep 1000; done"]