/**
 * API Manager Module
 */
//var DataBase = new require('../utils/DataBase.js');
//var dbase = new DataBase();
var dbase = new require('../utils/DataBase.js');
var GitlabApi = require('../utils/GitlabApi.js');
var gitlab = new GitlabApi();
//var db = dbase.getDb();
//var assert = require('assert');

/*
 *  Method List(head, get, post)
 */
var headHander = {}
var getHandler = {};
var postHandler = {};


function list(req, res, next) {
	var db = dbase.getDb();
	var sendData = {};
	console.log("use api");
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
			var cursor = apiColl.find({});
			cursor.each(function(error, doc){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				if(doc != null){
					console.log(doc);
					sendData[doc.apiName]= doc;
				} else{
					devopsDb.close();
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
	var db = dbase.getDb();
	console.log("session.apiId: " + req.session.apiId);
	var sendData = {};
	//console.log("use api");
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
			var cursor = apiColl.find({});
			cursor.each(function(error, doc){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				if(doc != null){
					console.log(doc['_id'].toString());
					sendData[doc['_id'].toString()]= doc;
				} else{
					devopsDb.close();
					console.log(sendData);
					res.render('apilist',{
						 title: "API List",
						 apiList: sendData
					});
				}
			});
		})
	});
}
getHandler["listview"]=listView;


