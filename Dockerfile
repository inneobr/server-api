FROM node:lts-alpine
WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY . .
RUN sudo npm run build

EXPOSE 3000
CMD [ "npm", "run", "serve" ]