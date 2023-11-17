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
      allowNull: true
    },
    personOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'person',
        key: 'personOID'
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
        name: "OidcPerson1",
        using: "BTREE",
        fields: [
          { name: "personOID" },
        ]
      },
    ]
  });
};
