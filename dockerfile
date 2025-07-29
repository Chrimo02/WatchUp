# ── Stage 1: Build the React app ───────────────────────────────────────────
FROM node:20-alpine AS builder

# allow passing in your VITE_... keys at build time
ARG VITE_TMDB_API_KEY
ARG VITE_OMDB_API_KEY
ENV VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY
ENV VITE_OMDB_API_KEY=$VITE_OMDB_API_KEY

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# <-- change here: only build the client
RUN npm run build:client

# ── Stage 2: Serve with nginx ─────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist/spa /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
