# Use Node.js 20 Alpine base image
FROM node:20-alpine

# Install required build tools for canvas
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    gdk-pixbuf-dev \
    libjpeg-turbo-dev \
    giflib-dev

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install canvas

# Expose port 3000 for Next.js
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]
