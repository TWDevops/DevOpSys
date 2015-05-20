/**
 * New node file
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });

var zookeeper = require('node-zookeeper-client');
var env = process.env
var child_process = require('child_process');
var workerHandler = {};

var client = zookeeper.createClient(env['ZK_HOST']+ ':' + env['ZK_PORT']);
var path = '/apiACLs';

process.on('message', function(msg){
	//console.log(workerHandler);
	console.log('zkClientWorker Got message from www: ', msg);
	console.log('action: ' + msg['action']);
	console.log('name: ' + msg['name']);
	console.log('data: ');
	for(var apiId in msg['data']){
		(function(apiId){
			console.log(apiId);
			console.log(msg['data'][apiId]);
			client.exists(path + "/" + apiId.toString(), function(error, stat){
				console.log("node: " + path + "/" + apiId)
				if (error) {
					console.log(error.stack);
					return;
				}
				
				if (stat) {
					console.log('Node exists.');
					client.getData(path + "/" + apiId, function(error, data, stat){
						if (error) {
							console.log(error.stack);
				            return;
						}
						if(data.toString('utf8') == msg['data'][apiId].toString()){
							console.log('node ' + apiId.toString() + ": not to change");
						}else{
							client.setData(path + "/" + apiId, new Buffer(msg['data'][apiId].toString()), function(){
								if (error) {
									console.log('Failed to set node date: %s due to: %s.', path + "/" + apiId, error);
							        return;
							    } else {
					            	console.log('Node: %s is successfully change.', path + "/" + apiId);
					        	}
						});
						}
					});
				} else {
					console.log('Node does not exist.');
					client.create(path + "/" + apiId, new Buffer(msg['data'][apiId].toString()),  function (error) {
			        	if (error) {
			            	console.log('Failed to create node: %s due to: %s.', path + "/" + apiId, error);
			        	} else {
			            	console.log('Node: %s is successfully created.', path);
			        	}
					});
				}
			});
		})(apiId);
		
		/*client.create(path + "/" + apiId.toString(), new Buffer(msg['data'][apiId].toString()),  function (error) {
        	if (error) {
            	console.log('Failed to create node: %s due to: %s.', path + "/" + apiId, error);
        	} else {
            	console.log('Node: %s is successfully created.', path);
        	}
		});*/
	}
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

process.on('SIGTERM',function(){
	process.exit();
});

process.on('SIGINT', function() {
	process.exit();
});

process.on('exit',function(code){
	console.log('Child process exited with exit code '+code);
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