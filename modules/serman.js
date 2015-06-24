/**
 * New node file
 */
var dbase = new require('../utils/DataBase.js');

var headHander = {}
var getHandler = {};
var postHandler = {};

function setApSerStatus(apSerIp, apSerStatJson, callback){
	var http = require('http');
	var apStatStr = JSON.stringify(apSerStatJson);
	var options = {
			host: apSerIp,
			path: "/ServStat",
			port: "9763",
			headers:{
				'Content-Type': 'application/json',
				'Content-Length': apStatStr.length
			}
	};
	var req = http.request(options, function(res){
		res.setEncoding('utf-8');
		var responseString = '';
		
		res.on('data', function(data){
			responseString += data;
		});
		
		res.on('end', function(){
			var resultObject = JSON.parse(responseString);
			callback(resultObject);
		});
	});
	
	req.on('error', function(){
		console.log('Set Ap Server (' + apSerIp +') fail.');
		process.exit(0);
	})
	
	req.write(apStatStr);
	req.end();
}

function listView(req, res, next) {
	var db = dbase.getDb();
	var sendData = {};
	db.open(function(error, devopsDb) {
		if(error){
			console.log(error.stack);
			process.exit(0);
		}
		devopsDb.collection('apserver', function(error, apserColl) {
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			apserColl.find({},{'apSerName':true, 'apSerType':true, 'apSerActivated': true,"apSerIntIp":true}).toArray(function(error, apSerList){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				devopsDb.close();
				console.log(sendData);
				res.render('apserlist',{
					 title: "AP Server List",
					 apSerList: apSerList
				});
			});
		});
	});
}
getHandler['listview'] = listView;

/*function apServCtrl(req, res, next){
	var apSerStatObj = {};
	if(req.method === "GET"){
		switch(req.params.action){
			case "on":
				apSerStatObj.status = 0;
				break;
			case "off":
				apSerStatObj.status = 1;
				break;
			case "status":
				
			default:
				res.send(apSerStatObj);
				return;
		}
		var db = dbase.getDb();
		var apSerOid = dbase.ObjectID(req.params.id);
		db.open(function(error, devopsDb) {
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			devopsDb.collection('apserver', function(error, apserColl) {
				if(error){
					console.log(error.stack);
					process.exit(0);
				}
				apserColl.findOne({"_id":apSerOid},{"apSerIntIp":1},function(error, doc){
					setApSerStatus(doc.apSerIntIp, apSerStatObj, function(result) {
						res.send(result);
					});
				});
			});
		});
	}
}
getHandler['apservctrl/:id/:action'] = apServCtrl;*/

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;