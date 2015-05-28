/**
 * New node file
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });
var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectID;
var mongodbServer = null;
//var db=null;
//var assert = require('assert');

var DataBase = function DataBase(){
	console.log("DataBase Host: " + config.get("DB_HOST"));
	console.log("DataBase Port: " + config.get("DB_PORT"));
	console.log("DataBase DBName: " + config.get("DB_NAME"));
	mongodbServer = new mongodb.Server(config.get("DB_HOST"),
			config.get("DB_PORT"),
			{ auto_reconnect: true, poolSize: 10 });
}

DataBase.prototype.getDb = function(dbName){
	return new mongodb.Db((dbName||config.get("DB_NAME")), mongodbServer);
}

DataBase.prototype.ObjectID = function(o_id){
	var oid = null;
	oid =  new ObjectId(o_id);
	return oid;
}

DataBase.prototype.getApiAllow = function(callback){
	var allowList = {};
	var db = DataBase.prototype.getDb();
	db.open(function(error, apiDb) {
		if(error){
			console.log(error.stack);
			process.exit(0);
		}
		apiDb.collection('api', function(error, apiColl){
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			var cursor = apiColl.find({},{apiActivated:true,apiAllow:true,apiName:true});
			cursor.each(function(error, doc){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				if(doc != null){
					console.log(doc['apiName']);
					console.log(doc['_id'].toString());
					allowList[doc['apiName'].toString()]= doc;
				} else{
					apiDb.close();
					console.log(allowList);
					callback(allowList);
				}
			});
		});
	});
}

DataBase.prototype.getTaskList = function(action,callback){
	var taskList = {};
	var db = DataBase.prototype.getDb();
	db.open(function(error, devopsDb) {
		if(error){
			console.log(error.stack);
			process.exit(0);
		}
		devopsDb.collection('task', function(error, taskColl){
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			taskColl.findOne({'taskAction':action, 'taskStatus': 1},function(error, taskDoc){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				if(taskDoc){
					taskList = taskDoc;
				}
					devopsDb.close();
					console.log(taskList);
					callback(taskList);
			});
		})
	});
}

/*
 * Update task status
 * 0:done,
 * 1:prepare,
 * 2:disable server,
 * 3:deploy,
 * 4:restart daemon,
 * 5:verify service,
 * 6:enable server,
 * 9:error
 */
DataBase.prototype.updateTaskStatus = function(taskId, taskSt, callback){
	var resData = {};
	var db = DataBase.prototype.getDb();
	if(taskId){
		var taskId = DataBase.prototype.ObjectID(taskId);
		//var nowTaskSt = 1;
		var nexTaskSt = 1;
		console.log("updateTaskStatus action: " + taskSt);
		switch (taskSt) {
			case 'start':
				//nowTaskSt = 1;
				nexTaskSt = 2;
				break;
			case 'done':
				//nowTaskSt = 2;
				nexTaskSt = 0;
				break;
			case 'error':
				nexTaskSt = 9;
				break;
			default:
				resData['state'] = 1;
				resData['info'] = "there is no status.";
				resData["date"] = new Date();
				callback(resData);
				return;
		}
		//console.log("updateTaskStatus nowTaskSt: " + nowTaskSt);
		console.log("updateTaskStatus nexTaskSt: " + nexTaskSt);
		console.log("updateTaskStatus action: " + taskSt);
		db.open(function(error, devopsDb) {
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			devopsDb.collection('task', function(error, taskColl){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				taskColl.update({"_id":taskId},{'$set':{'taskStatus':nexTaskSt}},{"w":1},function(error, result){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					if(result){
						console.log("updateTaskStatus result: " + result);
						devopsDb.close();
						callback(result);
					}else {
						resData["state"] = 1;
						resData["info"] = "update error.";
						resData["date"] = new Date();
						devopsDb.close();
						callback(resData);
					}
				});
			});
		});
	}else{
		resData['state'] = 1;
		resData['info'] = "there is no taskId.";
		resData["date"] = new Date();
		callback(resData);
	}
}

DataBase.instance = null;

DataBase.getInstance = function(){
	if(this.instance === null ){
		this.instance = new DataBase();
	}
    return this.instance;
}

//module.exports = DataBase;
module.exports = DataBase.getInstance();