# Use Node.js base image
FROM node:22

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port your app runs on (change if different)
EXPOSE 4000

# Command to run your app
CMD ["npm", "run", "start"]
