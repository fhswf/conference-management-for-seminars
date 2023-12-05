const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paper', {
    paperOID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    seminarOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'seminar',
        key: 'seminarOID'
      }
    },
    authorOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'userOID'
      }
    },
    attachmentOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'attachment',
        key: 'attachmentOID'
      }
    }
  }, {
    sequelize,
    tableName: 'paper',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "paperOID" },
        ]
      },
      {
        name: "Paper2",
        using: "BTREE",
        fields: [
          { name: "seminarOID" },
        ]
      },
      {
        name: "Paper3",
        using: "BTREE",
        fields: [
          { name: "attachmentOID" },
        ]
      },
      {
        name: "Paper4",
        using: "BTREE",
        fields: [
          { name: "authorOID" },
        ]
      },
    ]
  });
};
