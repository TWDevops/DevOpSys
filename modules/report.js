/**
 * New node file
 */
var dbase = new require('../utils/DataBase.js');

var headHander = {};
var getHandler = {};
var postHandler = {};

function receive(req, res, next) {
    var db = dbase.getDb(); 
    var sendData = {};
    var methods = {
	    "ci" : function(){
		sendData.SERVICE = req.params.sender;
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
				console.log('Successfully Insert');
				sendData["state"] = 0;
				res.send(sendData);
			    }
			});
		    });
		});
	    },
		'test' : function(){
			res.send({"state":0, "receive":req.body, "info": "This is test."})
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