

# DevOpSys

## Setup
1. Changing directory to DevOpSys and running "npm install" to install requirement package.

2. Launch patch/inst_exts.sh to install gitlab and jenkins api.

3. Modify config.json
- "MOD_LIST": which modules will be enabled.
- "DPS_TOKEN": DevOpSys's API token.
- "DB_HOST": Mongo database server IP.
- "DB_PORT": Mongo database server PORT.
- "DB_NAME": Mongo database Name.
- "DEPLOY_FILE_SERVER": Files Download server of Deploy file
- "HTTP_PORT": DevOpSys PORT.
- "ZK_HOST": ZooKeeper server IP.
- "ZK_PORT": ZooKeeper server PORT.
- "RUNDECK_HOST": Rundeck server IP.
- "RUNDECK_FULL_AUTO_DEPLOY_ID": Full Auto Deploy Job ID of Rundeck.
- "RUNDECK_HALF_AUTO_DEPLOY_ID": Half Auto Deploy Job ID of Rundeck.
- "RUNDECK_PORT": Rundeck server PORT.
- "RUNDECK_TOKEN": Rundeck API Token Key.
- "GITLAB_URL": Gitlab server URL.
- "GITLAB_TOKEN": Gitlab API Token Key.
- "GITLAB_HOOK": Gitlab Web Hook of Jenkins.
- "JENKINS_URL": Jenkins server URL.
- "JENKINS_BUILDS": Directory for Jenkins build file.

4. Use "node bin/www" to launch DevOpSys


## Usage
- API註冊: 註冊 API 並在 Gitlab 及 Jenkins 建立 project.
- API清單: 列出已註冊的 API.
- AP Server列表: 列出目前的AP Server.
- LOG: 記錄 Jenkins 及 Rundeck 的回傳訊息.


## Developing
-已經可以透過 Rundeck 將打包好的 war檔, deploy 到 tomcat 上.
-現在在串接 Test Server.

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org)) 

Nodeclipse is free open-source project that grows with your contributions.

Now, I am developing on Komodo EDIT.
