FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM httpd:latest
COPY --from=build /app/dist /usr/local/apache2/htdocs/

##RUN a2enmod ssl
RUN sed -i 's/#LoadModule ssl_module modules\/mod_ssl.so/LoadModule ssl_module modules\/mod_ssl.so/' /usr/local/apache2/conf/httpd.conf

COPY ssl.conf /usr/local/apache2/conf/extra/ssl.conf

RUN echo "Include conf/extra/ssl.conf" >> /usr/local/apache2/conf/httpd.conf
EXPOSE 443

