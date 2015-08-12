/**
 * New node file
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });

var querystring = require('querystring');

var xml2js = require('xml2js');
var http = require('http');
var host = null;
var port = null;
var headers = {};

function RunDeckApi(){
    http.globalAgent.maxSockets = 10;
    host = config.get('RUNDECK_HOST');
    port = config.get('RUNDECK_PORT');
    headers = {
	    'X-Rundeck-Auth-Token':config.get('RUNDECK_TOKEN')
	    };
}

var xml2Json = function(xmlStr, callback){
    var parser = new xml2js.Parser();
    parser.parseString(xmlStr, function (err, result){
	callback(result);
    });
};

var rundeck = function(func, paramObj, callback){
    var fn = null;
    var params = null;
    if(arguments.length < 3){
	if(typeof(paramObj) === 'function'){
	    fn = paramObj;
	}else{
	    throw new Error('Need callback function.')
	}
    }else{
	if(typeof(paramObj) !== 'object'){
	    throw new Error('param must be object');
	}else{
	    fn = callback;
	    params = paramObj;
	}
    }
    
    //headers.method = 'GET';
    
    var options = {
	    host: host,
	    port: port,
	    method: 'GET',
	    headers: headers
    };
    switch(func){
    	case 'systeminfo':
    	    options.path = '/api/13/system/info';
    	    break;
    	case 'fullDeployTrigger':
    	    var paramStr = querystring.stringify(paramObj);
    	    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    	    options.headers['Content-Length'] = paramStr.length;
    	    options.method = 'POST';
    	    options.path = '/api/13/job/' + config.get('RUNDECK_FULL_AUTO_DEPLOY_ID') + '/executions';
    	    break;
    	case 'halfDeployTrigger':
    	var paramStr = querystring.stringify(paramObj);
	    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
	    options.headers['Content-Length'] = paramStr.length;
	    options.method = 'POST';
    	    options.path = '/api/13/job/' + config.get('RUNDECK_HALF_AUTO_DEPLOY_ID') + '/executions';
    	    break;
    	case 'projects':
    	    //options.headers.method = 'GET';
    	    options.path = '/api/13/projects';
    	    break;
    	case 'resources':
    	    //options.headers.method = 'GET';
    	    options.path = '/api/2/project/'+ params.project +'/resources';
    	    break;
    }
    
    var req = http.request(options,function(res){
	res.setEncoding('utf-8');
	var resStr = '';
	res.on('data', function (chunk) {
	    //console.log(String(chunk));
	    resStr += chunk;
	});
	res.on('end', function () {
	    fn(resStr);
	});
    });
    
    if(options.method === 'POST'){
	req.write(paramStr);
    }
    
    req.end();
};

RunDeckApi.prototype.getSystemInfo = function(callback){
    rundeck('systeminfo', function(xmlStr){
	xml2Json(xmlStr, function(result) {
	    callback(result);
	});
    });
};

RunDeckApi.prototype.getProjects = function(callback){
    rundeck('projects', function(xmlStr){
	//var parser = new xml2js.Parser();
	//parser.parseString(xmlStr, function (err, result){
	xml2Json(xmlStr, function(result) {
	    callback(result.projects.project);
	});
    });
};

RunDeckApi.prototype.getResources = function(project, callback){
    rundeck('resources',{"project":project}, function(xmlStr) {
    	//var parser = new xml2js.Parser();
    	//console.log(xmlStr);
    	//parser.parseString(xmlStr, function (err, result){
	xml2Json(xmlStr, function(result) {
	    callback(result.project.node);
	})
    	//});
    });
};

RunDeckApi.prototype.deployTrigger = function(isFull, nodeName, deployId, fileUrl, callback ){
    var triggerFunc = "halfDeployTrigger";
    var paramObj = {};
    if(isFull){
	triggerFunc = "fullDeployTrigger";
    }
    paramObj.argString= "-node \"" + nodeName + "\" -deployid \"" + deployId + "\" -src \"" + fileUrl +"\"";
    rundeck(triggerFunc, paramObj, function(xmlStr) {
	//var parser = new xml2js.Parser();
	//parser.parseString(xmlStr, function (err, result) {
	xml2Json(xmlStr, function(result) {
	    //console.dir(result['executions']['execution'][0]['$']['status']);
	    //console.log(xmlStr);
	    callback(result);
	});
    });
};


module.exports = RunDeckApi;