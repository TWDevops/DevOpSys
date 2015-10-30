/*jshint sub: true es5:true*/
/**
 * API Manager Module
 */
//var DataBase = new require('../utils/DataBase.js');
//var dbase = new DataBase();
var dbase = new require('../utils/DataBase.js');

var config = require("nconf");
config.env().file({ "file":"config.json" });

var Auth = require('../utils/Auth.js');
var auth = new Auth();

var GitlabApi = require('../utils/GitlabApi.js');
var gitlab = new GitlabApi();

var JenKinsApi = require('../utils/JenKinsApi');
var jenkins = new JenKinsApi();

var mainWorker = require('../worker/MainWorker.js');


/*
 *  Method List(get, post, put, delete)
 */
//var headHander = {};
var getHandler = {};
var postHandler = {};
//var putHandler = {};
//var delHandler = {};

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
                if(doc !== null){
                    console.log(doc);
                    sendData[doc.apiName]= doc;
                } else{
                    db.close();
                    console.log(sendData);
                    res.send(sendData);
                }
            });
        });
    });
}
getHandler["list"]=list;

function view(req, res, next){
    var db = dbase.getDb();
    switch(req.params.action){
        case 'selecttc':
            if(req.params.apiId){
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
                        apiColl.findOne({'_id': dbase.ObjectID(req.params.apiId)},{apiTestId:true},function(error,apiDoc){
                            if(error){
                                console.log(error.stack);
                                process.exit(0);
                            }
                            devopsDb.collection('testcase', function(error, tcColl){
                                if(error){
                                    console.log(error.stack);
                                    process.exit(0);
                                }
                                tcColl.find({},{testid:1, description:1}).toArray(function(error, tcList){
                                    if(error){
                                        console.log(error.stack);
                                        process.exit(0);
                                    }
                                    db.close();
                                    console.log(tcList);
                                    res.render('selecttc',{
                                         title: "Test Case selector",
                                         apiKey:req.params.apiId,
                                         tcList: tcList
                                    });
                                });
                            });
                        });
                    });
                });
            }
            break;
        case 'selectapi':
            if(req.params.apiId){
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
                        var cursor = apiColl.find({'_id':{$ne: dbase.ObjectID(req.params.apiId)}},{'apiName':true, 'apiAllow':true});
                        var apiList = {};
                        cursor.each(function(error, doc){
                            if(error){
                                console.log(error.stack);
                                process.exit(0);
                            }
                            if(doc !== null){
                                console.log(doc['_id'].toString());
                                apiList[doc['_id'].toString()]= doc;
                            } else{
                                db.close();
                                console.log(apiList);
                                res.render('selectapi',{
                                     title: "API select",
                                     apiKey:req.params.apiId,
                                     apiList: apiList
                                });
                            }
                        });
                    });
                });
            }
            break;
        case 'selectapser':
            if(req.params.apiId){
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
                        apSerColl.find({"apSerActivated":true},{'apSerName':true,'apSerLevel':true}).toArray(function(error,apSerDocs){
                            if(error){
                                console.log(error.stack);
                                process.exit(0);
                            }
                            devopsDb.collection('api', function(error,apiColl){
                                apiColl.findOne({'_id': dbase.ObjectID(req.params.apiId)},{apiLocation:true},function(error,apiDoc){
                                    if(error){
                                        console.log(error.stack);
                                        process.exit(0);
                                    }
                                
                                    var apiLocations = {};
                                    apiLocations.lab = [];
                                    apiLocations.ol=[];
                                    apiLocations.master=[];
                                    if (apiDoc.apiLocation){
                                        if (apiDoc.apiLocation.lab) {
                                            for(var labIdx=0; labIdx < apiDoc.apiLocation.lab.length; labIdx++){
                                                apiLocations.lab.push(apiDoc.apiLocation.lab[labIdx].name);
                                            }
                                        }
                                
                                        if (apiDoc.apiLocation.ol) {
                                            for(var olIdx=0; olIdx < apiDoc.apiLocation.ol.length; olIdx++){
                                                apiLocations.ol.push(apiDoc.apiLocation.ol[olIdx].name);
                                            }
                                        }
                                
                                        if (apiDoc.apiLocation.master) {
                                            for(var matIdx=0; matIdx < apiDoc.apiLocation.master.length; matIdx++){
                                                apiLocations.master.push(apiDoc.apiLocation.master[matIdx].name);
                                            }
                                        }
                                    }
                                    db.close();
                                    //console.log(sendData);
                                    res.render('selectapser',{
                                        title: "AP Server Select",
                                        apiKey: req.params.apiId,
                                        apiLoc: apiLocations,
                                        apSerList: apSerDocs
                                    });
                                });
                            });
                        });
                    });
                });
            }else{
                res.send({"info":"need api id."});
            }
            break;
        case 'list':
            if(req.session.apiId){
                console.log("session.apiId: " + req.session.apiId);
                req.session.apiId=null;
            }
            if(req.params.apiId){
                dbase.getApiList(req.params.apiId, function(apiList){
                    res.render('apilist',{
                         title: "API List",
                         apiList: apiList
                    });
                });
            }else{
                dbase.getApiList(function(apiList){
                    res.render('apilist',{
                         title: "API List",
                         apiList: apiList
                    });
                });
            }
            break;
        case 'edit':
            if(req.params.apiId){
                if(req.method === 'POST'){
                    var Client = require('node-rest-client').Client;
                    var client = new Client();
                    var args = {
                                    data: req.body,
                                    headers:{
                                        "dps-token":config.get('DPS_TOKEN'),
                                        "Content-Type": "application/json"
                                    }
                    };
                    client.put("http://127.0.0.1:8080/mod/apiman/api/project/" + req.params.apiId, args,function(data,respone){
                        res.send(data.toString("UTF-8"));
                    });
                }else if(req.method === 'GET'){
                    //var db = dbase.getDb();
                    dbase.getApiList(req.params.apiId, function(apiList){
                        gitlab.getGroupList(function(groupList) {
                            gitlab.getCommitId(apiList[req.params.apiId].apiGitInfo.id, function(commitId){
                                res.render('apiedit', {
                                    title:"API Editor",
                                    apiKey:req.params.apiId,
                                    api:apiList[req.params.apiId],
                                    commitId:commitId,
                                    apiIdHex:req.params.apiId,
                                    owners: groupList
                                });
                            });
                        });
                    });
                }else{
                    res.send({"info":"not thing."});
                }
            }else{
                res.send({"info":"Cannot find API."});
            }
            break;
        case 'register':
            if(req.session.apiId){
                req.session.apiId = null;
            }
            gitlab.getGroupList(function(groupList) {
                res.render('register', {
                    title:"API Register",
                    owners:groupList
                });
            });
            break;
        default:
            res.send({"info":"nothing."});
            break;
    }
}
//postHandler['view/:action/:apiId'] = view;
getHandler['view/:apiId/:action'] = view;
//postHandler['view/:action'] = view;
getHandler['view/:action'] = view;
getHandler['view'] = view;

