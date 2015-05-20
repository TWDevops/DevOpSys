/**
 * New node file
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });
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

DataBase.prototype.getApiAllow = function(callback){
	var allowList = {};
	db.open(function() {
		db.collection('api', function(err, apiColl){
			var cursor = apiColl.find({},{apiAllow:true});
			cursor.each(function(err, doc){
				if(doc != null){
					console.log(doc['_id'].toString());
					allowList[doc['_id'].toString()]= doc['apiAllow'];
				} else{
					db.close();
					console.log(allowList);
					callback(allowList);
				}
			});
		});
	});
}

module.exports = DataBase;