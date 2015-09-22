#!/bin/bash

echo '=== Install Gitlab and Jenkins api lib ==='
workdir=$(/usr/bin/realpath "`/usr/bin/dirname $0`/../")
if [ -e "$workdir/node_modules" ];then
	echo '=== create libs dir ==='
	mkdir $workdir/node_modules
fi
cd $workdir/node_modules
if [ -e "gitlab" ]; then
        echo '=== Delete old gitlab ==='
        rm -rf gitlab
fi
echo '=== Extract node-gitlab-develop.tar.gz ==='
tar zxvf ../patch/node-gitlab-develop.tar.gz
echo '=== patch Projects.coffee ==='
patch -p0 < ../patch/gitlab_evan.patch
echo '=== make Gitlab dependence==='
cd gitlab
npm install set strict-ssl false
npm install set strict-ssl false -g coffee-script
echo '=== Build Gitlab ==='
make build
echo '=== Extract node-jenkins-master.tar.gz ==='
cd $workdir/node_modules
if [ -e "jenkins" ]; then
        echo '=== Delete old jenkins ==='
        rm -rf jenkins
fi
tar zxvf ../patch/node-gitlab-develop.tar.gz
cd jenkins
npm install set strict-ssl false