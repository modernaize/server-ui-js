# docker build \
#     -t liveobjects/ui \
#     --memory-swap=-1 \
#     -f Dockerfile_Node \
#     --target final-stage \
#     .

# === Stage 1: - Build UI ===
FROM node:12.16.1-alpine AS build-stage


# Set ENV variables
ENV NODE_ENV=production
ENV BABEL_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=8192
COPY . .


RUN npm i
RUN npm i --only=dev
RUN npm run build

# === Stage 2: - Build server ===
FROM node:12.16.1-alpine AS final-stage

RUN apk add --no-cache curl

ENV NODE_ENV=production

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app

WORKDIR /home/node/app

# Copy the built UI
COPY --from=build-stage dist dist

COPY --chown=node:node server ./

USER node

RUN npm i

EXPOSE 3000 9991

ENTRYPOINT [ "node", "server.js" ]
