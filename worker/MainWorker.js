/**
 * New node file
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });

//var DataBase = new require('../utils/DataBase.js');
//var dbase = new DataBase();
var dbase = new require('../utils/DataBase.js');

process.on('SIGTERM',function(){
	console.log("\nGracefully shutting down from SIGTERM (system kill)");
	if(singleton.getInstance().zkWorker){
		singleton.getInstance().zkWorker.kill('SIGTERM');
	}
	process.exit(2);
});

process.on('SIGINT', function() {
	//this.zkWorker.
	//this.zkWorker.kill('SIGINT');
	console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
	if(singleton.getInstance().zkWorker){
		singleton.getInstance().zkWorker.kill('SIGINT');
	}
	process.exit(1);
});

process.on('exit',function(code){
	if(singleton.getInstance().zkWorker){
		singleton.getInstance().zkWorker.exit(0);
	}
	console.log('Main process exited with exit code '+code);
})

//singleton class
var singleton = function singleton(){
	//ZK Client child process
	var env = process.env;
	var	zkEnv = {};
	var	child_process = require('child_process');
	var zkWorker = null;
	//var workerHandler = {};

	//Duplicate the parent's environment object
	for (someVar in env) {
	    zkEnv[someVar] = env[someVar];
	}

	// Now, extend this with some new variables:
	zkEnv['ZK_HOST'] = config.get('ZK_HOST');
	zkEnv['ZK_PORT'] = config.get('ZK_PORT');

	/*
	 * send to zkWorker, message format: {'workerid':id,'action':action,'data':{}}
	 */
	zkWorker = child_process.fork('./worker/zkClientWorker.js',
			{env:zkEnv}
	);
	
	console.log("Zk Client Worker Start");
	zkWorker.on('message', function(msg) {
		  console.log('www Got message from zkWorker:', msg);
	});
	workerHandler['zkClient'] = zkWorker;
	//this.workerHandler = workerHandler;
	console.log("Zk Client Worker initial.");

	/*boss = child_process.spawn("node", ["worker/taskBoss.js"],
			{env:bossEnv,stdio: ['ipc']}
	);
	boss.stdout.setEncoding('utf8');
	boss.stdout.on('data', function(data) {
	  console.log(data);
	});*/
}

singleton.prototype.sendMessage = function(msg){
	console.log(msg['worker']);
	workerHandler[msg['worker']].send(msg);
//	this.zkWorker.send(msg);
}

singleton.prototype.setApiAcls = function(){
	dbase.getApiAllow(function(allowList) {
		singleton.prototype.sendMessage({"worker":"zkClient","action":"set",'name':'apiACLs',"data":allowList});
	})
};

singleton.prototype.getDeployTask = function(){
	dbase.getTaskList('deploy', function(taskList) {
		
	})
}

/*singleton.prototype.getZKWorker = function(){
	return this.zkWorker;
}*/

singleton.instance = null;
//singleton.zkWorker = null;
var workerHandler = {};
/**
 * Singleton getInstance definition
 * @return singleton class
 */
singleton.getInstance = function(){
	if(this.instance === null ){
		this.instance = new singleton();
		this.instance.setApiAcls();
	}
    return this.instance;
}

module.exports = singleton.getInstance();