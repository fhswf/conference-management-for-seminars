const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('roleassignment', {
    userOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'userOID'
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
      allowNull: false,
      references: {
        model: 'roles',
        key: 'roleOID'
      }
    },
    grade: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    phase4paperOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'paper',
        key: 'paperOID'
      }
    },
    phase7paperOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'paper',
        key: 'paperOID'
      }
    }
  }, {
    sequelize,
    tableName: 'roleassignment',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userOID" },
          { name: "seminarOID" },
        ]
      },
      {
        name: "roleassignment_userOID_seminarOID_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userOID" },
          { name: "seminarOID" },
        ]
      },
      {
        name: "seminarOID",
        using: "BTREE",
        fields: [
          { name: "seminarOID" },
        ]
      },
      {
        name: "RoleAssignment1",
        using: "BTREE",
        fields: [
          { name: "userOID" },
        ]
      },
      {
        name: "RoleAssignment3",
        using: "BTREE",
        fields: [
          { name: "roleOID" },
        ]
      },
      {
        name: "RoleAssignment4",
        using: "BTREE",
        fields: [
          { name: "phase4paperOID" },
        ]
      },
      {
        name: "RoleAssignment5",
        using: "BTREE",
        fields: [
          { name: "phase7paperOID" },
        ]
      },
    ]
  });
};
