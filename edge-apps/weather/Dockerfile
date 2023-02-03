FROM node:16-alpine

WORKDIR /usr/app/

COPY ["package.json", "package-lock.json", "gulpfile.js", ".babelrc", "./"]

RUN npm install

CMD ["npm", "run", "build"]
