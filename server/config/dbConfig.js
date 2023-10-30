//TODO
//require('dotenv').config();

module.exports = {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "",
    DATABASE: process.env.DB_NAME || "konferenz-management",
    DIALECT: process.env.DB_TYPE || "mariadb",
    PORT: process.env.DB_PORT || 3306,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    }
}