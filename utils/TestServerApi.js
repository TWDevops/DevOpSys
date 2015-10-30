/*jshint sub: true es5:true*/
/**
 * Test Server API
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });

var dbase = new require('../utils/DataBase.js');

var RestClient = require("node-rest-client").Client;

var client = null;

function TestServerApi(){
    client = new RestClient();
    client.registerMethod("testCase", "http://172.19.9.14:8080/qaServer/service/testcase", "POST");
}

TestServerApi.prototype.plusRootTest = function(deployId, testid, apServer, callBack){
    dbase.getDataByApserName(apServer, function(apSerDoc){
        if(apSerDoc.apSerIntIp){
            var db = dbase.getDb();
            var host = null;
            db.open(function(error, devopsDb){
                if(error){
                    console.log(error.stack);
                    process.exit(0);
                }
                if(apServer.apSerPort){
                    host = apSerDoc.apSerIntIp + ":" + apServer.apSerPort;
                }else {
                    switch(apServer.apSerType){
                        case "tomcat":
                            host = apSerDoc.apSerIntIp + ":8080";
                            break;
                        case "wso2-as":
                            host = apSerDoc.apSerIntIp + ":9443";
                            break;
                        default:
                            host = apSerDoc.apSerIntIp;
                            break;
                        
                    }
                }
                devopsDb.collection('testcase', function(error, testColl){
                    if(error){
                        console.log(error.stack);
                        process.exit(0);
                    }
                    testColl.findOne({"testid": testid}, function(error, testDoc){
                        if(error){
                            console.log(error.stack);
                            process.exit(0);
                        }
                        var args = {
                            data:{
                                "deployid":deployId,
                                "seleniumtaskid":deployId,
                                "selenium":[],
                                
                                "api":JSON.parse(JSON.stringify(testDoc.testdata).replace('$(HOST)', host))
                            },
                            headers:{"Content-Type":"application/json"}
                        };
                        console.log(JSON.stringify(args));
                        client.methods.testCase(args, function(data, response){
                            var resObj = JSON.parse(data.toString('UTF-8'));
                            callBack(resObj);
                        });
                    });
                });
            });
            /*var args = {
                data:{
                    "deployid":deployId,
                    "seleniumtaskid":deployId,
                    "selenium":[],
                    "api":[
                            {
                                "url":"http://" + apSerDoc.apSerIntIp + "/ajax/plus/monitor/monitor-entrance?checkKey=plus10400",
                                "method":"get",
                                "input":"",
                                "output":"OK",
                                "whiteList":"",
                                "blackList":""
                            }
                    ]
                },
                headers:{"Content-Type":"application/json"}
            };
            client.methods.testCase(args, function(data, response){
                var resObj = JSON.parse(data.toString('UTF-8'));
                callBack(resObj);
            });*/
        }else{
            callBack({"error":"Can not get apserver's data."});
        }
    });
};

module.exports = TestServerApi;