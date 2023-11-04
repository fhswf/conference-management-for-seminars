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
    pdf: {
      type: DataTypes.BLOB('medium'),
      allowNull: true
    },
    filename: {
      type: DataTypes.TEXT,
        allowNull: true
    },
    mimetype: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    personOIDSupervisor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'person',
        key: 'personOID'
      }
    },
    personOIDStudent: {
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
    statusOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'status',
        key: 'statusOID'
      }
    },
    submitted: {
      type: DataTypes.DATE,
      allowNull: true
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
          { name: "personOIDStudent" },
        ]
      },
      {
        name: "Concept4",
        using: "BTREE",
        fields: [
          { name: "personOIDSupervisor" },
        ]
      },
      {
        name: "Concept3",
        using: "BTREE",
        fields: [
          { name: "statusOID" },
        ]
      },
    ]
  });
};
