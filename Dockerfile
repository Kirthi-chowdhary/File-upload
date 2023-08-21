# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container's working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code to the container's working directory
COPY . .

# Expose port 8001 (assuming your application listens on this port)
EXPOSE 8001

# Start the application using "npm start" command
CMD ["npm", "start"]