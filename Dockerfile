# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install build dependencies for bcrypt/node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files and install all dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install postgresql-client for pg_isready
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package.json yarn.lock ./

# Copy node_modules from build stage to avoid redundant network calls
COPY --from=build /app/node_modules ./node_modules

# Copy built files and source code needed for migrations
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./tsconfig.json

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
