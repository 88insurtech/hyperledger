# Insurtech MVP - Hyperledger Fabric  

This is the MVP develop by O-Blue for 88.  

### Starting Application  

#1 Create the BNA archive (from insurtech/dist directory)
composer archive create  --sourceType dir --sourceName ../

#2.1 Install the Business Network Application archive
composer network install -a ./insurtech@0.0.1.bna -c PeerAdmin@hlfv1

#2.2 Strart the network
composer network start -n insurtech -c PeerAdmin@hlfv1 -V 0.0.1 -A admin -S adminpw

#3 DO NOT - Import the card
composer card delete -c admin@insurtech
composer card import -f admin@insurtech.card

#4 Run REST Server on https://
composer-rest-server -c admin@insurtech -n always -w true