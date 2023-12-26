var DataTypes = require("sequelize").DataTypes;
var _attachment = require("./attachment");
var _chatmessage = require("./chatmessage");
var _concept = require("./concept");
var _contexttoseminar = require("./contexttoseminar");
var _ltiuser = require("./ltiuser");
var _oidcuser = require("./oidcuser");
var _paper = require("./paper");
var _review = require("./review");
var _roleassignment = require("./roleassignment");
var _roles = require("./roles");
var _seminar = require("./seminar");
var _user = require("./user");

function initModels(sequelize) {
  var attachment = _attachment(sequelize, DataTypes);
  var chatmessage = _chatmessage(sequelize, DataTypes);
  var concept = _concept(sequelize, DataTypes);
  var contexttoseminar = _contexttoseminar(sequelize, DataTypes);
  var ltiuser = _ltiuser(sequelize, DataTypes);
  var oidcuser = _oidcuser(sequelize, DataTypes);
  var paper = _paper(sequelize, DataTypes);
  var review = _review(sequelize, DataTypes);
  var roleassignment = _roleassignment(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var seminar = _seminar(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  seminar.belongsToMany(user, { as: 'userOID_users', through: roleassignment, foreignKey: "seminarOID", otherKey: "userOID" });
  user.belongsToMany(seminar, { as: 'seminarOID_seminars', through: roleassignment, foreignKey: "userOID", otherKey: "seminarOID" });
  chatmessage.belongsTo(attachment, { as: "attachmentO", foreignKey: "attachmentOID"});
  attachment.hasMany(chatmessage, { as: "chatmessages", foreignKey: "attachmentOID"});
  concept.belongsTo(attachment, { as: "attachmentO", foreignKey: "attachmentOID"});
  attachment.hasMany(concept, { as: "concepts", foreignKey: "attachmentOID"});
  paper.belongsTo(attachment, { as: "attachmentO", foreignKey: "attachmentOID"});
  attachment.hasMany(paper, { as: "papers", foreignKey: "attachmentOID"});
  review.belongsTo(paper, { as: "paperO", foreignKey: "paperOID"});
  paper.hasMany(review, { as: "reviews", foreignKey: "paperOID"});
  roleassignment.belongsTo(paper, { as: "phase3paperO", foreignKey: "phase3paperOID"});
  paper.hasMany(roleassignment, { as: "roleassignments", foreignKey: "phase3paperOID"});
  roleassignment.belongsTo(paper, { as: "phase7paperO", foreignKey: "phase7paperOID"});
  paper.hasMany(roleassignment, { as: "phase7paperO_roleassignments", foreignKey: "phase7paperOID"});
  chatmessage.belongsTo(review, { as: "reviewO", foreignKey: "reviewOID"});
  review.hasMany(chatmessage, { as: "chatmessages", foreignKey: "reviewOID"});
  roleassignment.belongsTo(roles, { as: "roleO", foreignKey: "roleOID"});
  roles.hasMany(roleassignment, { as: "roleassignments", foreignKey: "roleOID"});
  concept.belongsTo(seminar, { as: "seminarO", foreignKey: "seminarOID"});
  seminar.hasMany(concept, { as: "concepts", foreignKey: "seminarOID"});
  contexttoseminar.belongsTo(seminar, { as: "seminarO", foreignKey: "seminarOID"});
  seminar.hasMany(contexttoseminar, { as: "contexttoseminars", foreignKey: "seminarOID"});
  paper.belongsTo(seminar, { as: "seminarO", foreignKey: "seminarOID"});
  seminar.hasMany(paper, { as: "papers", foreignKey: "seminarOID"});
  roleassignment.belongsTo(seminar, { as: "seminarO", foreignKey: "seminarOID"});
  seminar.hasMany(roleassignment, { as: "roleassignments", foreignKey: "seminarOID"});
  chatmessage.belongsTo(user, { as: "sender_user", foreignKey: "sender"});
  user.hasMany(chatmessage, { as: "chatmessages", foreignKey: "sender"});
  chatmessage.belongsTo(user, { as: "receiver_user", foreignKey: "receiver"});
  user.hasMany(chatmessage, { as: "receiver_chatmessages", foreignKey: "receiver"});
  concept.belongsTo(user, { as: "userOIDSupervisor_user", foreignKey: "userOIDSupervisor"});
  user.hasMany(concept, { as: "concepts", foreignKey: "userOIDSupervisor"});
  concept.belongsTo(user, { as: "userOIDStudent_user", foreignKey: "userOIDStudent"});
  user.hasMany(concept, { as: "userOIDStudent_concepts", foreignKey: "userOIDStudent"});
  ltiuser.belongsTo(user, { as: "userO", foreignKey: "userOID"});
  user.hasMany(ltiuser, { as: "ltiusers", foreignKey: "userOID"});
  oidcuser.belongsTo(user, { as: "userO", foreignKey: "userOID"});
  user.hasMany(oidcuser, { as: "oidcusers", foreignKey: "userOID"});
  paper.belongsTo(user, { as: "authorO", foreignKey: "authorOID"});
  user.hasMany(paper, { as: "papers", foreignKey: "authorOID"});
  review.belongsTo(user, { as: "reviewerO", foreignKey: "reviewerOID"});
  user.hasMany(review, { as: "reviews", foreignKey: "reviewerOID"});
  roleassignment.belongsTo(user, { as: "userO", foreignKey: "userOID"});
  user.hasMany(roleassignment, { as: "roleassignments", foreignKey: "userOID"});

  return {
    attachment,
    chatmessage,
    concept,
    contexttoseminar,
    ltiuser,
    oidcuser,
    paper,
    review,
    roleassignment,
    roles,
    seminar,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
