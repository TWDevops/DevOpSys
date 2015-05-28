/**
 * New node file
 */
var zookeeper = require('node-zookeeper-client');
var env = process.env
//var child_process = require('child_process');
var workerHandler = {};

var client = zookeeper.createClient(env['ZK_HOST']+ ':' + env['ZK_PORT']);
var path = '/apiACLs';

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

emitter.on('set',function(nodeList){
	setApiList(nodeList,0);
	/*for(var apiId in nodeList){
		(function(apiId){
			console.log(apiId);
			console.log(nodeList[apiId]);
			client.exists(path + "/" + apiId.toString(), function(error, stat){
				if (error) {
					console.log(error.stack);
					return;
				}
				
				if (stat) {
					console.log('Node: %s is exists.', path + "/" + apiId);
					client.getData(path + "/" + apiId, function(error, data, stat){
						if (error) {
							console.log(error.stack);
				            return;
						}
						if(data.toString('utf8') == nodeList[apiId].toString()){
							console.log('Node: %s is not change', path + "/" + apiId);
						}else{
							client.setData(path + "/" + apiId, new Buffer(nodeList[apiId].toString()), function(){
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
					console.log('Node: %s is not exist.', path + "/" + apiId);
					client.create(path + "/" + apiId, new Buffer(nodeList[apiId].toString()),  function (error) {
			        	if (error) {
			            	console.log('Failed to create node: %s due to: %s.', path + "/" + apiId, error);
			        	} else {
			            	console.log('Node: %s is successfully created.', path + "/" + apiId);
			        	}
					});
				}
			});
		})(apiId);
	}*/
});

emitter.on('msg',function(msg){
	console.log('zkClientWorker Got message from www: ', msg);
});

