/**
 * New node file
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });

process.on('SIGTERM',function(){
	console.log("\nGracefully shutting down from SIGTERM (system kill)");
	singleton.getInstance().zkWorker.kill('SIGTERM');
	process.exit();
});

process.on('SIGINT', function() {
	//this.zkWorker.
	//this.zkWorker.kill('SIGINT');
	console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
	process.exit();
});

process.on('exit',function(code){
	console.log('Main process exited with exit code '+code);
})

//singleton class
var singleton = function singleton(){
	//ZK Client child process
	var env = process.env;
	var	zkEnv = {};
	var	child_process = require('child_process');

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
	this.zkWorker = child_process.fork('./worker/zkClientWorker.js',
			{env:zkEnv}
	);
	
	/*boss = child_process.spawn("node", ["worker/taskBoss.js"],
			{env:bossEnv,stdio: ['ipc']}
	);
	boss.stdout.setEncoding('utf8');
	boss.stdout.on('data', function(data) {
	  console.log(data);
	});*/

	console.log("Zk Client Worker Start");
	this.zkWorker.on('message', function(msg) {
		  console.log('www Got message from zkWorker:', msg);
	});
	console.log("Zk Client Worker initial.");
}

singleton.prototype.sendMessage = function(msg){
	this.zkWorker.send(msg);
}

singleton.prototype.getZKWorker = function(){
	return this.zkWorker;
}

singleton.instance = null;
singleton.zkWorker = null;
/**
 * Singleton getInstance definition
 * @return singleton class
 */
singleton.getInstance = function(){
    if(this.instance === null ){
        this.instance = new singleton();
    }
    return this.instance;
}

module.exports = singleton.getInstance();