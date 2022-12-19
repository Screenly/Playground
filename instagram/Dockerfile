FROM node:17-alpine

WORKDIR /usr/app/

COPY ./instagram/package.json ./
COPY ./instagram/package-lock.json ./

RUN npm install

CMD ["/bin/sh" , "-c" , "cd instagram && npm run build"]
