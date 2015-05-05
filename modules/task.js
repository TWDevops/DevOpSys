/**
 * New node file
 */
var DataBase = new require('../utils/DataBase.js');
var dbase = new DataBase();

var headHander = {}
var getHandler = {};
var postHandler = {};

var db = dbase.getDb();

function getTask(req, res, next) {
	var sendData = {};
	console.log("Task api");
	if(req.params.action){
		db.open(function() {
			db.collection('task', function(err, taskColl){
				taskColl.findOne({'taskAction':req.params.action, 'taskStatus': 1},function(err, taskDoc){
					if(taskDoc){
						sendData = taskDoc;
					}else{
						sendData['info'] = "No data."
					}
						console.log(sendData);
						db.close();
						res.send(sendData);
				});
			})
		});
		//sendData["action"] = req.params.action;
	}else{
		sendData["info"] = "Nothine to do.";
		res.send(sendData);
	}
}
getHandler["gettask/:action"] = getTask;


function setTask(req, res,next){
	var sendData = {};
	if(req.params.taskId){
		var taskId = dbase.ObjectID(req.params.taskId);
		var nowTaskSt = 1;
		var nexTaskSt = 1;
		console.log("setTask action: " + req.params.action);
		if(req.params.action){
			if(req.params.action.toLowerCase() == 'start'){
				nowTaskSt = 1;
				nexTaskSt = 2;
			}else if(req.params.action.toLowerCase() == 'done') {
				nowTaskSt = 2;
				nexTaskSt = 0
			}
			console.log("setTask nowTaskSt: " + nowTaskSt);
			console.log("setTask nexTaskSt: " + nexTaskSt);
			console.log("setTask action: " + req.params.action);
			db.open(function() {
				db.collection('task', function(err, taskColl){
					taskColl.update({"_id":taskId, 'taskStatus': nowTaskSt},{'$set':{'taskStatus':nexTaskSt}},{"w":1},function(err, result){
						console.log("setTask result: " + result);
						if(JSON.parse(result)['ok'] == 1){
							sendData['state'] = 0;
							sendData['nModified'] = JSON.parse(result)['nModified'];
							sendData["info"] = "update success.";
						}else{
							sendData["state"] = 1;
							sendData["info"] = "nothing update.";
						}
						db.close();
						res.send(sendData);
					});
				});
			});
		}else{
			sendData['state'] = 1;
			sendData['info'] = "there is no action.";
			res.send(sendData);
		}
	}else{
		sendData['state'] = 1;
		sendData['info'] = "there is no taskId.";
		res.send(sendData);
	}
}
getHandler["setTask/:taskId/:action"] = setTask;


function deployTask(req, res, next) {
	var sendData = {};
	console.log("Set Task");
	console.log("apiId: " + req.session.apiId);
	console.log("idxk: " + req.query.idxk);
	console.log("deploy: " + req.query.deploy);
	if(req.session.apiId && req.query.idxk && req.query.deploy){
		var apiOid = dbase.ObjectID(req.session.apiId);
		//var taskParams = {};
//		var srcType = ""
//		var srcPath = "";
		//taskParams['apiVerNo'] = req.params.verNo;
		//sendData['_id'] = apiOid;
		//sendData['apiVer.no'] = req.params.verNo;
		db.open(function() {
			db.collection('api', function(err, apiColl){
				//apiOid = dbase.ObjectID(req.session.apiId);
				/**
				 * db.api.findOne(
				 *     { "_id": ObjectId("553e097a6aa7e62704ca9fc2") },
				 *     { "_id":0, "apiLocation":1,
				 *         "apiVer":{$elemMatch: {"no":"0.1"}}
				 *     });
				 */
				apiColl.findOne( { "_id": apiOid, 'apiActivated':true },{ "_id":1, "apiLocation":1, "apiVer" : {$elemMatch: {"no":req.params.verNo}}}, function(err, apiDoc){
					/*taskParams['apServ'] = apiDoc.apiLocation;
					taskParams['srcType'] = apiDoc.apiVer[0].verCtrlType;
					taskParams['srcPath'] = apiDoc.apiVer[0].srcUrl;*/
					//console.log("srcType: "+ srcType);
					//console.log("srcPath: "+ srcPath);
					if(apiDoc){
						db.collection('apserver', function(err, apSerColl){
							apSerColl.findOne({ "apSerName" : apiDoc.apiLocation},{"apSerIntIp":1,"apSerPath":1},function(err,apSerDoc){
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
									db.collection('task', function(err, taskColl){
										taskColl.insert(taskObj, function(err, data){
											if (data) {
												console.log('Successfully Insert');
								                sendData["state"] = 0;
											} else {
								                console.log('Failed to Insert');
								                sendData["state"] = 1;
								            }
											db.close();
											sendData["date"] = new Date();
											res.send(sendData);
										})
									});
									/*sendData['apServ'] = taskObj;
									sendData['level'] = req.query.level;
									console.log(apiDoc["apiVer"][0]);
									db.close();
									res.send(sendData);*/
								
							});
						});
					}else {
						sendData["info"] = "Can not find actived API.";
						res.send(sendData);
					}
				});
			})
		});
	}else{
		sendData["info"] = "Nothine to do.";
		res.send(sendData);
	}
}
getHandler["deploy/:verNo"] = deployTask;

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;