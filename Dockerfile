FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port 3000 (will be mapped to 8081)
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 