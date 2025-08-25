# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --silent

COPY . .

EXPOSE 5174

# RUN npm run dev

# # Stage 2: Serve the React application with Nginx
# FROM nginx:alpine

# # Copy the Nginx configuration file
# # Create a custom nginx.conf in your project root if you need specific configurations
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Remove the default Nginx index.html
# RUN rm -rf /usr/share/nginx/html/*

# # Copy the built React app from the builder stage into Nginx's public directory
# COPY --from=builder /app/build /usr/share/nginx/html

# # Expose port 80, the default HTTP port Nginx listens on
# EXPOSE 80

# # Command to run Nginx when the container starts
# CMD ["nginx", "-g", "daemon off;"]