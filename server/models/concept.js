const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('concept', {
    conceptOID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userOIDSupervisor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'userOID'
      }
    },
    userOIDStudent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'userOID'
      }
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    seminarOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'seminar',
        key: 'seminarOID'
      }
    },
    accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
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
    tableName: 'concept',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "conceptOID" },
        ]
      },
      {
        name: "Concept1",
        using: "BTREE",
        fields: [
          { name: "seminarOID" },
        ]
      },
      {
        name: "Concept2",
        using: "BTREE",
        fields: [
          { name: "userOIDStudent" },
        ]
      },
      {
        name: "Concept4",
        using: "BTREE",
        fields: [
          { name: "userOIDSupervisor" },
        ]
      },
      {
        name: "Concept3",
        using: "BTREE",
        fields: [
          { name: "attachmentOID" },
        ]
      },
    ]
  });
};