function modify(req, res, next){
    if(auth.checkPermission(1, 1)){
        var db = dbase.getDb();
        var sendData = {};
        switch(req.params.action){
            case 'selecttc':
                if (req.params.apiId){
                    if (req.body.apiTestId){
                        db.open(function(error, devopsDb){
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
                                apiColl.update({"_id": apiOid},{'$set':{tcId: apiTestId}},{"w":1},function(error, result){
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
                                    db.close();
                                    res.send(sendData);
                                });
                            });
                        });
                    }else{
                        res.send({"info":"Please select test case."});
                    }
                }else{
                    res.send({"info":"need api id."});
                }
                break;
            case 'selectapi':
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
                        apiColl.update({"apiAllow":req.params.apiId},{$pull:{"apiAllow":req.params.apiId}},{multi:true},function(error,result){
                            if(error){
                                console.log(error.stack);
                                process.exit(0);
                            }
                            sendData['1']=result;
                            if(req.body.callApiId){
                                apiColl.update({
                                    "_id":{$in:oids},
                                    apiAllow:{$ne:req.params.apiId}
                                },{    
                                    $push:{"apiAllow":req.params.apiId}
                                },{multi:true},function(error,result){
                                    sendData['2']=result;
                                    db.close();
                                    console.log(sendData);
                                    mainWorker.setApiAcls();
                                    res.send(sendData);
                                });
                            }else{
                                db.close();
                                sendData['2']="no api to call";
                                console.log(sendData);
                                res.send(sendData);
                            }
                        });
                    });
                });
                break;
            case 'selectapser':
                console.log("method: POST");
                var apiLoc = {};
                var labSers = [];
                console.log(typeof req.body['callApiId']);
                if(Array.isArray(req.body.labServers)){
                    req.body.labServers.forEach(function(labSer){
                        labSers.push({"name":labSer,"deploy":9});
                    });
                }else{
                    labSers.push({"name":req.body.labServers,"deploy":9});
                }
                apiLoc['lab'] = labSers;
                
                var olSers = [];
                if(Array.isArray(req.body.olServers)){
                    req.body.olServers.forEach(function(olSer){
                        olSers.push({"name":olSer,"deploy":9});
                    });
                }else{
                    olSers.push({"name":req.body.olServers,"deploy":9});
                }
                apiLoc['ol'] = olSers;
                
                var masterSers = [];
                if(Array.isArray(req.body.masterServers)){
                    req.body.masterServers.forEach(function(masterSer){
                        masterSers.push({"name":masterSer,"deploy":9});
                    });
                }else{
                    masterSers.push({"name":req.body.masterServers,"deploy":9});
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
                        apiColl.update({'_id': dbase.ObjectID(req.params.apiId)},{$set:{'apiLocation': apiLoc}},function(error, result){
                            if(error){
                                console.log(error.stack);
                                process.exit(0);
                            }
                            sendData = result;
                            res.send(sendData);
                        });
                    });
                });
                break;
            case 'register':
                if(req.session.apiId){
                    req.session.apiId = null;
                }
                if (req.body.apiName){
                    gitlab.createApiProject(req.body.apiName, req.body.apiOwner, function(data){
                        if(data.status === 0){
                            //console.log("gitinfo:"+data.gitInfo);
                            //console.log("giturl:"+data.gitInfo.repo_http);
                            jenkins.create(req.body.apiName, data.gitInfo.repo_http, function(result) {
                                if(result.stats !== 0){
                                    res.send(result);
                                }else{
                                    gitlab.addHook(data.gitInfo.id, function(addHookResult) {
                                        var insertObj = {};
                                        insertObj['apiName'] = req.body.apiName;
                                        insertObj['apiOwner'] = req.body.apiOwner;
                                        insertObj['apiDesc'] = req.body.apiDesc;
                                        insertObj['apiGitInfo'] = data.gitInfo;
                                        insertObj['apiAllow'] = [];
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
                                        insertObj['apiType']=req.body.apiType;
                                        //res.send(insertObj);
                                        var db = dbase.getDb();
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
                                                var sendData={};
                                                apiColl.insert(insertObj, function(error,data){
                                                    if(error){
                                                        console.log(error.stack);
                                                        process.exit(0);
                                                    }
                                                    if (data) {
                                                        console.log('Successfully Insert');
                                                        sendData.state = 0;
                                                    } else {
                                                        console.log('Failed to Insert');
                                                        sendData.state = 1;
                                                    }
                                                    db.close();
                                                    sendData.date = new Date();
                                                    sendData.hookInfo = addHookResult;
                                                    res.send(sendData);
                                                });
                                            });
                                        });
                                    });
                                }
                            });
                        }else{
                            res.send(data);
                        }
                    });
                }else{
                    res.send({"info":"Need API Name"});
                }
                break;
            case 'edit':
                if(req.params.apiId){
                    console.log(req.params.apiId);
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
                            console.log(apiOid);
                            apiColl.findOne({"_id": apiOid}, function(error, doc){
                                if(error){
                                    console.log(error.stack);
                                    process.exit(0);
                                }
                                if(doc !== null){
                                    console.log(doc);
                                    //sendData = doc;
                                    doc["apiName"]=req.body.apiName;
                                    doc["apiOwner"]=req.body.apiOwner;
                                    doc["apiAllow"]=req.body.apiAllow.split(",");
                                    doc["apiUrl"]=req.body.apiUrl;
                                    doc["apiDocUrl"]=req.body.apiDocUrl;
                                    doc["apiEndPoint"]=req.body.apiEndPoint;
                                    doc["apiProto"]=req.body.apiProto;
                                    //doc["apiLocation"]=req.body.apiLocation;
                                    doc["dataSource"]=req.body.dataSource;
                                    doc["apiDesc"]=req.body.apiDesc;
                                    doc['apiActivated'] = req.body.apiActivated.toLowerCase() === 'true';
                                    doc["apiType"]=req.body.apiType;
            
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
                                        db.close();
                                        res.send(sendData);
                                    });
                                //}else{
                                }else{
                                    db.close();
                                    sendData["state"] = 1;
                                    sendData["error"] = "Data not found.";
                                    sendData["date"] = new Date();
                                    res.send({"Receive" : sendData});
                                }
                            });
                        });
                    });
                }else{
                    res.send({"info":"need api id."});
                }
                break;
            default:
                res.send({"info":"not thing to do."});
                break;
        }
    }else{
        res.send({"info":"not auth"});
    }
}
postHandler['modify/:apiId/:action'] = modify;
postHandler['modify/:action'] = modify;
//getHandler['api/:action/:apiId'] = project;
//getHandler['api/:action'] = project;
//putHandler['api/:action/:apiId'] = project;
//delHandler['api/:action/:apiId'] = project;

