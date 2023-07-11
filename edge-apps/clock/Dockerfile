FROM node:16-alpine

WORKDIR /usr/app/

COPY ["package.json", "package-lock.json", "mocks/db.json", "./"]

RUN npm install

CMD ["npm", "run", "mock"]
