var http = require('http');
var https = require('https');
var dbase = new require('../utils/DataBase.js');
var db = dbase.getDb();
var testServerHost = "172.19.9.14";
var testServerPort = 8080
var testServerPath = "/qaServer/service/testcase";

module.exports = {
	getAllTestCase : function(type, productClass, callback){

		db.open(function(error, devopsDb) {
			if(error){
				console.log(error.stack);
				process.exit(0);
			}

			devopsDb.collection('testcase', function(error, mongoColl){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}

				mongoColl.find({},{'testid':true, 'type':true, 'class':true, 'description': true,"testdata":true, 'defaultHost':true}).toArray(function(error, result){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}

					callback(true, result);
				});
			});
		});
	},
	getTestCase : function(testIdArray, callback){ //testIdArray ex: [{"testid":"4e00207ffbad48b5bef17995e71070bb"}, {"testid":"e7dc0b7c11f2470ba4f04aefd5430a46"}]
		db.open(function(error, devopsDb) {
			if(error){
				console.log(error.stack);
				process.exit(0);
			}
			
			devopsDb.collection('testcase', function(error, mongoColl){
				if(error){
					console.log(error.stack);
					process.exit(0);
				}

				mongoColl.find( {$or: testIdArray } , {"testid":true, "testdata":true, 'type':true, 'defaultHost':true}).toArray(function(error, result){
					if(error){
						console.log(error.stack);
						process.exit(0);
					}
					//console.log(JSON.stringify(testIdArray));
					callback(true, result);
				});
			});
		});
	},
	/* sample data
	{"deployid":"uuid","seleniumtaskid":"uuid","chrome":"true","localflag":"false",
		"selenium":[ 
			{"testid":"testuuid","testdata":[
				{"event":"get","type":"","value":"http://plus.s104.com.tw"},
				{"event":"click","type":"Id::btn-login","value":""},
				{"event":"sleep","type":"","value":"2000"},
				{"event":"clear","type":"Id::username","value":""},
				{"event":"sendKeys","type":"Id::username","value":"V111044428"},
				{"event":"clear","type":"Id::password","value":""},
				{"event":"sendKeys","type":"Id::password","value":"123qwe"},
				{"event":"click","type":"Id::btn-login","value":""},
				{"event":"sleep","type":"","value":"5000"}
				]
			}
		],
		"api":[]
	}

	*/
	sendToTestServer : function(deployid, targetHost, seleniumtaskid, testIdArray, callback){
		var postData = {};
		postData.deployid = deployid;
		postData.seleniumtaskid = seleniumtaskid;
		postData.chrome = "true";
		postData.localflag = "false";
		postData.selenium = [];
		postData.api = [];
		var options = {
			hostname: testServerHost,
			port: testServerPort,
			path: testServerPath,
			method: 'POST',
			//headers: {
				//'Content-Type': 'application/x-www-form-urlencoded',
				//'Content-Length': postData.length
			//}
		};

		this.getTestCase(testIdArray, function(success, testCase){		
			//console.log(JSON.stringify(testCase));
			
			for(i=0; i<testCase.length; i++){
				var tempString = JSON.stringify((testCase[i]));
				if(targetHost == null){
					tempString = tempString.replace('$(HOST)', testCase[i].defaultHost);
				}else{
					tempString = tempString.replace('$(HOST)', targetHost);
				}

				console.log(tempString);


				if(testCase[i].type == 'selenium'){
					postData.selenium.push(JSON.parse(tempString));
				}else if(testCase[i].type == 'api'){
					var testObj = JSON.parse(tempString);
					postData.api.push(testObj.testdata[0]);
				}
			}


			//http post
			var body = '';
  			var testServerResponse = '';
			var req = http.request(options, function(res) {
				console.log('STATUS: ' + res.statusCode);
				console.log('HEADERS: ' + JSON.stringify(res.headers));
  				res.setEncoding('utf8');
  				res.on('data', function(chunk) { body += chunk; });

				res.on('end', function() {
					testServerResponse = JSON.parse(body);
					callback(true, 'Test start: '+ JSON.stringify(testServerResponse));
				})
			});

			req.on('error', function(e) {
				console.log('problem with request: ' + e.message);
				callback(false, 'Test error: '+ e.message);
			});

			// write data to request body
			console.log(JSON.stringify(postData));
			req.write(JSON.stringify(postData));
			req.end();
			
			//callback(true, 'Test start: '+ testServerResponse);
		});
	}
}