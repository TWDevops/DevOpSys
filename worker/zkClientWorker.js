/**
 * New node file
 */
var zookeeper = require('node-zookeeper-client');
var env = process.env
var child_process = require('child_process');
var workerHandler = {};

var client = zookeeper.createClient(env['ZK_HOST']+ ':' + env['ZK_PORT']);
var path = '/apiACLs';

process.on('message', function(msg){
	//console.log(workerHandler);
	console.log('Boss Got message from www:', msg);
	/*if(msg.action){
		if(msg.action == deploy){
			var worker = child_process.fork('./worker/taskWorker.js');
			workerHandler[worker.pid] = worker;
			worker.on('message', function(msg) {
				console.log('Boss Got message from Worker:', msg);
			});
			
			worker.on('exit', function(){
				delete workerHandler[worker.pid];
				worker = null;
			})
			//console.log(worker.pid);
			//console.log(process.pid);
		}
		if(msg.action == "exit"){
			worker.send(msg);
		}
	}*/
});

function destroy(errNo){
	client.close();
	process.exit(errNo);
}

client.once('connected', function () {
	console.log('Connected to ZooKeeper.');
	client.exists(path, function(error, stat){
		if (error) {
			console.log(error.stack);
			return;
		}
		
		if (stat) {
			console.log('Node exists.');
		} else {
			console.log('Node does not exist.');
			client.create(path, new Buffer('DevOpSysACLs'), function (error) {
		        if (error) {
		            console.log('Failed to create node: %s due to: %s.', path, error);
		        } else {
		            console.log('Node: %s is successfully created.', path);
		        }
			});
		}
		
	});
});

client.connect();