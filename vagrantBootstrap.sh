#!/bin/bash

sudo apt-get update
sudo apt-get install --yes make g++ git couchdb curl

cd /tmp
wget https://nodejs.org/download/release/v0.12.4/node-v0.12.4.tar.gz
tar -zxvf node-v0.12.4.tar.gz

cd node-v0.12.4/

./configure
make
sudo make install

mkdir /home/vagrant/node_modules
chown vagrant:vagrant /home/vagrant/node_modules
cd /vagrant
ln -sf /home/vagrant/node_modules .

sudo npm install -g nodemon
curl -X PUT http://localhost:5984/_config/httpd/bind_address -d '"0.0.0.0"'
