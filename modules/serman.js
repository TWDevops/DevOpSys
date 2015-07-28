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
			method: 'POST',
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
		    var retData = {};
		    if(res.statusCode === 200){
			retData.status = 0;
		    } else {
			retData.status = 1;
		    }
		    retData.response = responseString;
		    callback(retData);
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
	//var sendData = {};
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
				db.close();
				//console.log(sendData);
				res.render('apserlist',{
					 title: "AP Server List",
					 apSerList: apSerList
				});
			});
		});
	});
}
getHandler['listview'] = listView;

function apServCtrl(req, res, next){
	var apSerStatObj = {};
	if(req.method === "GET"){
		switch(req.params.action){
			case "on":
				apSerStatObj.status = 0;
				break;
			case "down":
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
getHandler['apservctrl/:id/:action'] = apServCtrl;

function apServXml(req, res, next){
    var sendData = '<?xml version="1.0" encoding="UTF-8"?><project>';
    sendData = sendData + '<node name="devops-as" description="devops-as" tags="" hostname="10.240.1.3:60022" osArch="amd64" osFamily="unix" osName="Linux" osVersion="2.6.32-431.el6.x86_64" username="rockman" ssh-authentication="privateKey" ssh-password-storage-path="keys/deployprivatekey">';
    sendData = sendData + '<attribute name="lb-group" value="tomcat"/></node>'
    sendData = sendData + '<node name="devops-nginx" description="devops-nginx" tags="" hostname="10.240.1.73:60022" osArch="amd64" osFamily="unix" osName="Linux" osVersion="2.6.32-431.el6.x86_64" username="rockman" ssh-authentication="privateKey" ssh-password-storage-path="keys/deployprivatekey">';
    sendData = sendData + '<attribute name="lb-group" value="tomcat"/></node></project>';
    /*var db = dbase.getDb();
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
	});
    });*/
    res.set('Content-Type', 'text/xml');
    res.send(sendData);
}
getHandler['resources'] = apServXml;

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;