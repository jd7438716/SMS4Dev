FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm globally just in case
RUN npm install -g pnpm

COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install; \
    else \
      npm install; \
    fi

COPY . .

# Build using the correct package manager
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm run build; \
    else \
      npm run build; \
    fi

FROM node:20-alpine
WORKDIR /app

# Create directory structure
RUN mkdir -p server

# Install server deps
WORKDIR /app/server
COPY server/package.json ./
RUN npm install --production
COPY server/index.js ./

# Copy built frontend
WORKDIR /app
COPY --from=builder /app/dist ./dist

# Final working directory
WORKDIR /app/server

EXPOSE 5081
CMD ["node", "index.js"]
