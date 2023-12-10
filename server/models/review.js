const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('review', {
    reviewOID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    paperOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'paper',
        key: 'paperOID'
      }
    },
    reviewerOID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'userOID'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'review',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "reviewOID" },
        ]
      },
      {
        name: "Review1",
        using: "BTREE",
        fields: [
          { name: "reviewerOID" },
        ]
      },
      {
        name: "Review3",
        using: "BTREE",
        fields: [
          { name: "paperOID" },
        ]
      },
    ]
  });
};
