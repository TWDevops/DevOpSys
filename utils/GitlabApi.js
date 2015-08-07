/**
 * Call Gitlab Api
 */
var config = require("nconf");
config.env().file({ "file":"config.json" });

var jsonQuery = require('json-query');

this.gitlab = null;

function GitlabApi(){
	this.gitlab = require('gitlab')({
		url: config.get("GITLAB_URL"),
		token: config.get("GITLAB_TOKEN")
	});
}

GitlabApi.prototype.getUid = function(eMailOrName,callback){
	this.gitlab.users.search(eMailOrName, function(data){
		console.log(data);
		callback(data[0].id);
	});
};

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
};

GitlabApi.prototype.getGroupList = function(callback){
	var groupList = [];
	this.gitlab.groups.all(function(groups){
		for(var i = 0; i <groups.length; i++){
			groupList.push({
				id:groups[i].id,
				name:groups[i].name
			});
		}
		callback(groupList);
	});
};

GitlabApi.prototype.createApiProject = function(proName, groupId,callback){
	var newProject = {
			"namespace_id":groupId,
			"name":proName,
			"public":true
	};
	this.gitlab.projects.create(newProject,function(data){
		var retData=null;
		if(data == true){
			retData = {
					status: 1,
					message: "Can Not Create Project!"
			};
		}else if(data){
			retData = {
					status: 0,
					message: "Project Created!",
					gitInfo: {
						id: data.id,
						repo_http: data.http_url_to_repo,
						repo_ssh: data.ssh_url_to_repo
					}
			};
		}else{
			retData = {
					status:0,
					message: "Unknow Error!"
			};
		}
		callback(retData);
	});
};

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
			};
			callBack(retData);
		}
	});
};

GitlabApi.prototype.addHook = function(pId, callback){
    var retData = {};
    var hookUrl = config.get("GITLAB_HOOK");
    this.gitlab.projects.hooks.add(pId,hookUrl, function(data){
	console.log(data);
	if(data!== true){
	    retData = {
		    status: 0,
		    project: pId,
		    message: "["+hookUrl+ "] has been added."
	    };
	}else{
	    retData = {
		    status: 1,
		    project: pId,
		    message: "["+hookUrl+ "] has not been added."
	    };
	}
	callback(retData);
    });
};

GitlabApi.prototype.getCommitId = function(pid, branch, callBack){
    var commitId = {};
    var branchName = "";
    if(arguments.length < 3){
	if(typeof(branch) === 'function'){
	    fn = branch;
	}else{
	    throw new Error('Need callback function.')
	}
    }else{
	branchName = branch;
	fn = callBack;
    }
    this.gitlab.projects.repository.showBranch(pid, branchName, function(result){
	if(branchName === ""){
	    commitId.lab = jsonQuery('branches[name=lab].commit.id',{data:{branches:result}}).value;
	    commitId.ol = jsonQuery('branches[name=ol].commit.id',{data:{branches:result}}).value;
	    commitId.master = jsonQuery('branches[name=master].commit.id',{data:{branches:result}}).value
	}else{
	    console.log("branchName: " + branchName);
	    commitId[branchName] = result.commit.id;
	}
	fn(commitId);
    });
};

module.exports = GitlabApi;