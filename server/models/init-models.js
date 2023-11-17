var DataTypes = require("sequelize").DataTypes;
var _concept = require("./concept");
var _oidcuser = require("./oidcuser");
var _paper = require("./paper");
var _person = require("./person");
var _registrationkeys = require("./registrationkeys");
var _reviewerassignment = require("./reviewerassignment");
var _rolleassignment = require("./rolleassignment");
var _rollen = require("./rollen");
var _seminar = require("./seminar");
var _status = require("./status");

function initModels(sequelize) {
  var concept = _concept(sequelize, DataTypes);
  var oidcuser = _oidcuser(sequelize, DataTypes);
  var paper = _paper(sequelize, DataTypes);
  var person = _person(sequelize, DataTypes);
  var registrationkeys = _registrationkeys(sequelize, DataTypes);
  var reviewerassignment = _reviewerassignment(sequelize, DataTypes);
  var rolleassignment = _rolleassignment(sequelize, DataTypes);
  var rollen = _rollen(sequelize, DataTypes);
  var seminar = _seminar(sequelize, DataTypes);
  var status = _status(sequelize, DataTypes);

  person.belongsToMany(person, { as: 'reviewerB_people', through: reviewerassignment, foreignKey: "reviewerA", otherKey: "reviewerB" });
  person.belongsToMany(person, { as: 'reviewerA_people', through: reviewerassignment, foreignKey: "reviewerB", otherKey: "reviewerA" });
  person.belongsToMany(seminar, { as: 'seminarOID_seminars', through: rolleassignment, foreignKey: "personOID", otherKey: "seminarOID" });
  seminar.belongsToMany(person, { as: 'personOID_people', through: rolleassignment, foreignKey: "seminarOID", otherKey: "personOID" });
  reviewerassignment.belongsTo(paper, { as: "paperO", foreignKey: "paperOID"});
  paper.hasMany(reviewerassignment, { as: "reviewerassignments", foreignKey: "paperOID"});
  concept.belongsTo(person, { as: "personOIDSupervisor_person", foreignKey: "personOIDSupervisor"});
  person.hasMany(concept, { as: "concepts", foreignKey: "personOIDSupervisor"});
  concept.belongsTo(person, { as: "personOIDStudent_person", foreignKey: "personOIDStudent"});
  person.hasMany(concept, { as: "personOIDStudent_concepts", foreignKey: "personOIDStudent"});
  oidcuser.belongsTo(person, { as: "personO", foreignKey: "personOID"});
  person.hasMany(oidcuser, { as: "oidcusers", foreignKey: "personOID"});
  paper.belongsTo(person, { as: "studentO", foreignKey: "studentOID"});
  person.hasMany(paper, { as: "papers", foreignKey: "studentOID"});
  reviewerassignment.belongsTo(person, { as: "reviewerA_person", foreignKey: "reviewerA"});
  person.hasMany(reviewerassignment, { as: "reviewerassignments", foreignKey: "reviewerA"});
  reviewerassignment.belongsTo(person, { as: "reviewerB_person", foreignKey: "reviewerB"});
  person.hasMany(reviewerassignment, { as: "reviewerB_reviewerassignments", foreignKey: "reviewerB"});
  rolleassignment.belongsTo(person, { as: "personO", foreignKey: "personOID"});
  person.hasMany(rolleassignment, { as: "rolleassignments", foreignKey: "personOID"});
  rolleassignment.belongsTo(rollen, { as: "roleO", foreignKey: "roleOID"});
  rollen.hasMany(rolleassignment, { as: "rolleassignments", foreignKey: "roleOID"});
  concept.belongsTo(seminar, { as: "seminarO", foreignKey: "seminarOID"});
  seminar.hasMany(concept, { as: "concepts", foreignKey: "seminarOID"});
  paper.belongsTo(seminar, { as: "seminarO", foreignKey: "seminarOID"});
  seminar.hasMany(paper, { as: "papers", foreignKey: "seminarOID"});
  rolleassignment.belongsTo(seminar, { as: "seminarO", foreignKey: "seminarOID"});
  seminar.hasMany(rolleassignment, { as: "rolleassignments", foreignKey: "seminarOID"});
  concept.belongsTo(status, { as: "statusO", foreignKey: "statusOID"});
  status.hasMany(concept, { as: "concepts", foreignKey: "statusOID"});

  return {
    concept,
    oidcuser,
    paper,
    person,
    registrationkeys,
    reviewerassignment,
    rolleassignment,
    rollen,
    seminar,
    status,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
