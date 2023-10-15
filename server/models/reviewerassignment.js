const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reviewerassignment', {
    reviewerA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'person',
        key: 'personOID'
      }
    },
    reviewerB: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'person',
        key: 'personOID'
      }
    },
    paperOID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'paper',
        key: 'paperOID'
      }
    }
  }, {
    sequelize,
    tableName: 'reviewerassignment',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "reviewerA" },
          { name: "reviewerB" },
        ]
      },
      {
        name: "ReviewerAssignment114",
        using: "BTREE",
        fields: [
          { name: "paperOID" },
        ]
      },
      {
        name: "ReviewerZuordnung3",
        using: "BTREE",
        fields: [
          { name: "reviewerB" },
        ]
      },
    ]
  });
};
