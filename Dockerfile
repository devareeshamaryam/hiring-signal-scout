# TenderScout image for Cloud Run Jobs. One image, two jobs:
#   tender bot (default):  node src/index.js
#   hiring bot:            override args with src/hiring.js
# Keys come from env vars / Secret Manager, never from files baked into the image.

FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

# Dependencies first so they stay cached when only the code changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

USER node

ENTRYPOINT ["node"]
CMD ["src/index.js"]
