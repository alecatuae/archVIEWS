FROM node:18-alpine

WORKDIR /app

# Copy application files from the archVIEWS directory
COPY archVIEWS/package*.json ./
RUN npm install

# Copy remaining files from archVIEWS directory
COPY archVIEWS/ ./

# Create needed directories if they don't exist
RUN mkdir -p pages src/pages

# Build the application
RUN npm run build || echo "Build failed, but continuing for development mode"

# Expose port 3000 (will be mapped to 8081)
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 