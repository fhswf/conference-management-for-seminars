const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chatmessage', {
    chatmessageOID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attachmentOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'attachment',
        key: 'attachmentOID'
      }
    },
    reviewOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'review',
        key: 'reviewOID'
      }
    },
    sender: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'userOID'
        }
    },
    receiver: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'userOID'
        }
    },
  }, {
    sequelize,
    tableName: 'chatmessage',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "chatmessageOID" },
        ]
      },
      {
        name: "reviewerChat1",
        using: "BTREE",
        fields: [
          { name: "attachmentOID" },
        ]
      },
      {
        name: "chatmessage2",
        using: "BTREE",
        fields: [
          { name: "reviewOID" },
        ]
      },
    ]
  });
};
