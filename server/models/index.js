const dbConfig = require("../config/dbConfig.js");

//create file with: sequelize-auto -h "localhost" -d "konferenz-management" -u "root" -p 3306  --dialect "mariadb" -o .\models\
const initModels = require("./init-models.js");

const {Sequelize, DataTypes} = require("sequelize");

const sequelize = new Sequelize(dbConfig.DATABASE, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT,
    timezone: 'Europe/Berlin',
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
    logging: true
});

sequelize.authenticate().then(() => {
    console.log("Connection has been established successfully.");
}).catch(err => {
    console.error("Unable to connect to the database:", err);
});

const db = initModels(sequelize, DataTypes);

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.sequelize.sync({force: false})
    .then(() => {
        // Default role values
        db.roles.findOrCreate({
            where: {
                roleOID: 1
            },
            defaults: {
                roleOID: 1,
                description: 'course-admin'
            }
        });
        db.roles.findOrCreate({
            where: {
                roleOID: 2
            },
            defaults: {
                roleOID: 2,
                description: 'supervisor'
            }
        });
        db.roles.findOrCreate({
            where: {
                roleOID: 3
            },
            defaults: {
                roleOID: 3,
                description: 'student'
            }
        });
        console.log('Sync Database');
    })


module.exports = db;
