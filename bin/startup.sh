#!/bin/bash
unset http_proxy
workdir=$(/usr/bin/realpath "`/usr/bin/dirname $0`/../")
nodeJs=$(/usr/bin/which node)
echo "WORK_DIR=$workdir"
cd $workdir
/usr/bin/nohup $nodeJs bin/www > logs/$(date +%Y%m%d_%H%M%S).log &
