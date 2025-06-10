FROM node:22.9-alpine

WORKDIR /app

# Only copy package files first for better caching
COPY src/backend/package*.json ./

RUN npm install

# Copy the rest of your backend source
COPY src/backend .

EXPOSE 4000

CMD ["sh", "-c", "npm run dev; while true; do sleep 1000; done"]