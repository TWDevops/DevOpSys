/**
 * New node file
 */
//var DataBase = new require('../utils/DataBase.js');
//var dbase = new DataBase();
var config = require("nconf");
config.env().file({ "file":"config.json" });
var dbase = new require('../utils/DataBase.js');

var assert = require('assert');
var mainWorker = require('../worker/MainWorker.js');

var RunDeckApi = require('../utils/RunDeckApi.js');
var rundeck = new RunDeckApi();

var headHander = {};
var getHandler = {};
var postHandler = {};

/*function triggerRundeck(){
	var xml2js = require('xml2js');
	var http = require('http');
	var options = {
			host: config.get('RUNDECK_HOST'),
			path: config.get('RUNDECK_CALL_DEPLOY'),
			port: config.get('RUNDECK_PORT'),
			headers:{'X-Rundeck-Auth-Token':config.get('RUNDECK_TOKEN')}
	};
	var callback = function(response) {
		var xmlStr = '';
		response.on('data', function (chunk) {
		    xmlStr += chunk;
		});

		response.on('end', function () {
			var parser = new xml2js.Parser();
			parser.parseString(xmlStr, function (err, result) {
		    	//console.dir(result);
		    	console.dir(result['executions']['execution'][0]['$']['status']);
		        console.log(xmlStr);
		    });
			//console.log(str);
		});
	};
	http.request(options, callback).end();
}*/

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
	dbase.getTask(req.params.action,function(taskList){
		res.send(taskList);
	});
}
getHandler["get/:action"] = getTask;

function setTaskStatus(req, res,next){
	var sendData = {};
	if(req.params.taskId){
		dbase.updateTaskStatus( req.params.taskId, req.params.taskSt, function(result){
			if(result){
				console.log("updateTaskStatus result: " + result);
				if(JSON.parse(result)['ok'] === 1){
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
				res.send(sendData);
			}else {
				sendData["state"] = 1;
				sendData["info"] = "update error.";
				sendData["date"] = new Date();
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

function deployApi(req, res, next){
	var findOpt = {};
	var query = {};
	if (req.method == 'GET') {
		if(req.params.id){
			switch (req.params.id) {
			case 'done':
				query['taskAction'] = 'deploy';
				query['taskStatus'] = 0;
				findOpt['query'] = query;
				findOpt['limit'] = 0
				break;
				
			case 'log':
				query['taskAction'] = 'deploy';
				query['$or'] = [{taskStatus:0},{taskStatus:9}];
				findOpt['query'] = query;
				findOpt['limit'] = 0
				break;
				
			case 'error':
				query['taskAction'] = 'deploy';
				query['taskStatus'] = 9;
				findOpt['query'] = query;
				findOpt['limit'] = 0;
				break;
				
			case 'list':
				query['taskAction'] = 'deploy';
				query['taskStatus'] = 1;
				findOpt['query'] = query;
				findOpt['limit'] = 0;
				break;
				
			default:
				var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
				if(checkForHexRegExp.test(req.params.id)){
					query['_id'] = dbase.ObjectID(req.params.id);
					findOpt['query'] = query;
					findOpt['limit'] = 0;
				}else{
					console.log("task: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
					res.send({});
					return;
				}
				break;
			}
		} else {
			query['taskAction'] = 'deploy';
			query['taskStatus'] = 1;
			findOpt['query'] = query;
			findOpt['limit'] = 1;
		}
		dbase.getDeployList(findOpt, function(taskList){
			res.send(taskList);
		});
	}/* else if (req.method == 'POST') {
		if (req.body.apId){
			var taskObj = {}
			taskObj['taskNo'] = new Date().getTime();
			taskObj['taskAction'] = 'deploy';
			taskObj['params'] = req.body.params;
		} else {
			res.send({});
		}
	}*/
}
getHandler['api/deploy'] = deployApi;
getHandler['api/deploy/:id'] = deployApi;
//postHandler['api/deploy'] = deploy;

function deploy(req, res, next){
	if(req.session.apiId){
		var setOpt = {};
		setOpt['taskNo'] = req.params.deployId;
		setOpt['apserName'] = req.params.apserName;
		setOpt['apiId'] = req.session.apiId;
		setOpt['fullAuto'] = false;
		if(req.params.fullAuto){
		    setOpt['fullAuto'] = req.params.fullAuto;
		}
		dbase.getBuildDataByDeployId(req.params.deployId, function(buildData){
		    setOpt['apiName'] = buildData.apiName;
		    setOpt['fileUrl'] = config.get('DEPLOY_FILE_SERVER') + setOpt['apiName'] + "/" + setOpt['taskNo'] +"/" + buildData.fileList[0];
		    console.log("task:1");
		    dbase.setTask(setOpt, function(result) {
		    	//triggerRundeck();
			if(result.status === 0){
        		    	rundeck.deployTrigger((req.params.isFull === "true"), setOpt['apserName'], setOpt['taskNo'], setOpt['fileUrl'], function(rkresult){
        		    	    res.send(rkresult);
        		    	});
			}else{
			    res.send(result);
			}
		    });
		});
	}else{
		res.send("nothing!!");
	}
}
getHandler['deploy/:apserName/:deployId/:isFull'] = deploy;

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;