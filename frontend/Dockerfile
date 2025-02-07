# Use Node.js official image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Serve the frontend using a simple HTTP server
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
