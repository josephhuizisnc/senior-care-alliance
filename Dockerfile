# Stage 1: Build the app
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of your application code
COPY . .

# Build the web app using the new Expo export command for web
RUN npx expo export -p web

# Stage 2: Serve the built app with Nginx
FROM nginx:alpine

# Copy the built static files from the builder stage to Nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
