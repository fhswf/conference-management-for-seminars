FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

ARG VITE_BACKEND_URL
RUN echo "VITE_BACKEND_URL=${VITE_BACKEND_URL}" > .env

RUN npm run build

FROM httpd:latest
COPY --from=build /app/dist /usr/local/apache2/htdocs/conference

#Enable rewrite module
RUN sed -i 's/#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf

#Create .htaccess file
RUN echo '<IfModule mod_rewrite.c>' > /usr/local/apache2/htdocs/conference/.htaccess && \
    echo '  RewriteEngine On' >> /usr/local/apache2/htdocs/conference/.htaccess && \
    echo '  RewriteCond %{REQUEST_FILENAME} !-f' >> /usr/local/apache2/htdocs/conference/.htaccess && \
    echo '  RewriteCond %{REQUEST_FILENAME} !-d' >> /usr/local/apache2/htdocs/conference/.htaccess && \
    echo '  RewriteRule ^ /conference/index.html [L]' >> /usr/local/apache2/htdocs/conference/.htaccess && \
    echo '</IfModule>' >> /usr/local/apache2/htdocs/conference/.htaccess

#AllowOverride
RUN echo '<Directory "/usr/local/apache2/htdocs/conference">' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    Options Indexes FollowSymLinks' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    AllowOverride All' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    Require all granted' >> /usr/local/apache2/conf/httpd.conf && \
    echo '</Directory>' >> /usr/local/apache2/conf/httpd.conf

EXPOSE 11001
