#!/bin/bash
workdir=$(/usr/bin/realpath "`/usr/bin/dirname $0`/../")
echo "WORK_DIR=$workdir"
cd $workdir
/usr/bin/nohup /opt/nodejs/bin/node bin/www > logs/$(date +%Y%m%d_%H%M%S).log 
