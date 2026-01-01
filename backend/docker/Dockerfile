FROM node:22.4.0-alpine

WORKDIR /app

COPY ./backend/package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
