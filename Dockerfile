FROM node:26

WORKDIR /app

RUN npm install --global pnpm@12

RUN git config --global --add safe.directory /app

CMD [ "sh" ]
