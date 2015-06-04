#!/bin/bash
echo '=== Install Gitlab api lib ==='
workdir=$(/usr/bin/realpath "`/usr/bin/dirname $0`/../")
cd $workdir/libs
if [ -e "gitlab" ]; then
        echo '=== Delete old gitlab ==='
        rm -rf gitlab
fi
echo '=== Extract gitlab.tar.gz ==='
tar zxvf ../patch/node-gitlab-develop.tar.gz
echo '=== patch Projects.coffee ==='
patch -p0 < ../patch/gitlab_evan.patch
echo '=== make Gitlab dependence==='
cd gitlab
npm install
sudo npm install -g coffee-script
echo '=== Build Gitlab ==='
make build
