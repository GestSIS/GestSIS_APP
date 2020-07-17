FROM node:lts-alpine

WORKDIR /app
RUN yarn global add @vue/cli

CMD [ "sh" ]
