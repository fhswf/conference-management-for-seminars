const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contexttoseminar', {
    LtiContextId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    consumerURL: {
      type: DataTypes.STRING(64),
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
    }
  }, {
    sequelize,
    tableName: 'contexttoseminar',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "LtiContextId" },
          { name: "consumerURL" },
        ]
      },
      {
        name: "seminarOID",
        using: "BTREE",
        fields: [
          { name: "seminarOID" },
        ]
      },
    ]
  });
};
