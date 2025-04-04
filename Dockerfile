# Step 1: Use Ubuntu as base image
FROM ubuntu:22.04

# Step 2: Install Node.js v22.14.0 and npm
RUN apt-get update && apt-get install -y curl ca-certificates gnupg && \
  mkdir -p /etc/apt/keyrings && \
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
  NODE_MAJOR=22 && \
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list && \
  apt-get update && \
  apt-get install -y nodejs && \
  node -v && \
  npm -v && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Step 3: Create app directory
WORKDIR /app

# Step 4: Copy package.json and package-lock.json for better caching
COPY package*.json ./

# Step 5: Install dependencies
RUN npm install

# ✅ Step 6: Copy remaining source files including Prisma schema
COPY . .

# ✅ Step 7: Now that schema is available, generate Prisma client
RUN npx prisma generate

# Optional: Build TypeScript (if needed)
RUN npm run build

# Step 8: Expose the port your app runs on
EXPOSE 3000

# Step 9: Start the app
CMD ["npm", "start"]
