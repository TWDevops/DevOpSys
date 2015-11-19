/*jshint sub: true es5:true*/
/**
 * AP Server manager module.
 */
var dbase = new require('../utils/DataBase.js');

var fs = require('fs');

var headHander = {};
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
    });
    
    req.write(apStatStr);
    req.end();
}

function view(req, res, next){
    req.session.modName = 'serman';
    switch(req.params.action){
        case 'list':
            if(req.params.apSerId){
                dbase.getApSerList(req.params.apSerId, function(apSerList){
                    res.render('apserlist',{
                        title: "AP Server List",
                        apSerList: apSerList
                    });
                });
            }else{
                dbase.getApSerList(function(apSerList){
                    res.render('apserlist',{
                        title: "AP Server List",
                        apSerList: apSerList
                    });
                });
            }
            break;
        
        case 'edit':
            if(req.params.apSerId){
                dbase.getApSerList(req.params.apSerId, function(apSerList){
                            //res.send(apserDoc);
                            res.render('apseredit', {
                                title: "AP Server Editor",
                                apserDoc: apSerList[0]
                            });
                });
                //res.send({"serverId": req.params.apSerId});
            }else{
                res.send({"info": "Can not get apSerId."});
            }
            break;
        case 'resources':
            var xmlData = fs.readFileSync('utils/resources.xml', 'utf8');
            res.set('Content-Type', 'text/xml');
            res.send(xmlData);
            break;
        case 'create':
            res.render('createapser', {
                title: "Create AP Server"
            });
            break;
        default:
            res.send({"info":"nothing."});
            break;
    }
}
getHandler['view/:apSerId/:action'] = view;
getHandler['view/:action'] = view;
getHandler['view'] = view;

