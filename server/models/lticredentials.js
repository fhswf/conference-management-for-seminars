const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('lticredentials', {
    consumerSecret: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    consumerKey: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: "consumerKey_2"
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'lticredentials',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "consumerSecret" },
        ]
      },
      {
        name: "consumerKey_2",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "consumerKey" },
        ]
      },
      {
        name: "consumerKey",
        using: "BTREE",
        fields: [
          { name: "consumerKey" },
        ]
      },
    ]
  });
};
