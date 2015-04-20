/**
 * New node file
 */
var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectID;
var mongodbServer = null;
var db=null;

function DataBase(){
	console.log("DataBase Host: " + config.get("DB_HOST"));
	console.log("DataBase Port: " + config.get("DB_PORT"));
	console.log("DataBase DBName: " + config.get("DB_NAME"));
	mongodbServer = new mongodb.Server(config.get("DB_HOST"),
			config.get("DB_PORT"),
			{ auto_reconnect: true, poolSize: 10 });
	db = new mongodb.Db(config.get("DB_NAME"), mongodbServer);
}

DataBase.prototype.getDb = function(){
	return db;
}

DataBase.prototype.ObjectID = function(o_id){
	var oid = null;
	oid =  new ObjectId(o_id);
	return oid;
}

module.exports = DataBase;