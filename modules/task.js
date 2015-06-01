/**
 * New node file
 */
//var DataBase = new require('../utils/DataBase.js');
//var dbase = new DataBase();
var dbase = new require('../utils/DataBase.js');

var assert = require('assert');
var mainWorker = require('../worker/MainWorker.js');

var headHander = {}
var getHandler = {};
var postHandler = {};

//var db = dbase.getDb();

/*function getTask(req, res, next) {
	var sendData = {};
	mainWorker.sendMessage({"worker":"zkClient","action":"msg","data":{"Hello":"World"}});
	console.log("Task api");
	if(req.params.action){
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
				taskColl.findOne({'taskAction':req.params.action, 'taskStatus': 1},function(error, taskDoc){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					if(taskDoc){
						sendData = taskDoc;
					}else{
						sendData['info'] = "No data.";
						sendData["date"] = new Date();
					}
						console.log(sendData);
						devopsDb.close();
						res.send(sendData);
				});
			})
		});
		//sendData["action"] = req.params.action;
	}else{
		sendData["info"] = "Nothine to do.";
		sendData["date"] = new Date();
		res.send(sendData);
	}
}
getHandler["gettask/:action"] = getTask;*/

function getTask(req, res, next) {
	dbase.getTaskList(req.params.action, function(taskList){
		res.send(taskList);
	})
}
getHandler["get/:action"] = getTask;

function setTaskStatus(req, res,next){
	var sendData = {};
	if(req.params.taskId){
		dbase.updateTaskStatus( req.params.taskId, req.params.taskSt, function(result){
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
	}else{
		sendData['state'] = 1;
		sendData['info'] = "there is no taskId.";
		sendData["date"] = new Date();
		res.send(sendData);
	}
	/*if(req.params.taskId){
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
	}*/
}
getHandler["setstatus/:taskId/:taskSt"] = setTaskStatus;


function deployTask(req, res, next) {
	var db = dbase.getDb();
	var sendData = {};
	console.log("Set Task");
	console.log("apiId: " + req.session.apiId);
	console.log("idxk: " + req.query.idxk);
	console.log("deploy: " + req.query.deploy);
	if(req.session.apiId && req.query.idxk && req.query.deploy){
		//var sendData = {};
		var apiOid = dbase.ObjectID(req.session.apiId);
		//var taskParams = {};
//		var srcType = ""
//		var srcPath = "";
		//taskParams['apiVerNo'] = req.params.verNo;
		//sendData['_id'] = apiOid;
		//sendData['apiVer.no'] = req.params.verNo;
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
				//apiOid = dbase.ObjectID(req.session.apiId);
				/**
				 * db.api.findOne(
				 *     { "_id": ObjectId("553e097a6aa7e62704ca9fc2") },
				 *     { "_id":0, "apiLocation":1,
				 *         "apiVer":{$elemMatch: {"no":"0.1"}}
				 *     });
				 */
				apiColl.findOne( { "_id": apiOid, 'apiActivated':true },{ "_id":1, "apiLocation":1, "apiVer" : {$elemMatch: {"no":req.params.verNo}}}, function(error, apiDoc){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					/*taskParams['apServ'] = apiDoc.apiLocation;
					taskParams['srcType'] = apiDoc.apiVer[0].verCtrlType;
					taskParams['srcPath'] = apiDoc.apiVer[0].srcUrl;*/
					//console.log("srcType: "+ srcType);
					//console.log("srcPath: "+ srcPath);
					if(apiDoc){
						devopsDb.collection('apserver', function(error, apSerColl){
							if(error){
								console.log(error.stack);
								process.exit(0);
							}
							apSerColl.findOne({ "apSerName" : apiDoc.apiLocation},{"apSerIntIp":1,"apSerPath":1},function(error,apSerDoc){
								if(error){
									console.log(error.stack);
									process.exit(0);
								}
								if(apSerDoc){
									var taskObj = {};
									var taskParams = {};
									taskParams['apiId'] = apiDoc['_id'];
									taskParams['apiVerNo'] = req.params.verNo;
									taskParams['apiVerIdx'] = req.query.idxk;
									taskParams['apServName'] = apiDoc.apiLocation;
									taskParams['srcType'] = apiDoc.apiVer[0].verCtrlType;
									taskParams['srcPath'] = apiDoc.apiVer[0].srcUrl;
									taskParams['apServIp'] = apSerDoc.apSerIntIp;
									taskParams['destPath'] = apSerDoc.apSerPath;
									taskParams['deploy'] = req.query.deploy;
									taskObj['taskNo'] = new Date().getTime();
									taskObj['taskAction'] = 'deploy';
									taskObj['taskParams'] = taskParams;
									taskObj['taskStatus'] = 1;
									if (!taskObj['taskLog']){
										taskObj['taskLog'] = ["Preparing to deploy"];
									}else{
										taskObj['taskLog'].push("Preparing to deploy");
									}
									taskObj['taskDesc'] = "Deploy ";
									devopsDb.collection('task', function(error, taskColl){
										if(error){
											console.log(error.stack);
											process.exit(0);
										}
										taskColl.insert(taskObj, function(error, data){
											if(error){
												console.log(error.stack);
												process.exit(0);
											}
											if (data) {
												console.log('Successfully Insert');
								                sendData["state"] = 0;
											} else {
								                console.log('Failed to Insert');
								                sendData["state"] = 1;
								            }
											devopsDb.close();
											sendData["date"] = new Date();
											res.send(sendData);
										})
									});
									/*sendData['apServ'] = taskObj;
									sendData['level'] = req.query.level;
									console.log(apiDoc["apiVer"][0]);
									db.close();
									res.send(sendData);*/
								}
							});
						});
					}else {
						//var sendData = {};
						sendData["info"] = "Can not find actived API.";
						sendData["date"] = new Date();
						res.send(sendData);
					}
				});
			})
		});
	}else{
		sendData["info"] = "Nothine to do.";
		sendData["date"] = new Date();
		res.send(sendData);
	}
}
getHandler["deploy/:verNo"] = deployTask;

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;