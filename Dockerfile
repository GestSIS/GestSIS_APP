FROM node:16-alpine

WORKDIR /app
RUN yarn global add @vue/cli

CMD [ "sh" ]