/*function listView(req, res, next) {
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
                if(doc !== null){
                    console.log(doc['_id'].toString());
                    sendData[doc['_id'].toString()]= doc;
                } else{
                    db.close();
                    console.log(sendData);
                    res.render('apilist',{
                         title: "API List",
                         apiList: sendData
                    });
                }
            });
        });
    });
}
getHandler["listview"]=listView;


function apiEdit(req, res, next){
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
                    if(doc !== null){
                        console.log(doc);
                        //sendData = doc;
                        doc["apiName"]=req.body.apiName;
                        doc["apiOwner"]=req.body.apiOwner;
                        doc["apiAllow"]=req.body.apiAllow.split(",");
                        doc["apiUrl"]=req.body.apiUrl;
                        doc["apiDocUrl"]=req.body.apiDocUrl;
                        doc["apiEndPoint"]=req.body.apiEndPoint;
                        doc["apiProto"]=req.body.apiProto;
                        //doc["apiLocation"]=req.body.apiLocation;
                        doc["dataSource"]=req.body.dataSource;
                        doc["apiDesc"]=req.body.apiDesc;
                        doc['apiActivated'] = req.body.apiActivated.toLowerCase() === 'true';
                        doc["apiType"]=req.body.apiType;

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
                            db.close();
                            res.send(sendData);
                        });
                    //}else{
                    }else{
                        db.close();
                        sendData["state"] = 1;
                        sendData["error"] = "Data not found.";
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
                    if(doc !== null){
                        console.log(doc);
                        db.close();
                        //sendData = doc;
                    //}else{
                        gitlab.getGroupList(function(groupList) {
                            gitlab.getCommitId(doc.apiGitInfo.id, function(commitId){
                                res.render('apiedit', {
                                    title:"API Editor",
                                    apiKey:req.session.apiId,
                                    api:doc,
                                    commitId:commitId,
                                    apiIdHex:req.query.apiId,
                                    owners: groupList
                                });
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
getHandler["edit"] = apiEdit;
postHandler["edit"] = apiEdit;

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
                                $push:{"apiAllow":req.session.apiId}
                            },{multi:true},function(error,result){
                                sendData['2']=result;
                                db.close();
                                console.log(sendData);
                                mainWorker.setApiAcls();
                                res.send(sendData);
                            });
                        }else{
                            db.close();
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
                        if(doc !== null){
                            console.log(doc['_id'].toString());
                            sendData[doc['_id'].toString()]= doc;
                        } else{
                            db.close();
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
            var apiLoc = {};
            var labSers = [];
            console.log(typeof req.body['callApiId']);
            if(Array.isArray(req.body.labServers)){
                req.body.labServers.forEach(function(labSer){
                    labSers.push({"name":labSer,"deploy":9});
                });
            }else{
                labSers.push({"name":req.body.labServers,"deploy":9});
            }
            apiLoc['lab'] = labSers;
            
            var olSers = [];
            if(Array.isArray(req.body.olServers)){
                req.body.olServers.forEach(function(olSer){
                    olSers.push({"name":olSer,"deploy":9});
                });
            }else{
                olSers.push({"name":req.body.olServers,"deploy":9});
            }
            apiLoc['ol'] = olSers;
            
            var masterSers = [];
            if(Array.isArray(req.body.masterServers)){
                req.body.masterServers.forEach(function(masterSer){
                    masterSers.push({"name":masterSer,"deploy":9});
                });
            }else{
                masterSers.push({"name":req.body.masterServers,"deploy":9});
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
                    apSerColl.find({"apSerActivated":true},{'apSerName':true,'apSerLevel':true}).toArray(function(error,apSerDocs){
                        if(error){
                            console.log(error.stack);
                            process.exit(0);
                        }
                        devopsDb.collection('api', function(error,apiColl){
                            apiColl.findOne({'_id': dbase.ObjectID(req.session.apiId)},{apiLocation:true},function(error,apiDoc){
                                if(error){
                                console.log(error.stack);
                                process.exit(0);
                                }
                                
                                var apiLocations = {};
                                apiLocations.lab = [];
                                apiLocations.ol=[];
                                apiLocations.master=[];
                                if (apiDoc.apiLocation){
                                if (apiDoc.apiLocation.lab) {
                                    for(var labIdx=0; labIdx < apiDoc.apiLocation.lab.length; labIdx++){
                                        apiLocations.lab.push(apiDoc.apiLocation.lab[labIdx].name);
                                    }
                                }
                                
                                if (apiDoc.apiLocation.ol) {
                                    for(var olIdx=0; olIdx < apiDoc.apiLocation.ol.length; olIdx++){
                                        apiLocations.ol.push(apiDoc.apiLocation.ol[olIdx].name);
                                    }
                                }
                                
                                if (apiDoc.apiLocation.master) {
                                    for(var matIdx=0; matIdx < apiDoc.apiLocation.master.length; matIdx++){
                                        apiLocations.master.push(apiDoc.apiLocation.master[matIdx].name);
                                    }
                                }
                                }
                                db.close();
                                //console.log(sendData);
                                res.render('selectapser',{
                                title: "AP Server Select",
                                apiKey: req.session.apiId,
                                apiLoc: apiLocations,
                                apSerList: apSerDocs
                                });
                            });
                        });
                    });
                });
            });
        }
    }else{
        res.send("nothing!!");
    }
}
getHandler['selectapser'] = selectAPServer;
postHandler['selectapser'] = selectAPServer;*/

