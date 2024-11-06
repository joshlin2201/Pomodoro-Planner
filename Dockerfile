# Use an official Node.js image as the base image
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the container
COPY . .

# Build the Next.js application and export static files
RUN npm run build 

# Production environment
FROM node:18-alpine AS production

# Install `serve` globally to serve the static files
RUN npm install -g serve

# Set the working directory for the production environment
WORKDIR /app

# Copy the exported static files from the build stage
COPY --from=build /app/out /app/out

# Expose port 3000 for the static file server
EXPOSE 3000

# Use `serve` to serve the static files on port 3000
CMD ["serve", "-s", "out", "-l", "3000"]
