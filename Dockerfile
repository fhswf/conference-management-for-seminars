FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM httpd:latest
COPY --from=build /app/dist /usr/local/apache2/htdocs/conference

#Change Port
RUN sed -i 's/Listen 80/Listen 11001/' /usr/local/apache2/conf/httpd.conf

EXPOSE 11001

