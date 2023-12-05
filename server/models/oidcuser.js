const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('oidcuser', {
    subject: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    provider: {
      type: DataTypes.TEXT,
      allowNull: false
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
    tableName: 'oidcuser',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "subject" },
        ]
      },
      {
        name: "OidcUser1",
        using: "BTREE",
        fields: [
          { name: "userOID" },
        ]
      },
    ]
  });
};