/*
function testCase(req, res, next) {
    //setting test case
    if( !req.session.apiId ){
        res.send({action:"nothing"});
        return;
    }
    switch(req.method){
        case 'POST':
            console.log("testCase: POST");
            res.send({});
            break;

        case 'GET':
            console.log("testCase: GET");
            res.send({});
            break;
        
        default:
            console.log("testCase: default");
            res.send({});
            break;
    }
}
getHandler['testcase'] = testCase;
postHandler['testcase/:action'] = testCase;


function register(req, res, next){
    if(req.session.apiId){
        req.session.apiId = null;
    }
    console.log("req.session.apiID: " + req.session.apiId);
    if (req.method == 'POST') {
        gitlab.createApiProject(req.body.apiName, req.body.apiOwner, function(data){
            if(data.status === 0){
                //console.log("gitinfo:"+data.gitInfo);
                //console.log("giturl:"+data.gitInfo.repo_http);
                jenkins.create(req.body.apiName, data.gitInfo.repo_http, function(result) {
                    if(result.stats !== 0){
                        res.send(result);
                    }else{
                        gitlab.addHook(data.gitInfo.id, function(addHookResult) {
                            var insertObj = {};
                            insertObj['apiName'] = req.body.apiName;
                            insertObj['apiOwner'] = req.body.apiOwner;
                            insertObj['apiDesc'] = req.body.apiDesc;
                            insertObj['apiGitInfo'] = data.gitInfo;
                            insertObj['apiAllow'] = [];
                            insertObj['apiUrl'] = req.body.apiUrl;
                            insertObj['apiDocUrl'] = req.body.apiDocUrl;
                            insertObj['apiEndPoint'] = req.body.apiEndPoint;
                            insertObj['apiProto'] = req.body.apiProto;
                            insertObj['apiCDate'] = new Date();
                            //insertObj['apiLocation'] = req.body.apiLocation;
                            insertObj['dataSource'] = req.body.dataSource;
                            //if (typeof req.body.apiActivated !==  'undefined' && req.body.apiActivated == "true"){
                            //    insertObj['apiActivated'] = true;
                            //}else{
                            //    insertObj['apiActivated'] = false;
                            //}
                            insertObj['apiActivated'] = req.body.apiActivated.toLowerCase() === 'true';
                            insertObj["apiType"]=req.body.apiType;
                            //res.send(insertObj);
                            var db = dbase.getDb();
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
                                    var sendData={};
                                    apiColl.insert(insertObj, function(error,data){
                                        if(error){
                                            console.log(error.stack);
                                            process.exit(0);
                                        }
                                        if (data) {
                                            console.log('Successfully Insert');
                                            sendData.state = 0;
                                        } else {
                                            console.log('Failed to Insert');
                                            sendData.state = 1;
                                        }
                                        db.close();
                                        sendData.date = new Date();
                                        sendData.hookInfo = addHookResult;
                                        res.send(sendData);
                                    });
                                });
                            });
                        });
                    }
                });
            }else{
                res.send(data);
            }
        });
        //sendData = req.body;
    }else{
        gitlab.getGroupList(function(groupList) {
            res.render('register', {
                title:"API Register",
                owners:groupList
            });
        });
        
        //sendData["state"] = 1;
        //sendData["date"] = new Date();
    }
}
getHandler["register"] = register;
postHandler["register"] = register;*/

function allowList(req, res, next){
    dbase.getApiAllow(function(allowList){
        res.send(allowList);
    });
}
getHandler["policy"] = allowList;

function deploy(req, res, next){
    
}
getHandler["deploy"] = deploy;

function apiVerify (req, res, next){
    
}
getHandler["verify"] = apiVerify;

//exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;
//exports.putHandler = putHandler;
//exports.delHandler = delHandler;
//exports.list = list;
//module.exports = router;
