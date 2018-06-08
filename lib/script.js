/**
 * Create Flight Transaction
 * @param {org.insurtech.CreateApoliceContratoSeguro} contratoData
 * @transaction
 * 
 */
 function CreateApoliceContratoSeguro(contratoData) {

    var timeNow = new Date().getTime()
    var validoAte = new Date(contratoData.validade).getTime()
    if(validoAte < timeNow){
        throw new Error("Data de validade não pode ser uma data passada!")
    }

    return getAssetRegistry('org.insurtech.Apolice').then((apoliceRegistry) => {
        var factory = new getFactory()
        
        // criando Apolice
        var apolice = factory.newResource('org.insurtech', 'Apolice', contratoData.beneficiarioApolice)
        apolice.apoliceNumber = contratoData.apoliceNumber
        apolice.valorBemSegurado = contratoData.valorBemSegurado
        apolice.valorBem = contratoData.valorBem
        apolice.valorSaldo = contratoData.valorSaldo
        // emitindo evento da Apolice recém criada
        var event = factory.newEvent('org.insurtech', ApoliceCreated)
        event.beneficiario = apolice.beneficiario
        event.apoliceNumber = apolice.apoliceNumber
        event.status = 'VIGENTE'
        emit(event)
    
        return apoliceRegistry.add(apolice)
    }).then((apoliceData) => {
        
        var segurosRegistry =  getAssetRegistry('org.insurtech.ContratoSeguro')
        var factory = new getFactory()

        // criando contrato
        var contratoSeguro = factory.newResource('org.insurtech', 'ContratoSeguro', contratoData.contratoId)
        contratoSeguro.validade = contratoData.validade
        // adicionando Apolice ao contrato
        var relationship = factory.newRelationship('org.insurtech', 'Apolice', apoliceData.beneficiario)
        contratoSeguro.apolice = relationship
        // emitindo evento do Contrato recém criado
        var event = factory.newEvent('org.insurtech', ContratoSeguroCreated)
        event.contratoId = contratoSeguro.contratoId
        emit(event)
            
        return segurosRegistry.add(contratoSeguro)
    }).catch((err) => {
        throw new Error('Error: ', err);
    })
}

