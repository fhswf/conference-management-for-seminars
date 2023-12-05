const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ltiuser', {
    LtiUserOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    consumerURL: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    userOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'userOID'
      }
    }
  }, {
    sequelize,
    tableName: 'ltiuser',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "LtiUserOID" },
          { name: "consumerURL" },
        ]
      },
      {
        name: "LtiUser114",
        using: "BTREE",
        fields: [
          { name: "userOID" },
        ]
      },
    ]
  });
};
