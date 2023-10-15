const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paper', {
    paperOID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    studentOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'person',
        key: 'personOID'
      }
    },
    seminarOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'seminar',
        key: 'seminarOID'
      }
    },
    pdf: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    submitted: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'paper',
    timestamps: false,
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
        name: "Paper1",
        using: "BTREE",
        fields: [
          { name: "studentOID" },
        ]
      },
      {
        name: "Paper2",
        using: "BTREE",
        fields: [
          { name: "seminarOID" },
        ]
      },
    ]
  });
};
