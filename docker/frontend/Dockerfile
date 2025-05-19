FROM node:22.9-alpine
RUN mkdir /app
WORKDIR /app
COPY src/frontend /app
RUN apk add --no-cache git
RUN npm install 
EXPOSE 3000
CMD [ "npm", "run", "dev" ]