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
      allowNull: false
    },
    phase: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assignmentkey: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: "assignmentkey"
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
      {
        name: "assignmentkey",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "assignmentkey" },
        ]
      },
    ]
  });
};
