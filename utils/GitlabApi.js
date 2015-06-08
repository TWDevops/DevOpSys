/**
 * Call Gitlab Api
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });

this.gitlab = null;

function GitlabApi(){
	this.gitlab = require('../libs/gitlab')({
		url: config.get("GITLAB_URL"),
		token: config.get("GITLAB_TOKEN")
	});
}

GitlabApi.prototype.getUid = function(eMailOrName,callback){
	this.gitlab.users.search(eMailOrName, function(data){
		console.log(data);
		callback(data[0].id);
	});
}

GitlabApi.prototype.getUserList = function(callback){
	var userList = [];
	this.gitlab.users.all(function(users) {
		for (var i = 0; i < users.length; i++) {
			userList.push({
				id:users[i].id,
				name:users[i].name
			});
		}
		callback(userList);
	});
}

GitlabApi.prototype.getGroupList = function(callback){
	var groupList = [];
	this.gitlab.groups.all(function(groups){
		for(var i = 0; i <groups.length; i++){
			groupList.push({
				id:groups[i].id,
				name:groups[i].name
			})
		}
		callback(groupList);
	});
}

GitlabApi.prototype.createApiProject = function(proName, groupId,callback){
	var newProject = {
			"namespace_id":groupId,
			"name":proName,
			"public":true
	}
	this.gitlab.projects.create(newProject,function(data){
		var retData=null;
		if(data == true){
			retData = {
					status: 1,
					message: "Can Not Create Project!"
			}
		}else if(data){
			retData = {
					status: 0,
					message: "Project Created!",
					gitInfo: {
						id: data.id,
						repo_http: data.http_url_to_repo,
						repo_ssh: data.ssh_url_to_repo
					}
			}
		}else{
			retData = {
					status:0,
					message: "Unknow Error!"
			}
		}
		callback(retData);
	});
}

GitlabApi.prototype.commits = function(pId, refName, callBack){
	var retData = {};
	var options = {};
	options['id'] = pId;
	if(refName){
		options['ref_name'] = refName;
	}
	this.gitlab.projects.listCommits(options,function(data){
		if(data){
			var commitsTmp = [];
			for( var i =0; i<data.length; i++){
				commitsTmp.push({
					"id": data[i].id,
					"title": data[i].title,
					"author": data[i].author_name,
					"email": data[i].author_email
				});
			}
			retData = {
					status: 0,
					message: "Got Commit list.",
					commits: commitsTmp
			}
			callBack(retData);
		}
	})
}

module.exports = GitlabApi;