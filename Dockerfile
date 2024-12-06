FROM node:14.10.1

WORKDIR /app

COPY ./ /app/

RUN npm install

CMD ["npm", "run", "start"]