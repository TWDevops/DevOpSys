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
			{ auto_reconnect: true, poolSize: 20 });
}

DataBase.prototype.getDb = function(dbName){
	return new mongodb.Db((dbName||config.get("DB_NAME")), mongodbServer);
}

DataBase.prototype.ObjectID = function(o_id){
	var oid = null;
	var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
	if(checkForHexRegExp.test(o_id)){
		oid =  new ObjectId(o_id);
	}else {
		console.log("task: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
		oid = new ObjectId("000000000000000000000000");
	}
	return oid;
}

DataBase.prototype.getBuildDataByDeployId = function(deployId, callback){
    var db = DataBase.prototype.getDb();
	db.open(function(error, apiDb) {
		if(error){
			console.log(error.stack);
			process.exit(0);
		}
		apiDb.collection('builds', function(error, apiColl){
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			apiColl.findOne({"gitCommitId": deployId}, function(error, buildDoc){
			    if(error){
				console.log(error.stack);
				process.exit(0);
			    }
			    callback(buildDoc);
			    db.close();
			});
		});
	});
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
					//console.log(doc['apiName']);
					//console.log(doc['_id'].toString());
					allowList[doc['apiName'].toString()]= doc;
				} else{
					db.close();
					//console.log(allowList);
					callback(allowList);
				}
			});
		});
	});
}

DataBase.prototype.getTask = function(action,callback){
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
					db.close();
					console.log(taskList);
					callback(taskList);
			});
		});
	});
}

DataBase.prototype.getDeployList = function(findOpt,callback){
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
			var cursor = taskColl.find(findOpt.query).limit(findOpt.limit|0);
			var taskList = {};
			cursor.each(function(error,doc){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				if(doc != null){
					taskList[doc._id] = doc;
				}else{
					db.close();
					console.log(taskList);
					callback(taskList);
				}
			});
		});
	});
}

//DataBase.prototype.setTask = function(setOpt, callback){
    //var db = DataBase.prototype.getDb();
//    callback("test");
//}
DataBase.prototype.setTask = function(setOpt, callback){
	var db = DataBase.prototype.getDb();
	var retData = {};
	console.log("db:1");
	DataBase.prototype.getDataByApserName(setOpt.apserName, function(apSerDoc){
	    console.log("db:2");
	    if(Object.keys(apSerDoc).length > 0){
			//DataBase.prototype.getApiGitRepo(setOpt.apiId, function(apiGitData){
			    	console.log("db:3");
			    	//if(Object.keys(apiGitData).length > 0){
					var taskObj = {}
					taskObj['taskNo'] = setOpt.taskNo;
					taskObj['taskAction'] = 'deploy';
					taskObj['taskParams'] = {};
					taskObj.taskParams.apServId = apSerDoc._id;
					taskObj.taskParams.apServName = apSerDoc.apSerName;
					taskObj.taskParams.apServIp = apSerDoc.apSerIntIp;
					taskObj.taskParams.fileUrl = setOpt.fileUrl;
					switch(apSerDoc.apSerLevel){
						case 0:
							taskObj.taskParams.branch = 'master';
							break;
						case 1:
							taskObj.taskParams.branch = 'ol';
							break;
						default:
							taskObj.taskParams.branch = 'lab';
					}
					taskObj.taskParams.deploy = apSerDoc.apSerLevel;
					taskObj.taskStatus = 1;
					taskObj.taskLog = ["Preparing to deploy"];
					taskObj.taskDesc = "Deploy";
					db.open(function(error,devopsDb){
						if(error){
							console.log(error.stack);
							process.exit(0);
						}
						devopsDb.collection('task', function(error, taskColl){
							if(error){
								console.log(error.stack);
								process.exit(0);
							}
							taskColl.insert(taskObj, function(error,result){
								if(error){
									console.log(error.stack);
									process.exit(0);
								}
								if(result){
									retData['status'] = 0;
									retData['info'] = 'Task insert success.';
								}else{
									retData['status'] = 1;
									retData['info'] = 'Task insert fail.';
								}
								callback(retData);
								db.close();
							});
						});
					});
				//}else{
				//	callback({status:1, error: "No Git Repository."});
				//}
			//});				
	    }else{
		callback({status:1, error: "No Ap Server."});
	    }
	});
}

DataBase.prototype.getDataByApserName = function(serName,callback){
	var db = DataBase.prototype.getDb();
	db.open(function(error, devopsDb) {
		if(error){
			console.log(error.stack);
			process.exit(0);
		}
		devopsDb.collection('apserver', function(error, apSerColl){
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			apSerColl.findOne({"apSerName" : serName},{"apSerName":1,"apSerIntIp":1,"apSerLevel":1},function(error, apSerDoc){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				if(apSerDoc != null){
					console.log(apSerDoc);
					callback(apSerDoc);
				}else{
					callback({});
				}
				db.close();
			});
		});
	});
}

DataBase.prototype.getApiGitRepo = function(apiId, callback){
	var db = DataBase.prototype.getDb();
	db.open(function(error, devopsDb) {
		if(error){
			console.log(error.stack);
			process.exit(0);
		}
		devopsDb.collection('api', function(error, apiColl){
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			apiColl.findOne({'_id': DataBase.prototype.ObjectID(apiId)},{"apiGitInfo":1},function(error, apiDoc){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				if(apiDoc != null){
					console.log(apiDoc);
					callback(apiDoc);
				}else{
					callback({});
				}
				db.close();
			});
		});
	});
}

/*
 * Update task status
 * 0:done,
 * 1:prepare,
 * 2:deploy,
 * 9:error
 */
DataBase.prototype.updateTaskStatus = function(taskId, taskSt, callback){
	var resData = {};
	var db = DataBase.prototype.getDb();
	//if(taskId){
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
					//if(result){
						console.log("updateTaskStatus result: " + result);
						db.close();
						callback(result);
					/*}else {
						resData["state"] = 1;
						resData["info"] = "update error.";
						resData["date"] = new Date();
						devopsDb.close();
						callback(resData);
					}*/
				});
			});
		});
	/*}else{
		resData['state'] = 1;
		resData['info'] = "there is no taskId.";
		resData["date"] = new Date();
		callback(resData);
	}*/
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