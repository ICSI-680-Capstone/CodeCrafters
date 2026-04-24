FROM node:20-alpine

# python3 is required by the code-runner route
RUN apk add --no-cache python3

WORKDIR /app

# Install dependencies first (better layer caching)
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy server source
COPY server/ .

EXPOSE 5000

CMD ["node", "server.js"]
