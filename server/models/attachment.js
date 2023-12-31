const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('attachment', {
    attachmentOID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    file: {
      type: DataTypes.BLOB('medium'),
      allowNull: false
    },
    mimetype: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    filename: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'attachment',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "attachmentOID" },
        ]
      },
    ]
  });
};
