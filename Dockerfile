FROM node:18-alpine

WORKDIR /app
RUN yarn global add @vue/cli

CMD [ "sh" ]