function setApiList(nodeList, idx){
	console.log(Object.keys(nodeList)[idx]);
	console.log(nodeList[Object.keys(nodeList)[idx]]['apiAllow']);
	client.exists(path + "/" + Object.keys(nodeList)[idx], function(error, stat){
		if (error) {
			console.log(error.stack);
			return;
		}
		if (stat) {
			client.setData(path + "/" + Object.keys(nodeList)[idx],new Buffer(nodeList[Object.keys(nodeList)[idx]]['_id'].toString()),function(error,stat){
			console.log('Node: %s is exists.', path + "/" + Object.keys(nodeList)[idx]);
			client.exists(path + "/" + Object.keys(nodeList)[idx] + "/activated", function(error, stat){
				if (error) {
					console.log(error.stack);
					return;
				}
				if(stat){
					client.setData(path + "/" + Object.keys(nodeList)[idx] + "/activated", new Buffer(nodeList[Object.keys(nodeList)[idx]]['apiActivated'].toString()), function(error,stat){
						if (error) {
							console.log('Failed to set node date: %s due to: %s.', path + "/" + Object.keys(nodeList)[idx] + "/activated", error);
							return;
						}
						console.log('Node: %s is successfully change.', path + "/" + Object.keys(nodeList)[idx] + "/activated");
						client.exists(path + "/" + Object.keys(nodeList)[idx] + "/allow", function(error, stat){
							if (error) {
								console.log(error.stack);
								return;
							}
							if(stat){
								client.setData(path + "/" + Object.keys(nodeList)[idx] + "/allow", new Buffer('{ allow: [' +nodeList[Object.keys(nodeList)[idx]]['apiAllow'].toString() + ']}'), function(error,stat){
									if (error) {
										console.log('Failed to set node date: %s due to: %s.', path + "/" + Object.keys(nodeList)[idx] + "/allow", error);
										return;
									}
									console.log('Node: %s is successfully change.', path + "/" + Object.keys(nodeList)[idx] + "/allow");
									if(idx >= Object.keys(nodeList).length -1){
										return;
									}
									setApiList(nodeList, idx + 1);
								});
							}else{
								client.create(path + "/" + Object.keys(nodeList)[idx] + "/allow", new Buffer('{ allow: [' +nodeList[Object.keys(nodeList)[idx]]['apiAllow'].toString() + ']}'),  function (error) {
									if (error) {
										console.log('Failed to create node: %s due to: %s.', path + "/" + Object.keys(nodeList)[idx] + "/allow", error);
										return;
									}
									console.log('Node: %s is successfully created.', path + "/" + Object.keys(nodeList)[idx] + "/allow");
									if(idx >= Object.keys(nodeList).length -1){
										return;
									}
									setApiList(nodeList, idx + 1);
								});
							}
						});
					});
				}else{
					client.create(path + "/" + Object.keys(nodeList)[idx] + "/activated", new Buffer(nodeList[Object.keys(nodeList)[idx]]['apiActivated'].toString()),  function (error) {
						if (error) {
							console.log('Failed to create node: %s due to: %s.', path + "/" + Object.keys(nodeList)[idx] + "/activated", error);
							return;
						}
						console.log('Node: %s is successfully created.', path + "/" + Object.keys(nodeList)[idx] + "/activated");
						client.exists(path + "/" + Object.keys(nodeList)[idx] + "/allow", function(error, stat){
							if (error) {
								console.log(error.stack);
								return;
							}
							if(stat){
								client.setData(path + "/" + Object.keys(nodeList)[idx] + "/allow", new Buffer('{ allow: [' +nodeList[Object.keys(nodeList)[idx]]['apiAllow'].toString() + ']}'), function(error,stat){
									if (error) {
										console.log('Failed to set node date: %s due to: %s.', path + "/" + Object.keys(nodeList)[idx] + "/allow", error);
										return;
									}
									console.log('Node: %s is successfully change.', path + "/" + Object.keys(nodeList)[idx] + "/allow");
									if(idx >= Object.keys(nodeList).length -1){
										return;
									}
									setApiList(nodeList, idx + 1);
								});
							}else{
								client.create(path + "/" + Object.keys(nodeList)[idx] + "allow", new Buffer('{ allow: [' +nodeList[Object.keys(nodeList)[idx]]['apiAllow'].toString() + ']}'),  function (error) {
									if (error) {
										console.log('Failed to create node: %s due to: %s.', path + "/" + Object.keys(nodeList)[idx] + "/allow", error);
										return;
									}
									console.log('Node: %s is successfully created.', path + "/" + Object.keys(nodeList)[idx] + "/allow");
									if(idx >= Object.keys(nodeList).length -1){
										return;
									}
									setApiList(nodeList, idx + 1);
								});
							}
						});
					});
				}
			});
			});
		} else {
			console.log('Node: %s is not exist.', path + "/" + Object.keys(nodeList)[idx]);
			client.create(path + "/" + Object.keys(nodeList)[idx], new Buffer(nodeList[Object.keys(nodeList)[idx]]['_id'].toString()),  function (error) {
				if (error) {
					console.log('Failed to create node: %s due to: %s.', path + "/" + Object.keys(nodeList)[idx], error);
					return;
				}
				console.log('Node: %s is successfully created.', path + "/" + Object.keys(nodeList)[idx]);
				client.create(path + "/" + Object.keys(nodeList)[idx] + "/activated", new Buffer(nodeList[Object.keys(nodeList)[idx]]['apiActivated'].toString()),  function (error) {
					if (error) {
						console.log('Failed to create node: %s due to: %s.', path + "/" + Object.keys(nodeList)[idx] + "/activated", error);
						return;
					}
					console.log('Node: %s is successfully created.', path + "/" + Object.keys(nodeList)[idx] + "/activated");
					client.create(path + "/" + Object.keys(nodeList)[idx] + "/allow", new Buffer('{ allow: [' +nodeList[Object.keys(nodeList)[idx]]['apiAllow'].toString() + ']}'),  function (error) {
						if (error) {
							console.log('Failed to create node: %s due to: %s.', path + "/" + Object.keys(nodeList)[idx] + "/allow", error);
							return;
						}
						console.log('Node: %s is successfully created.', path + "/" + Object.keys(nodeList)[idx] + "/allow");
						if(idx >= Object.keys(nodeList).length -1){
							return;
						}
						setApiList(nodeList, idx + 1);
					});
				});
			});
		}
	});
}

process.on('message', function(actionData){
	//console.log(workerHandler);
	console.log('zkClientWorker Got action from www: ', actionData);
	console.log('worker: ' + actionData['worker']);
	console.log('action: ' + actionData['action']);
	console.log('name: ' + actionData['name']);
	console.log('data: ');
	emitter.emit(actionData['action'], actionData['data']);
	//for(var apiId in msg['data']){
		/*(function(apiId){
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
		})(apiId);*/
		
		/*client.create(path + "/" + apiId.toString(), new Buffer(msg['data'][apiId].toString()),  function (error) {
        	if (error) {
            	console.log('Failed to create node: %s due to: %s.', path + "/" + apiId, error);
        	} else {
            	console.log('Node: %s is successfully created.', path);
        	}
		});*/
	//}
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

process.on('disconnect', function() {
	console.log("\nzkClientWorker shutting down with parent exited");
	process.exit(1);
});

process.on('SIGTERM',function(){
	console.log("\nzkClientWorker shutting down with SIGTERM (system kill)");
	process.exit(2);
});

process.on('SIGINT', function() {
	console.log("\nzkClientWorker shutting down with SIGINT (Ctrl+C)");
	process.exit(2);
});

process.on('exit',function(code){
	console.log('zkClientWorker process exited with exit code '+code);
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