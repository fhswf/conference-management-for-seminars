const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('seminar', {
    seminarOID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phase: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    key:{
        type: DataTypes.CHAR(32),
        allowNull: true
    }
  }, {
    sequelize,
    tableName: 'seminar',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "seminarOID" },
        ]
      },
    ]
  });
};
