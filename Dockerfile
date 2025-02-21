# Use an official Node.js runtime as a parent image
FROM node:14 AS base

# Set the working directory
WORKDIR /home/node/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Use a multi-stage build
FROM base AS production

# Set the NODE_ENV to production
ENV NODE_PATH=./build

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "run", "dev"]