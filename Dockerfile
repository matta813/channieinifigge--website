FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

# Security headers, CSP and the favicon.ico alias
COPY default.conf /etc/nginx/conf.d/default.conf

COPY index.html /usr/share/nginx/html/index.html
COPY 404.html /usr/share/nginx/html/404.html
COPY style.css /usr/share/nginx/html/style.css
COPY main.js /usr/share/nginx/html/main.js
COPY favicon.svg /usr/share/nginx/html/favicon.svg
COPY robots.txt /usr/share/nginx/html/robots.txt
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY social-preview.png /usr/share/nginx/html/social-preview.png

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
