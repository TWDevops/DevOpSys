/**
 * New node file
 */
var dbase = new require('../utils/DataBase.js');

var headHander = {}
var getHandler = {};
var postHandler = {};

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
			apserColl.find({},{'apSerName':true, 'apSerType':true, 'apSerActivated': true}).toArray(function(error, apSerList){
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

exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;