/**
 * Jenkins tools.
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });

var jenkins = null;

var fs = require('fs');
var confXmlTlp = '';

function JenKinsApi(){
    jenkins = require('jenkins')(config.get("JENKINS_URL"));
    try {
	confXmlTlp = fs.readFileSync('utils/JenKinsJob_tm.xml', 'utf8');
    } catch (e) {
	console.log(e);
	process.exit(0);
    }
}

JenKinsApi.prototype.buildConfigXml = function(gitUrl, branch){
    var result = confXmlTlp.replace(/{{GITURL}}/g, gitUrl).replace(/{{BRANCH}}/g, branch);
    console.log(result);
    return result;
};

JenKinsApi.prototype.info = function(callback){
    jenkins.info(function(err, data) {
	if (err) {
	    throw err;
	}
	callback(data);
    });
};

JenKinsApi.prototype.create = function(jobName, gitUrl, branch, callback){
    var fn = null;
    var branchName = '';
    if(typeof(branch) === 'function'){
	fn = branch;
	branchName = '**';
    }else{
	fn = callback;
	branchName = '*/' + branch;
    }
    jenkins.job.create(jobName, JenKinsApi.prototype.buildConfigXml(gitUrl, branchName) , function(error){
	if(error) {
	    fn({
		"stats":1,
		"info":error,
		"jobName":jobName,
		"branch":branch
	    });
	}else{
	    fn({
		stats:0,info:"create success."
	    });
    	}
    });
};

module.exports = JenKinsApi;