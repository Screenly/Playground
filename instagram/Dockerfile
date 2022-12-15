FROM node:17-alpine

WORKDIR /usr/app

RUN mkdir -p /usr/app/instagram

COPY ./bootstrap/theme ./bootstrap/theme
COPY ./instagram/package.json ./instagram/
COPY ./instagram/package-lock.json ./instagram/

WORKDIR /usr/app/instagram
RUN npm install

COPY ./instagram ./

CMD ["npm", "run", "build"]
