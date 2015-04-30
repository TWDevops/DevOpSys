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
				taskColl.findOne({'taskAction':req.params.action},function(err, taskDoc){
					if(taskDoc){
						sendData = taskDoc;
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

function deployTask(req, res, next) {
	var sendData = {};
	console.log("Set Task");
	if(req.session.apiId){
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
				apiColl.findOne( { "_id": apiOid },{ "_id":0, "apiLocation":1, "apiVer" : {$elemMatch: {"no":req.params.verNo}}}, function(err, apiDoc){
					/*taskParams['apServ'] = apiDoc.apiLocation;
					taskParams['srcType'] = apiDoc.apiVer[0].verCtrlType;
					taskParams['srcPath'] = apiDoc.apiVer[0].srcUrl;*/
					//console.log("srcType: "+ srcType);
					//console.log("srcPath: "+ srcPath);
					db.collection('apserver', function(err, apSerColl){
						apSerColl.findOne({ "apSerName" : apiDoc.apiLocation},{"apSerIntIp":1,"apSerPath":1},function(err,apSerDoc){
								var taskObj = {};
								var taskParams = {};
								taskParams['apServName'] = apiDoc.apiLocation;
								taskParams['srcType'] = apiDoc.apiVer[0].verCtrlType;
								taskParams['srcPath'] = apiDoc.apiVer[0].srcUrl;
								taskParams['apServIp'] = apSerDoc.apSerIntIp;
								taskParams['destPath'] = apSerDoc.apSerPath;
								taskObj['taskNo'] = new Date().getTime();
								taskObj['taskAction'] = 'deploy';
								taskObj['taskParams'] = taskParams;
								taskObj['taskStatus'] = 3;
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