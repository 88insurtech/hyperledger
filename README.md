# Insurtech MVP - Hyperledger Fabric  

This is the MVP develop by O-Blue for 88.  

### Starting Application  

#1 Create the BNA archive (from insurtech/dist directory)  
`composer archive create  --sourceType dir --sourceName ../`  

#2.1 Install the Business Network Application archive  
`composer network install -a ./insurtech@0.0.1.bna -c PeerAdmin@hlfv1`  

#2.2 Start the network  
`composer network start -n insurtech -c PeerAdmin@hlfv1 -V 0.0.1 -A admin -S adminpw`  

#3 Import the card  
`composer card delete -c admin@insurtech`  
`composer card import -f admin@insurtech.card`  

#4 Run REST Server on http://localhost:3000/  
`composer-rest-server -c admin@insurtech -n always -w true`  

### Upgrading Application Version

#1 Edit package.json providing new BNA version  
`nano ../package.json`  
`
"name": "insurtech",  
"version": "0.0.1", --> "version": "0.0.2",
`

#2 Create the BNA archive (from insurtech/dist directory)  
`composer archive create -t dir -n ../`

#3.1 Install the Business Network Application archive  
`composer network install -a insurtech@0.0.2.bna -c PeerAdmin@hlfv1`

#3.2 Start the new network  
`composer network upgrade -c PeerAdmin@hlfv1 -n insurtech -V 0.0.2`

### Transaction sample requests below  

POST CreateContratoApolice statement  
```{
  "$class": "org.insurtech.CreateContratoApolice",
  "contratoId": "1234",
  "beneficiarioApolice": "Joao",
  "validade": "2019-06-24T22:17:09.028Z",
  "apoliceNumber": 1234,
  "valorBemSegurado": 1000,
  "valorBem": 1000,
  "valorSaldo": 1000,
  "valorFranquia": 300,
  "status": "VIGENTE"
}```  

POST AddingSinistroApolice statement  
```{
  "$class": "org.insurtech.AddingSinistroApolice",
  "contratoId": "1234",
  "sinistro": {
    "$class": "org.insurtech.Sinistro",
    "type": "TELA",
    "valorSinistro": 100
  }
}```