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
			    /*if(req.body.state.toString().toLowerCase() === "succeed"){
				    fse.copy(config.get("JENKINS_WS") + "/" + req.body.jobname + "/" + req.body.BUILD_ID + "/workspace.tgz",
					"downloads/apifiles/" + req.body.jobname + "_" + req.body.BUILD_BRANCH + "_" + req.body.BUILD_ID + ".tgz",
					function(error){
					if (error) {
					    console.error(error);
					    sendData["state"] = 1;
					}else{
				    	    console.log("success!");
					    sendData["state"] = 0;
				        }
					db.close();
					res.send(sendData);
				    });
				    
				}*/
				db.close();
				sendData.state = 0;
				res.send(sendData);
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

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;