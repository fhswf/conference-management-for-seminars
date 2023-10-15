const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rolleassignment', {
    personOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'person',
        key: 'personOID'
      }
    },
    seminarOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'seminar',
        key: 'seminarOID'
      }
    },
    roleOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'rollen',
        key: 'roleOID'
      }
    }
  }, {
    sequelize,
    tableName: 'rolleassignment',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personOID" },
          { name: "seminarOID" },
        ]
      },
      {
        name: "RolleAssignment2",
        using: "BTREE",
        fields: [
          { name: "seminarOID" },
        ]
      },
      {
        name: "RolleAssignment3",
        using: "BTREE",
        fields: [
          { name: "roleOID" },
        ]
      },
    ]
  });
};