function edit(req, res, next){
	var db = dbase.getDb();
	var sendData={};
	var apiOid = null;
	if (req.method == 'POST') {
		//var sendData={};
		console.log(req.session.apiId);
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
				apiOid = dbase.ObjectID(req.session.apiId);
				console.log(apiOid);
				apiColl.findOne({"_id": apiOid}, function(error, doc){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					if(doc != null){
						console.log(doc);
						//sendData = doc;
						doc["apiName"]=req.body.apiName;
						doc["apiOwner"]=req.body.apiOwner;
						doc["apiAllow"]=req.body.apiAllow.split(",");
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
										"apiUDate":(new Date(req.body.verApiUDate[verIdx])||new Date()),
										"verCtrlType":req.body.verCtrlType[verIdx],
										"srcUrl":req.body.verSrcUrl[verIdx],
										"fileList":req.body.verFileList[verIdx].split(","),
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
						apiColl.update({"_id": apiOid},{'$set':doc},{"w":1},function(error, result){
							if(error){
								console.log(error.stack);
								process.exit(0);
							}
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
							devopsDb.close();
						});
					//}else{
					}else{
						devopsDb.close();
						sendData["state"] = 1;
						sendData["error"] = "Data not found."
						sendData["date"] = new Date();
						res.send({"Receive" : sendData});
					}
				});
			});
		});
	}else if(req.query.apiId){
		//var sendData={};
		db.open(function(error, devopsDb) {
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			console.log(req.session.apiId);
			req.session.apiId = req.query.apiId;
			console.log(req.session.apiId);
			devopsDb.collection('api', function(error, apiColl){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				apiOid = dbase.ObjectID(req.query.apiId);
				//var cursor = collection.find({"_id": apiOid});
				
				//cursor.each(function(err, doc){
				apiColl.findOne({"_id": apiOid}, function(error, doc){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					if(doc != null){
						console.log(doc);
						devopsDb.close();
						//sendData = doc;
					//}else{
						gitlab.getGroupList(function(groupList) {
							res.render('edit', {
								title:"API Editor",
								apiKey:req.session.apiId,
								api:doc,
								apiIdHex:req.query.apiId,
								owners: groupList
							});
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

function setCallingApi(req, res, next){
	var db = dbase.getDb();
	var sendData = {};
	if(req.session.apiId){
		if (req.method == 'POST') {
			//var sendData={};
			console.log("method: POST");
			var oids = [];
			console.log(typeof req.body['callApiId']);
			if(Array.isArray(req.body.callApiId)){
				req.body.callApiId.forEach(function(apiKey){
					console.log("1: " + apiKey);
					oids.push(dbase.ObjectID(apiKey));
				});
			}else{
				oids.push(dbase.ObjectID(req.body.callApiId));
			}
			oids.forEach(function(apiOid){
				console.log(apiOid);
			});
			
			db.open(function(error, devopsDb){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				devopsDb.collection('api',function(error,apiColl){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					apiColl.update({"apiAllow":req.session.apiId},{$pull:{"apiAllow":req.session.apiId}},{multi:true},function(error,result){
						if(error){
							console.log(error.stack);
							process.exit(0);
						}
						sendData['1']=result;
						if(req.body.callApiId){
							apiColl.update({
								"_id":{$in:oids},
								apiAllow:{$ne:req.session.apiId}
							},{	
								$push:{"apiAllow":req.session.apiId}},{multi:true},function(error,result){
								sendData['2']=result;
								devopsDb.close();
								console.log(sendData);
								res.send(sendData);
							});
						}else{
							devopsDb.close();
							sendData['2']="no api to call";
							console.log(sendData);
							res.send(sendData);
						}
					});
				});
			});
		}else{
			//var sendData={};
			db.open(function(error, devopsDb){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				devopsDb.collection('api', function(error,apiColl){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					var cursor = apiColl.find({'_id':{$ne: dbase.ObjectID(req.session.apiId)}},{'apiName':true, 'apiAllow':true});
					cursor.each(function(error, doc){
						if(error){
							console.log(error.stack);
							process.exit(0);
						}
						if(doc != null){
							console.log(doc['_id'].toString());
							sendData[doc['_id'].toString()]= doc;
						} else{
							devopsDb.close();
							console.log(sendData);
							res.render('selectapi',{
								 title: "API select",
								 apiKey:req.session.apiId,
								 apiList: sendData
							});
						}
					});
				});
			});
		}
	}else{
		res.send("nothing!!");
	}
}
getHandler['selectapi'] = setCallingApi;
postHandler['selectapi'] = setCallingApi;

function selectAPServer(req, res, next){
	var db = dbase.getDb();
	var sendData = {};
	if(req.session.apiId){
		if (req.method == 'POST') {
			console.log("method: POST");
			var apiLoc = {}
			var devSers = [];
			console.log(typeof req.body['callApiId']);
			if(Array.isArray(req.body.devServers)){
				req.body.devServers.forEach(function(devSer){
					devSers.push(devSer);
				});
			}else{
				devSers.push(req.body.devServers);
			}
			apiLoc['developer'] = devSers;
			
			var testSers = [];
			if(Array.isArray(req.body.testServers)){
				req.body.testServers.forEach(function(testSer){
					testSers.push(testSer);
				});
			}else{
				testSers.push(req.body.testServers);
			}
			apiLoc['tester'] = testSers;
			
			var masterSers = [];
			if(Array.isArray(req.body.masterServers)){
				req.body.masterServers.forEach(function(masterSer){
					masterSers.push(masterSer);
				});
			}else{
				masterSers.push(req.body.masterServers);
			}
			apiLoc['master'] = masterSers;
			
			db.open(function(error, devopsDb){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				devopsDb.collection('api',function(error,apiColl){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					apiColl.update({'_id': dbase.ObjectID(req.session.apiId)},{$set:{'apiLocation': apiLoc}},function(error, result){
						if(error){
							console.log(error.stack);
							process.exit(0);
						}
						sendData = result;
						res.send(sendData);
					});
				});
			});
			
		}else{
			db.open(function(error, devopsDb){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				devopsDb.collection('apserver', function(error,apSerColl){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					var cursor = apSerColl.find({"apSerActivated":true},{'apSerName':true,'apSerLevel':true});
					cursor.each(function(error, doc){
						if(error){
							console.log(error.stack);
							process.exit(0);
						}
						if(doc != null){
							console.log(doc['_id'].toString());
							sendData[doc['_id'].toString()]= doc;
						}else{
							devopsDb.close();
							console.log(sendData);
							res.render('selectapser',{
								 title: "AP Server Select",
								 apiKey:req.session.apiId,
								 apSerList: sendData
							});
						}
					});
				});
			});
		}
	}else{
		res.send("nothing!!");
	}
}
getHandler['selectapser'] = selectAPServer;
postHandler['selectapser'] = selectAPServer;


function updateLevel(req, res, next){
	var db = dbase.getDb();
	var sendData = {};
	var apiOid = null;
	if(req.params.apiId && req.params.level && req.params.verIdx){
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
				apiOid = dbase.ObjectID(req.params.apiId);
				var queryObj = {};
				queryObj['_id'] = apiOid;
				queryObj['apiVer.'+ req.params.verIdx.toString()] = {'$exists':true}
				var updateObj = {};
				updateObj['apiVer.'+ req.params.verIdx.toString() + '.deploy'] = parseInt(req.params.level);
				console.log("queryObj: " + JSON.stringify(queryObj));
				console.log("updateObj: " + JSON.stringify(updateObj));
				apiColl.update( queryObj, {'$set': updateObj }, {"w":1}, function(error, result){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					if(result){
						console.log("result: " + result);
						if(JSON.parse(result)['ok'] == 1){
							sendData["state"] = 0;
						}else{
							sendData["state"] = 1;
						}
						//sendData["UPDATE"] = doc;
						sendData["date"] = new Date();
						sendData["result"] = result;
						res.send(sendData);
						devopsDb.close();
					}else{
						sendData["state"] = 1;
						sendData["info"] = "update error.";
						sendData["date"] = new Date();
					}
				});
			});
		});
	}
}
getHandler["updatelv/:apiId/:level/:verIdx"] = updateLevel;


function register(req, res, next){
	//console.log("use api");
	var db = dbase.getDb();
	//var sendData = {};
	if(req.session.apiId){
		req.session.apiId = null;
	}
	console.log("req.session.apiID: " + req.session.apiId);
	if (req.method == 'POST') {
		var sendData={};
		gitlab.createApiProject(req.body.apiName, req.body.apiOwner, function(data){
			if(data.status == 0){
				var insertObj = {};
				insertObj['apiName'] = req.body.apiName;
				insertObj['apiOwner'] = req.body.apiOwner;
				insertObj['apiDesc'] = req.body.apiDesc;
				insertObj['apiGitInfo'] = data.gitInfo;
				insertObj['apiAllow'] = []
				insertObj['apiUrl'] = req.body.apiUrl;
				insertObj['apiDocUrl'] = req.body.apiDocUrl;
				insertObj['apiEndPoint'] = req.body.apiEndPoint;
				insertObj['apiProto'] = req.body.apiProto;
				insertObj['apiCDate'] = new Date();
				//insertObj['apiLocation'] = req.body.apiLocation;
				insertObj['dataSource'] = req.body.dataSource;
				/*if (typeof req.body.apiActivated !==  'undefined' && req.body.apiActivated == "true"){
					insertObj['apiActivated'] = true;
				}else{
					insertObj['apiActivated'] = false;
				}*/
				insertObj['apiActivated'] = req.body.apiActivated.toLowerCase() === 'true';
				insertObj["apiType"]=req.body.apiType;
				//res.send(insertObj);
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
						var cursor = apiColl.insert(insertObj, function(error,data){
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
						});
					});
				});
			}else{
				res.send(data);
			}
		})
		//sendData = req.body;
	}else{
		gitlab.getGroupList(function(groupList) {
			res.render('register', {
				pagename:"API Register",
				owners:groupList
			});
		})
		
		//sendData["state"] = 1;
		//sendData["date"] = new Date();
	}
}
getHandler["register"] = register;
postHandler["register"] = register;

function allowList(req, res, next){
	dbase.getApiAllow(function(allowList){
		res.send(allowList);
	});
}
getHandler["policy"] = allowList;

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;
//exports.list = list;
//module.exports = router;