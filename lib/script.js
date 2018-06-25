/**
 * Create Contrato Apolice Transaction
 * @param {org.insurtech.CreateContratoApolice} contratoData
 * @transaction
 */
function CreateContratoApolice(contratoData) {

    var timeNow = new Date().getTime()
    var validoAte = new Date(contratoData.validade).getTime()
    if(validoAte < timeNow){
        throw new Error("Data de validade nãoo pode ser uma data passada!")
    }

    return getAssetRegistry('org.insurtech.Apolice').then((apoliceRegistry) => {
        var factory = new getFactory()

        // criando Apolice
        var apolice = factory.newResource('org.insurtech', 'Apolice', contratoData.apoliceId)
        apolice.beneficiario = contratoData.beneficiarioApolice
        apolice.valorBemSegurado = contratoData.valorBemSegurado
        apolice.valorBem = contratoData.valorBem
        apolice.valorSaldo = contratoData.valorSaldo
        // emitindo evento da Apolice recém criada
        var eventApoliceCreated = factory.newEvent('org.insurtech', 'ApoliceCreated')
        eventApoliceCreated.beneficiario = apolice.beneficiario
        eventApoliceCreated.status = 'VIGENTE'
        eventApoliceCreated.apolice = apolice
        eventApoliceCreated.message = 'Apolice criada com sucesso!'
        emit(eventApoliceCreated)

        return apoliceRegistry.add(apolice)
    }).then((apoliceData) => {
        
        if(apoliceData ){
            throw new Error("Apolice não encontrada !")
        }

        return getAssetRegistry('org.insurtech.ContratoSeguro').then((segurosRegistry) => {
            var factory = new getFactory()

            // criando contrato
            var contratoSeguro = factory.newResource('org.insurtech', 'ContratoSeguro', contratoData.contratoId)
            contratoSeguro.validade = contratoData.validade
            // adicionando Apolice ao contrato
            var relationship = factory.newRelationship('org.insurtech', 'Apolice', contratoData.apoliceId)
            contratoSeguro.apolice = relationship
            // emitindo evento do Contrato recém criado
            var eventContratoCreated = factory.newEvent('org.insurtech', 'ContratoSeguroCreated')
            eventContratoCreated.contratoId = contratoSeguro.contratoId
            eventContratoCreated.contrato = contratoSeguro
            eventContratoCreated.message = 'Contrato criado com sucesso!'
            emit(eventContratoCreated)
    
            segurosRegistry.add(contratoSeguro)
        })
        
    }).catch((err) => {
        throw new Error('Error: ' + err);
    })
}


/**
 * Create Sinistro Transaction
 * @param {org.insurtech.AddingSinistroApolice} sinistroData
 * @transaction
 * 
 * **/
function AddingSinistroApolice(sinistroData){
    var contratosRegistry = {}
    var apoliceRegistry = {}
    var eventSinistroAdded = getFactory().newEvent('org.insurtech', 'SinistroAdded');
    var seguro = {}

    return getAssetRegistry('org.insurtech.ContratoSeguro').then((registry) => {
		contratosRegistry = registry
        return contratosRegistry.get(sinistroData.contratoId)
    }).then((contratoSeguro) => {
        if(!contratoSeguro) throw new Error("Contrato : "+sinistroData.contratoId," não encontrado !");

       if(contratoSeguro.sinistros) {
        contratoSeguro.sinistros.push(sinistroData.sinistro) 
       } else {
         contratoSeguro.sinistros = [sinistroData.sinistro]
       }  

       seguro = contratoSeguro

       return getAssetRegistry('org.insurtech.Apolice').then((apolice) => {
            apoliceRegistry = apolice
            return apoliceRegistry.get(sinistroData.apoliceId)
       }).then((apoliceSeguro) => {
            if(!apoliceSeguro) throw new Error("Apolice : "+sinistroData.apoliceId," não encontrado !")

            apoliceSeguro.status = 'SINISTRO'
            apoliceSeguro.valorSaldo -= sinistroData.sinistro.valorSinistro
            eventSinistroAdded.status = 'SINISTRO'

            return apoliceRegistry.update(apoliceSeguro) 
       }).then((result) => {
            console.log('result', result)
        
            eventSinistroAdded.message = 'Sinistro adicionado ao contrato '+sinistroData.contratoId+
            ' referente à apolice de '+eventSinistroAdded.beneficiario+'.'
            eventSinistroAdded.beneficiario = seguro.apolice.beneficiario 
            eventSinistroAdded.contratoId = sinistroData.contratoId
            emit(eventSinistroAdded);
            
            return contratosRegistry.update(seguro);
       })
    }).catch((error) => {
        throw new Error(error);
    });
}