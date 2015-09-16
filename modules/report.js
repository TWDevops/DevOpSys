/**
 * New node file
 */
var dbase = new require('../utils/DataBase.js');

var config = require("nconf");
config.env().file({ "file":"config.json" });

var fse = require('fs-extra');

var xml2js = require('xml2js');

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
                    //process.exit(0);
                }
                devopsDb.collection('log', function(error, logColl){
                    if(error){
                        console.log(error.stack);
                        //process.exit(0);
                    }
                    logColl.insert(sendData, function(error, data){
                        if(error){
                            console.log(error.stack);
                            //process.exit(0);
                        }
                        if (data) {
                            //console.log('Successfully Insert');
                            /*if(req.body.JOB_STATUS === "RUNNING"){
                            devopsDb.collection('api',function(error, apiColl){
                            
                            });
                            }else*/
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
                                buildDoc.status = 1;
                                devopsDb.collection('builds', function(error, buildColl){
                                    if(error){
                                        console.log(error.stack);
                                        //process.exit(0);
                                    }
                                    buildColl.update({"deployId":req.body.DEPLOY_ID},buildDoc,{"upsert":true}, function(error, data){
                                        if(error){
                                            console.log(error.stack);
                                            //process.exit(0);
                                        }
                                        console.log("BRANCH: " + req.body.BRANCH);
                                        if(req.body.BRANCH === "origin/lab"){
                                            devopsDb.collection('api', function(error, apiColl){
                                                if(error){
                                                    console.log(error.stack);
                                                    //process.exit(0);
                                                }
                                                apiColl.findOne({"apiName":req.body.JOB_NAME},{"apiLocation":true},function(error, apiDoc){
                                                    if(error){
                                                        console.log(error.stack);
                                                        //process.exit(0);
                                                    }
                                                    console.log(apiDoc);
                                                    if(apiDoc && apiDoc.apiLocation.lab.length > 0){
                                                        var Client = require('node-rest-client').Client;
                                                        var client = new Client();
                                                        var args = {
                                                            headers:{"dps-token":config.get('DPS_TOKEN')}
                                                        };
                                                        apiDoc.apiLocation.lab.forEach(function(apServer) {
                                                            //console.log('http://127.0.0.1/mod/task/deploy/'+ apServer + '/' + buildDoc.deployId + '/true');
                                                            client.get("http://127.0.0.1:"+ (config.get("HTTP_PORT") || '80') + "/mod/task/deploy/"+ apServer.name + "/" + buildDoc.deployId + "/true", args, function(data, response){
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
                            } // end of if(req.body.JOB_STATUS === "SUCCESS")
                        }
                    });
                });
            });
        },
        'test' : function(){
            sendData.info = JSON.stringify(req.body);
            db.open(function(error, devopsDb) {
                if(error){
                    console.log(error.stack);
                    //process.exit(0);
                }
                devopsDb.collection('log', function(error, logColl){
                    if(error){
                        console.log(error.stack);
                        //process.exit(0);
                    }
                    logColl.insert(sendData, function(error, data){
                        if(error){
                            console.log(error.stack);
                            //process.exit(0);
                        }
                        db.close();
                        sendData.state = 0;
                        res.send(sendData);
                    });
                });
            });
        },
        'rundeck' : function(){
            var parser = new xml2js.Parser();
            sendData.info = req.body;
            db.open(function(error, devopsDb) {
                if(error){
                    console.log(error.stack);
                    //process.exit(0);
                }
                devopsDb.collection('log', function(error, logColl){
                    if(error){
                        console.log(error.stack);
                        //process.exit(0);
                    }
                    logColl.insert(sendData, function(error, data){
                        if(error){
                            console.log(error.stack);
                            //process.exit(0);
                        }
                        parser.parseString(sendData.info, function (err, result){
                        //var rdDeployId = null;
                            var queryObj = {};
                            var updateObj = {};
                            console.log("rundeck status: " + result.notification.$.status);
                            if(result.notification.$.status === 'running'){
                                queryObj.taskStatus = 1;
                                updateObj.taskStatus = 2;
                                updateObj.startDate = new Date();
                            }else if(result.notification.$.status === 'succeeded'){
                                queryObj.taskStatus = 2;
                                updateObj.taskStatus = 0;
                                updateObj.endDate = new Date();
                            }else{
                                queryObj.taskStatus = {$lt:3};
                                updateObj.taskStatus = 9;
                                updateObj.endDate = new Date();
                            }
                            var rdOption = result.notification.executions[0].execution[0].job[0].options[0].option;
                            for(var i =0; i < rdOption.length; i++){
                                if(rdOption[i].$.name === 'deployid'){
                                    queryObj.taskNo = rdOption[i].$.value;
                                    break;
                                }
                            }
                            //queryObj.taskNo = rdDeployId;
                            queryObj.rdExecId = result.notification.$.executionId;
                            devopsDb.collection('task', function(error, taskColl){
                                if(error){
                                    console.log(error.stack);
                                    //process.exit(0);
                                }
                                taskColl.update(queryObj,{$set:updateObj},function(error, taskResult){
                                    if(error){
                                        console.log(error.stack);
                                        //process.exit(0);
                                    }
                                    console.log(taskResult);
                                    taskColl.findOne({"taskNo":queryObj.taskNo,"rdExecId":queryObj.rdExecId},{taskParams:1}, function(error, taskDoc){
                                        if(error){
                                            console.log(error.stack);
                                            //process.exit(0);
                                        }
                                        var branch = taskDoc.taskParams.branch;
                                        devopsDb.collection('api', function(error, apiColl){
                                            if(error){
                                                console.log(error.stack);
                                                //process.exit(0);
                                            }
                                            var apiQueryObj = {};
                                            for(var i =0; i < rdOption.length; i++){
                                                if(rdOption[i].$.name === 'node'){
                                                    apiQueryObj['apiLocation.' + branch + '.name'] = rdOption[i].$.value;
                                                    break;
                                                }
                                            }
                                            apiQueryObj['apiLocation.' + branch + '.rdExecId'] = queryObj.rdExecId;
                                            var apiUpdateObj = {};
                                            apiUpdateObj['apiLocation.' + branch + '.$.deploy'] = updateObj.taskStatus;
                                            apiColl.update(apiQueryObj, {$set:apiUpdateObj}, function(error, apiResult){
                                                console.log(apiResult);
                                                db.close();
                                                sendData.state = 0;
                                                res.send(sendData);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                        /*db.close();
                        sendData.state = 0;
                        res.send(sendData);*/
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
            //process.exit(0);
        }
        devopsDb.collection('log', function(error, logColl){
            if(error){
               console.log(error.stack);
                //process.exit(0);
            }
            var logCursor = logColl.find({}).sort({"date":-1});
            logCursor.toArray(function(error, logDocArray){
                if(error){
                    console.log(error.stack);
                    //process.exit(0);
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