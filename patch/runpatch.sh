#!/bin/bash
echo '=== Install Gitlab api lib ==='
workdir=$(/usr/bin/realpath "`/usr/bin/dirname $0`/../")
echo '=== Extract gitlab.tar.gz ==='
cd $workdir/utils
tar zxvf ../patch/gitlab.tar.gz
echo '=== patch Projects.coffee ==='
patch -p0 < ../patch/gitlab_evan.patch
echo '=== make Gitlab dependence==='
cd gitlab
npm install
sudo npm install -g coffee-script
echo '=== Build Gitlab ==='
make build