function modify(req, res, next){
    var fn = {
        register: function(){
            if(req.body.apSerName && req.method === 'POST'){
                
                var sendData = {};
                var apSerInsObj = {};
                dbase.getDataByApserName(req.body.apSerName, function(apSerDoc){
                    if(apSerDoc.apSerName){
                        res.send({"info":"Server is exist."});
                    }else{
                        apSerInsObj.apSerName = req.body.apSerName;
                        apSerInsObj.apSerLevel = req.body.apSerLevel;
                        apSerInsObj.apSerManUser = req.body.apSerManUser;
                        apSerInsObj.apSerManPort = req.body.apSerManPort;
                        apSerInsObj['ssh-auth'] = req.body.sshAuth;
                        apSerInsObj['ssh-pass-storage'] = req.body.sshPassStorage;
                        apSerInsObj.apSerIntIp = req.body.apSerIntIp;
                        apSerInsObj.apSerPort = req.body.apSerPort;
                        apSerInsObj.apSerType = req.body.apSerType;
                        apSerInsObj.apSerVer = req.body.apSerVer;
                        apSerInsObj.apSerOsArch = req.body.apSerOsArch;
                        apSerInsObj.apSerOsFamily = req.body.apSerOsFamily;
                        apSerInsObj.apSerOsName = req.body.apSerOsName;
                        apSerInsObj.apSerOsVersion = req.body.apSerOsVersion;
                        apSerInsObj.apSerTags = req.body.apSerTags;
                        apSerInsObj.apSerActivated = (req.body.apSerActivated === 'true');
                        apSerInsObj.apSerStat = req.body.apSerStat;
                        apSerInsObj.apSerDesc = req.body.apSerDesc;
                        var db = dbase.getDb();
                        db.open(function(error, devopsDb) {
                            if(error){
                                console.log(error.stack);
                                process.exit(0);
                            }
                            devopsDb.collection('apserver', function(error, apSerColl){
                                if(error){
                                    console.log(error.stack);
                                    process.exit(0);
                                }
                                apSerColl.insert(apSerInsObj, function(error, data){
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
                                    sendData.date = new Date();
                                    db.close();
                                });
                                res.send(sendData);
                            });
                        });
                    }
                });
                
            }else{
                res.send({"info":"Need Server Name."});
            }
        },
        edit: function(){
            if(req.params.apSerId && req.method === 'POST'){
                var sendData = {};
                var apSerOid = dbase.ObjectID(req.params.apSerId);
                dbase.getApSerList(req.params.apSerId, function(apSerList){
                    if(apSerList){
                        apSerList[0].apSerName = req.body.apSerName;
                        apSerList[0].apSerLevel = req.body.apSerLevel;
                        apSerList[0].apSerManUser = req.body.apSerManUser;
                        apSerList[0].apSerManPort = req.body.apSerManPort;
                        apSerList[0]['ssh-auth'] = req.body.sshAuth;
                        apSerList[0]['ssh-pass-storage'] = req.body.sshPassStorage;
                        apSerList[0].apSerIntIp = req.body.apSerIntIp;
                        apSerList[0].apSerPort = req.body.apSerPort;
                        apSerList[0].apSerType = req.body.apSerType;
                        apSerList[0].apSerVer = req.body.apSerVer;
                        apSerList[0].apSerOsArch = req.body.apSerOsArch;
                        apSerList[0].apSerOsFamily = req.body.apSerOsFamily;
                        apSerList[0].apSerOsName = req.body.apSerOsName;
                        apSerList[0].apSerOsVersion = req.body.apSerOsVersion;
                        apSerList[0].apSerTags = req.body.apSerTags;
                        apSerList[0].apSerActivated = (req.body.apSerActivated === 'true');
                        apSerList[0].apSerStat = req.body.apSerStat;
                        apSerList[0].apSerDesc = req.body.apSerDesc;
                        var db = dbase.getDb();
                        db.open(function(error, devopsDb) {
                            if(error){
                                console.log(error.stack);
                                process.exit(0);
                            }
                            devopsDb.collection('apserver', function(error, apSerColl){
                                if(error){
                                    console.log(error.stack);
                                    process.exit(0);
                                }
                                apSerColl.update({"_id": apSerOid},{$set:apSerList[0]},function(error, result){
                                    if(error){
                                        console.log(error.stack);
                                        process.exit(0);
                                    }
                                    if(JSON.parse(result)['ok'] == 1){
                                        sendData["state"] = 0;
                                    }else{
                                        sendData["state"] = 1;
                                    }
                                    sendData["date"] = new Date();
                                    sendData["result"] = result;
                                    res.send(sendData);
                                });
                                
                            });
                        });
                    }else{
                        res.send({"info":"AP server not found."});
                    }
                });
            }else{
                res.send({"info":"Need Server ID."});
            }
        }
    };
    if(typeof(fn[req.params.action]) === 'function'){
        fn[req.params.action]();
    }else{
        res.send({info:"Not thing to do."});
    }
}
postHandler['modify/:apSerId/:action'] = modify;

/*function listView(req, res, next) {
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
getHandler['listview'] = listView;*/

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
//            case "status":
                
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
getHandler['ctrl/:id/:action'] = apServCtrl;

function apServXml(req, res, next){
    /*var sendData = '<?xml version="1.0" encoding="UTF-8"?><project>';
    sendData = sendData + '<node name="devops-as" description="devops-as" tags="" hostname="10.240.1.3:60022" osArch="amd64" osFamily="unix" osName="Linux" osVersion="2.6.32-431.el6.x86_64" username="rockman" ssh-authentication="privateKey" ssh-password-storage-path="keys/deployprivatekey">';
    sendData = sendData + '<attribute name="lb-group" value="tomcat"/></node>';
    sendData = sendData + '<node name="devops-nginx" description="devops-nginx" tags="" hostname="10.240.1.73:60022" osArch="amd64" osFamily="unix" osName="Linux" osVersion="2.6.32-431.el6.x86_64" username="rockman" ssh-authentication="privateKey" ssh-password-storage-path="keys/deployprivatekey">';
    sendData = sendData + '<attribute name="lb-group" value="tomcat"/></node></project>';*/
    var sendData = fs.readFileSync('utils/resources.xml', 'utf8');
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