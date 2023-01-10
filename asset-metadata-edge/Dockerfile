FROM node:17-alpine

WORKDIR /usr/app/

COPY ./asset-metadata-edge/package.json ./
COPY ./asset-metadata-edge/package-lock.json ./

RUN npm install

CMD ["/bin/sh" , "-c" , "cd asset-metadata && npm run build"]
