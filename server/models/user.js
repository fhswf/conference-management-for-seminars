const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    userOID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    firstname: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastname: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mail: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userOID" },
        ]
      },
    ]
  });
};
