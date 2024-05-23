# Use the official Node.js 14 image as the base image
FROM node:14

# Create and change to the app directory
WORKDIR /usr/src/app

# Clone the repository
RUN git clone https://github.com/measureschool/activecampaign-event-tracking-proxy.git .

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["node", "index.js"]
