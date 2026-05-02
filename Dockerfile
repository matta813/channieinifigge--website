FROM nginx:stable-alpine

# Kopiere die index.html in das Standard-Verzeichnis von Nginx
COPY index.html /usr/share/nginx/html/index.html

# Exponiere Port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
