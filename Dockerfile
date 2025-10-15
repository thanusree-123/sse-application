# --- Base Image Stage ---
# Use an official Node.js runtime as the parent image.
# The '18-alpine' tag provides a specific Node.js version (18) on a very small, secure Linux distribution (Alpine).
FROM node:18-alpine

# --- Configuration Stage ---
# Set the working directory inside the container to /app.
# All subsequent commands (COPY, RUN, CMD) will be executed from this directory.
WORKDIR /app

# --- Dependency Installation Stage ---
# Copy the package.json and package-lock.json files first.
# This is a key optimization. Docker caches layers, so if these files haven't changed,
# it will use the cached node_modules layer instead of re-installing everything on every build.
COPY package*.json ./

# Run the 'npm install' command to download all dependencies listed in package.json.
RUN npm install

# --- Application Code Stage ---
# Copy the rest of your application's source code into the working directory (/app).
# The first '.' refers to the source directory on your local machine (the project root).
# The second '.' refers to the destination directory inside the container (the WORKDIR, which is /app).
COPY . .

# --- Execution Stage ---
# Expose port 3000 to document which port the application listens on.
# This doesn't actually publish the port, but it serves as metadata for the user and tools.
EXPOSE 3000

# Define the default command to run when the container starts.
# This executes 'node server.js' to start your application.
# Using the ["exec", "form"] is the preferred syntax.
CMD ["node", "server.js"]
