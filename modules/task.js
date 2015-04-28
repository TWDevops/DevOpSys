/**
 * New node file
 */
var DataBase = new require('../utils/DataBase.js');
var autoIncrement = require("mongodb-autoincrement");
var dbase = new DataBase();

var headHander = {}
var getHandler = {};
var postHandler = {};

var db = dbase.getDb();

function getTask(req, res, next) {
	var sendData = {};
	console.log("Task api");
	if(req.params.action == 'deploy'){
		sendData["action"] = req.params.action;
	}else{
		sendData["info"] = "Nothine to do."
	}
	res.send(sendData);
}
getHandler["gettask/:action"] = getTask;

function setDeploy(req, res, next) {
	var sendData = {};
	console.log("Set Task");
	if(req.session.apiId){
		var apiOid = dbase.ObjectID(req.session.apiId);
		var taskObj = {};
//		var srcType = ""
//		var srcPath = "";
		taskObj['apiVerNo'] = req.params.verNo;
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
				apiColl.findOne( { "_id": apiOid },{ "_id":0, "apiLocation":1, "apiVer" : {$elemMatch: {"no":taskObj['apiVerNo']}}}, function(err, apiDoc){
					taskObj['apServ'] = apiDoc.apiLocation;
					taskObj['srcType'] = apiDoc.apiVer[0].verCtrlType;
					taskObj['srcPath'] = apiDoc.apiVer[0].srcUrl;
					//console.log("srcType: "+ srcType);
					//console.log("srcPath: "+ srcPath);
					db.collection('apserver', function(err, apSerColl){
						apSerColl.findOne({ "apSerName" : taskObj['apServ']},{"apSerIntIp":1,"apSerPath":1},function(err,apSerDoc){
							sendData['api'] = apiDoc;
							sendData['apServ'] = apSerDoc;
							sendData['level'] = req.query.level;
							console.log(apiDoc["apiVer"][0]);
							res.send(sendData);
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
getHandler["setdeploy/:verNo"] = setDeploy;

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;