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
			var cursor = apiColl.find({},{apiActivated:true,apiAllow:true,apiDesc:true});
			cursor.each(function(error, doc){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				if(doc != null){
					console.log(doc['_id'].toString());
					allowList[doc['_id'].toString()]= doc;
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

//need to modify
DataBase.prototype.updateTaskStatus(taskId, callback){
	//var sendData = {};
	if(req.params.taskId){
		var taskId = dbase.ObjectID(req.params.taskId);
		var nowTaskSt = 1;
		var nexTaskSt = 1;
		console.log("updateTaskStatus action: " + req.params.action);
		if(req.params.action){
			if(req.params.action.toLowerCase() == 'start'){
				nowTaskSt = 1;
				nexTaskSt = 2;
			}else if(req.params.action.toLowerCase() == 'done') {
				nowTaskSt = 2;
				nexTaskSt = 0
			}
			console.log("updateTaskStatus nowTaskSt: " + nowTaskSt);
			console.log("updateTaskStatus nexTaskSt: " + nexTaskSt);
			console.log("updateTaskStatus action: " + req.params.action);
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
					taskColl.update({"_id":taskId, 'taskStatus': nowTaskSt},{'$set':{'taskStatus':nexTaskSt}},{"w":1},function(error, result){
						if(error){
							console.log(error.stack);
							process.exit(0);
						}
						if(result){
							console.log("updateTaskStatus result: " + result);
							if(JSON.parse(result)['ok'] == 1){
								sendData['state'] = 0;
								sendData['nModified'] = JSON.parse(result)['nModified'];
								if(sendData['nModified'] >0){
									sendData["info"] = "update success.";
								}else{
									sendData["info"] = "nothing update."
								}
							}else{
								sendData["state"] = 1;
								sendData["info"] = "update error.";
							}
							sendData["date"] = new Date();
							devopsDb.close();
							res.send(sendData);
						}else {
							sendData["state"] = 1;
							sendData["info"] = "update error.";
							sendData["date"] = new Date();
							devopsDb.close();
							res.send(sendData);
						}
					});
				});
			});
		}else{
			sendData['state'] = 1;
			sendData['info'] = "there is no action.";
			sendData["date"] = new Date();
			res.send(sendData);
		}
	}else{
		sendData['state'] = 1;
		sendData['info'] = "there is no taskId.";
		sendData["date"] = new Date();
		res.send(sendData);
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