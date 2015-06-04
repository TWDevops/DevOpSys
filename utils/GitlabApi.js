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
	this.gitlab.groups.all();
}

module.exports = GitlabApi;