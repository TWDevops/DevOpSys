/**
 * New node file
 */
var dbase = new require('../utils/DataBase.js');

var config = require("nconf");
config.env().file({ "file":"config.json" });

var fse = require('fs-extra');

var headHander = {};
var getHandler = {};
var postHandler = {};

function receive(req, res, next) {
    var db = dbase.getDb(); 
    var sendData = {};
    sendData.SERVICE = req.params.sender;
    sendData.date = new Date();
    var methods = {
	"ci" : function(){
	    sendData.info = req.body;
	    /*sendData.info.COMMIT_ID = req.body.COMMIT_ID;
		sendData.info.BUILD_ID = req.body.BUILD_ID;
		sendData.info.BUILD_BRANCH = req.body.BUILD_BRANCH;*/
	    db.open(function(error, devopsDb) {
		if(error){
		    console.log(error.stack);
		    process.exit(0);
		}
		devopsDb.collection('log', function(error, logColl){
		    if(error){
			console.log(error.stack);
			process.exit(0);
		    }
		    logColl.insert(sendData, function(error, data){
			if(error){
			    console.log(error.stack);
			    process.exit(0);
			}
			if (data) {
			    //console.log('Successfully Insert');
			    if(req.body.JOB_STATUS === "SUCCESS"){
				fse.ensureDirSync("downloads/deploy/" + req.body.JOB_NAME + "/" + req.body.DEPLOY_ID);
				req.body.PKG_FILE.forEach(function(fileName) {
				    fse.copySync(config.get("JENKINS_BUILDS") + "/" + req.body.JOB_NAME + "/" + req.body.DEPLOY_ID + "/" + fileName,
					    "downloads/deploy/" + req.body.JOB_NAME + "/" + req.body.DEPLOY_ID + "/" + fileName);
				});
				var buildDoc ={};
				buildDoc.apiName = req.body.JOB_NAME;
				buildDoc.jkBuildId = req.body.BUILD_ID;
				buildDoc.deployId = req.body.DEPLOY_ID;
				buildDoc.gitBranch = req.body.BRANCH;
				buildDoc.gitCommitId = req.body.COMMIT_ID;
				buildDoc.fileList = req.body.PKG_FILE;
				devopsDb.collection('builds', function(error, buildColl){
				    if(error){
					console.log(error.stack);
					process.exit(0);
				    }
				    buildColl.update({"deployId":req.body.DEPLOY_ID},buildDoc,{"upsert":true}, function(error, data){
					if(error){
					    console.log(error.stack);
					    process.exit(0);
					}
					console.log("BRANCH: " + req.body.BRANCH);
					if(req.body.BRANCH === "origin/lab"){
					    devopsDb.collection('api', function(error, apiColl){
    						if(error){
    						    console.log(error.stack);
    						    process.exit(0);
    						}
    						apiColl.findOne({"apiName":req.body.JOB_NAME},{"apiLocation":true},function(error, apiDoc){
    						    if(error){
    							console.log(error.stack);
    							process.exit(0);
    						    }
    						    console.log(apiDoc);
    						    if(apiDoc && apiDoc.apiLocation.lab.length > 0){
    							var Client = require('node-rest-client').Client;
    							var client = new Client();
    							apiDoc.apiLocation.lab.forEach(function(apServer) {
    							    //console.log('http://127.0.0.1/mod/task/deploy/'+ apServer + '/' + buildDoc.deployId + '/true');
    							    client.get("http://127.0.0.1/mod/task/deploy/"+ apServer + "/" + buildDoc.deployId + "/true", function(data, response){
    							    	console.log(data);
    							    	console.log(response);
    							    });
    							});
    							db.close();
    						    }
    						});
					    });
					}
					sendData.state = 0;
					res.send(sendData);
				    });
				});
			    }
			}
		    });
		});
	    });
	},
	'test' : function(){
	    sendData.info = req.body;
	    db.open(function(error, devopsDb) {
		if(error){
		    console.log(error.stack);
		    process.exit(0);
		}
    		devopsDb.collection('log', function(error, logColl){
    		    if(error){
    			console.log(error.stack);
    			process.exit(0);
    		    }
    		    logColl.insert(sendData, function(error, data){
    			if(error){
    			    console.log(error.stack);
    			    process.exit(0);
			}
			sendData.state = 0;
			res.send(sendData);
    		    });
		});
	    });
	},
	'rundeck' : function(){
	    sendData.info = req.body;
	    db.open(function(error, devopsDb) {
		if(error){
		    console.log(error.stack);
		    process.exit(0);
		}
		devopsDb.collection('log', function(error, logColl){
		    if(error){
			console.log(error.stack);
			process.exit(0);
		    }
		    logColl.insert(sendData, function(error, data){
			if(error){
			    console.log(error.stack);
			    process.exit(0);
			}
			sendData.state = 0;
			res.send(sendData);
		    });
		});
	    });
	}
    };
	    
    console.log(req.method);
    switch(req.method){
    	case 'POST':
    	    if(typeof methods[req.params.sender] === 'function'){
    		methods[req.params.sender]();
    	    }else{
    		res.send(sendData);
    	    }
    	    break;

	default:
	    res.send({});
		break;
    }
}
postHandler['receive/:sender'] = receive;
getHandler['receive'] = receive;

function log(req, res, next){
    var db = dbase.getDb();
    db.open(function(error, devopsDb) {
	if(error){
	    console.log(error.stack);
	    process.exit(0);
	}
	devopsDb.collection('log', function(error, logColl){
	    if(error){
		console.log(error.stack);
		process.exit(0);
	    }
	    var logCursor = logColl.find({}).sort({"date":-1});
	    logCursor.toArray(function(error, logDocArray){
		if(error){
		    console.log(error.stack);
		    process.exit(0);
		}
		db.close();
		console.log(logDocArray);
		res.render('loglist',{
			 title: "Log",
			 logList: logDocArray
		});
	    });
	    	
	});
    });
}
getHandler['log'] = log;

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;