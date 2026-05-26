FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Frontend static files are copied in via docker-compose volume mount
# from a separate frontend build step (see docker-compose.yml)

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
