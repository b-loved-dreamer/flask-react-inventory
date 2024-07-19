# Build React app
FROM node:18-alpine as build-stage
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# use the default nginx image
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html