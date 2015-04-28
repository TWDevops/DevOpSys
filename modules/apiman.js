/**
 * API Manager Module
 */
var DataBase = new require('../utils/DataBase.js');
var dbase = new DataBase();

/*
 *  Method List(head, get, post)
 */
var headHander = {}
var getHandler = {};
var postHandler = {};

/*console.log(config.get("DB_HOST"));
console.log(config.get("DB_PORT"));
console.log(config.get("DB_NAME"));
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server(config.get("DB_HOST"),
		config.get("DB_PORT"),
		{ auto_reconnect: true, poolSize: 10 });
var db = new mongodb.Db(config.get("DB_NAME"), mongodbServer);
*/
var db = dbase.getDb();

function list(req, res, next) {
	var sendData = {};
	console.log("use api");
	db.open(function() {
		db.collection('api', function(err, collection){
			var cursor = collection.find({});
			cursor.each(function(err, doc){
				if(doc != null){
					console.log(doc);
					sendData[doc.apiName]= doc;
				} else{
					db.close();
					console.log(sendData);
					res.send(sendData);
				}
			});
		})
	});
}
getHandler["list"]=list;

function listView(req, res, next) {
	if(req.session.apiId){
		console.log("session.apiId: " + req.session.apiId);
		req.session.apiId=null;
	}
	console.log("session.apiId: " + req.session.apiId);
	var sendData = {};
	//console.log("use api");
	db.open(function() {
		db.collection('api', function(err, collection){
			var cursor = collection.find({});
			cursor.each(function(err, doc){
				if(doc != null){
					console.log(doc['_id'].toString());
					sendData[doc['_id'].toString()]= doc;
				} else{
					db.close();
					console.log(sendData);
					res.render('apilist',{
						 pagename: "API List",
						 apiList: sendData
					});
				}
			});
		})
	});
}
getHandler["listview"]=listView;


function edit(req, res, next){
	var sendData={};
	var apiOid = null;
	if (req.method == 'POST') {
		console.log(req.session.apiId);
		db.open(function() {
			db.collection('api', function(err, collection){
				apiOid = dbase.ObjectID(req.session.apiId);
				console.log(apiOid);
				collection.findOne({"_id": apiOid}, function(err, doc){
					if(doc != null){
						console.log(doc);
						//sendData = doc;
						doc["apiName"]=req.body.apiName;
						doc["apiOwner"]=req.body.apiOwner;
						doc["apiCallee"]=req.body.apiCallee;
						doc["apiUrl"]=req.body.apiUrl;
						doc["apiDocUrl"]=req.body.apiDocUrl;
						doc["apiEndPoint"]=req.body.apiEndPoint;
						doc["apiProto"]=req.body.apiProto;
						doc["apiLocation"]=req.body.apiLocation;
						doc["dataSource"]=req.body.dataSource;
						doc["apiDesc"]=req.body.apiDesc;
						/*if (typeof req.body.apiActivated !==  'undefined' && req.body.apiActivated == "true"){
							doc["apiActivated"] = true;
						}else{
							doc["apiActivated"] = false;
						}*/
						doc['apiActivated'] = req.body.apiActivated.toLowerCase() === 'true';
						doc["apiType"]=req.body.apiType;
						doc["apiVer"]=[];
						if (Array.isArray(req.body.verNo)){
							for(var verIdx in req.body.verNo){
								if(req.body.verNo[verIdx]!= ""){
									doc["apiVer"][verIdx]={
										"no":req.body.verNo[verIdx],
										"apiUDate":(req.body.verApiUDate[verIdx]||new Date()),
										"verCtrlType":req.body.verCtrlType[verIdx],
										"srcUrl":req.body.verSrcUrl[verIdx],
										"deploy":(parseInt(req.body["verDeploy" + req.body.verNo[verIdx]]||0))
									};
								}
							}
						}else{
							doc["apiVer"][0]={
									"no":req.body.verNo,
									"apiUDate":new Date(),
									"verCtrlType":req.body.verCtrlType,
									"srcUrl":req.body.verSrcUrl,
									"deploy":0
							};
						}
						//res.send(doc);
						collection.update({"_id": apiOid},{'$set':doc},{"w":1},function(err, result){
							console.log("result: " + result);
							console.log("ok: " + JSON.parse(result)['ok']);
							if(JSON.parse(result)['ok'] == 1){
								sendData["state"] = 0;
							}else{
								sendData["state"] = 1;
							}
							//sendData["UPDATE"] = doc;
							sendData["date"] = new Date();
							sendData["result"] = result;
							res.send(sendData);
							db.close();
						});
					//}else{
					}else{
						db.close();
						sendData["state"] = 1;
						sendData["error"] = "Data not found."
						sendData["date"] = new Date();
						res.send({"Receive" : sendData});
					}
				});
			});
		});
	}else if(req.query.apiId){
		db.open(function() {
			console.log(req.session.apiId);
			req.session.apiId = req.query.apiId;
			console.log(req.session.apiId);
			db.collection('api', function(err, collection){
				apiOid = dbase.ObjectID(req.query.apiId);
				//var cursor = collection.find({"_id": apiOid});
				
				//cursor.each(function(err, doc){
				collection.findOne({"_id": apiOid}, function(err, doc){
					if(doc != null){
						console.log(doc);
						//sendData = doc;
					//}else{
						res.render('edit', {
							pagename:"API Editor",
							apiKey:req.session.apiId,
							api:doc,
							apiIdHex:req.query.apiId
						});
					}
				});
			});
		});
	}else{
		res.send("nothing!!");
	}
}
getHandler["edit"] = edit;
postHandler["edit"] = edit;


function register(req, res, next){
	//console.log("use api");
	var sendData = {};
	if(req.session.apiId){
		req.session.apiId = null;
	}
	console.log("req.session.apiID: " + req.session.apiId);
	if (req.method == 'POST') {
		//sendData = req.body;
		var insertObj = {};
		insertObj['apiName'] = req.body.apiName;
		insertObj['apiOwner'] = req.body.apiOwner;
		insertObj['apiDesc'] = req.body.apiDesc;
		insertObj['apiVer'] = null;
		insertObj['apiCallee'] = req.body.apiCallee;
		insertObj['apiUrl'] = req.body.apiUrl;
		insertObj['apiDocUrl'] = req.body.apiDocUrl;
		insertObj['apiEndPoint'] = req.body.apiEndPoint;
		insertObj['apiProto'] = req.body.apiProto;
		insertObj['apiCDate'] = new Date();
		insertObj['apiLocation'] = req.body.apiLocation;
		insertObj['dataSource'] = req.body.dataSource;
		/*if (typeof req.body.apiActivated !==  'undefined' && req.body.apiActivated == "true"){
			insertObj['apiActivated'] = true;
		}else{
			insertObj['apiActivated'] = false;
		}*/
		insertObj['apiActivated'] = req.body.apiActivated.toLowerCase() === 'true';
		insertObj["apiType"]=req.body.apiType;
		//res.send(insertObj);
		db.open(function() {
			db.collection('api', function(err, collection){
				var cursor = collection.insert(insertObj, function(err,data){
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
				});
			});
		});
	}else{
		res.render('register', {
			pagename:"API Register"
		});
		sendData["state"] = 1;
		sendData["date"] = new Date();
	}
}
getHandler["register"] = register;
postHandler["register"] = register;



exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;
//exports.list = list;
//module.exports = router;