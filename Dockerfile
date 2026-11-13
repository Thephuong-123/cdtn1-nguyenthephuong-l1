
FROM node:22-alpine

WORKDIR /app

# Install locked dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy backend, tests, scripts and database files
COPY src ./src
COPY tests ./tests
COPY scripts ./scripts
COPY db ./db

ENV NODE_ENV=development
EXPOSE 3000

USER node

CMD ["npm", "start"]
