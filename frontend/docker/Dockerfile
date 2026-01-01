FROM node:22.4.0-alpine

WORKDIR /app

RUN npm install -g @angular/cli

COPY ./frontend/package*.json /app

RUN npm install

COPY ./frontend /app

EXPOSE 4200

CMD ["ng", "serve"]
