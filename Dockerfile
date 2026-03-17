FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend
COPY backend ./backend

# Expose port
EXPOSE 3000

# Run backend server
CMD ["node", "backend/server.mjs"]
