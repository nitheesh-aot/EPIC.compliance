#! /bin/sh
cd /opt/app-root
echo 'starting flas upgrade'
flask db upgrade
