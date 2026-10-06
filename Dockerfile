FROM node:26

WORKDIR /app

RUN npm install --global yarn

RUN git config --global --add safe.directory /app

CMD [ "sh" ]
