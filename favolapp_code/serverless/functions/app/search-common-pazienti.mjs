import { DynamoDBClient, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const { USERS_TABLE, PAZIENTI_TUTOR_TABLE, PAZIENTI_TABLE } = process.env;
const dynamoDB = new DynamoDBClient();

async function processPazienti(items) {
 const results = await Promise.all(
   items.map(async (item) => {
     const getItemParams = {
       TableName: PAZIENTI_TABLE,
       Key: { id: item.pazienteId }
     };
     const getItemCommand = new GetItemCommand(getItemParams);
     const data = await dynamoDB.send(getItemCommand);
     const paziente = data.Item
     return {
      id: paziente.id.S,
      name: paziente.name.S,
      surname: paziente.surname.S,
      birthdate: paziente.birthdate.S,
      phone_number: paziente.phone_number.S,
      gender: paziente.gender.S,
      email: paziente.email.S,
      codfis: paziente.codfis.S,
      provincia: paziente.provincia.S,
      comune: paziente.comune.S,
      createdAt: paziente.createdAt.S,
      updatedAt: paziente.updatedAt.S,
      info: paziente.info.S,
      treatment: paziente.treatment.S,
      sessionsCount: paziente.sessionsCount.N,
      tutorsCount: paziente.tutorsCount.N
     }
   })
 );
 return results;
}


export const handler = async (event, context, callback) => {
 try{

    const myGroup = event.identity.groups[0];
    const myId = event.identity.username;
    const { userId, query, limit, nextToken } = event.arguments;
    
    const getItemParams = {
     TableName: USERS_TABLE,
     Key: {
       id: {
         S: event.arguments.userId,
      }
     }
    };
    const getItemCommand = new GetItemCommand(getItemParams);
    const data = await dynamoDB.send(getItemCommand);


    if(!data.Item){
     throw new Error("Utente non trovato.");
    }

    let items = [];
    let newNextToken = null;

    //Prelevo tutti i miei pazienti
    const myQueryCommandParams = {
     TableName: PAZIENTI_TUTOR_TABLE,
     IndexName: 'UserIndex',
     Select: 'ALL_ATTRIBUTES',
     KeyConditionExpression: 'userId = :userId',
     ExpressionAttributeValues: {
      ":userId": { S: myId }
     }
    }
    const myQueryCommand = new QueryCommand(myQueryCommandParams);
    const myPazienti = await dynamoDB.send(myQueryCommand);

    //Prelevo tutti i suoi pazienti
    const otherQueryCommandParams = {
     TableName: PAZIENTI_TUTOR_TABLE,
     IndexName: 'UserIndex',
     Select: 'ALL_ATTRIBUTES',
     KeyConditionExpression: 'userId = :userId',
     ExpressionAttributeValues: {
      ":userId": { S: userId }
     }
    }
    const otherQueryCommand = new QueryCommand(otherQueryCommandParams);
    const otherPazienti = await dynamoDB.send(otherQueryCommand);

    //Ottengo gli elementi in comune
    const myPazientiArray = myPazienti.Items;
    const otherPazientiArray = otherPazienti.Items;
    const commonElements = myPazientiArray.filter(item1 => 
     otherPazientiArray.some(item2 => item1.pazienteId.S === item2.pazienteId.S)
    );

    //Se è vuoto allora restituisco un vettore vuoto
    if(commonElements.length === 0){
      if(myGroup === 'tutor'){
        throw new Error("Unauthorized");
      }
      callback(null, {items, nextToken: null});
    }

    let searchResultFetched = [];
    let searchResultUnfetched = [];
    const commonPazienti = await processPazienti(commonElements);
    if(commonPazienti.length > 0){
     searchResultFetched = commonPazienti.filter((item) => (item.name.includes(query) || item.surname.includes(query) || item.codfis.includes(query)));
     searchResultUnfetched = commonElements.filter(item1 => 
      searchResultFetched.some(item2 => item1.pazienteId.S === item2.id));
    }else{
     callback(null, {items: [], nextToken: null});
    }

    if(searchResultFetched.length === 0){
     callback(null, {items: [], nextToken: null});
    }

    if(nextToken){
     const lastElement = JSON.parse(nextToken);
     const index = searchResultUnfetched.findIndex(item => item.pazienteId.S === lastElement.pazienteId.S);
     if (index !== -1) {
      let nextElementsUnfatched = null;
      let nextElementsFatched = null;
      if(limit){
       nextElementsUnfatched = searchResultUnfetched.slice(index + 1, index + 1 + limit);
       nextElementsFatched = searchResultFetched.slice(index + 1, index + 1 + limit);
       if(nextElementsUnfatched.length > 0){
        newNextToken = nextElementsUnfatched[nextElementsUnfatched.length - 1];
        newNextToken = JSON.stringify(newNextToken);
       }
      }else{
       nextElementsFatched = searchResultFetched.slice(index + 1);
      }
      callback(null, {items: nextElementsFatched, nextToken: newNextToken});
     } else {
       throw new Error('nextToken non valido');
     }
    }

    if(limit){
     const limitElements = searchResultFetched.slice(0, limit );
     const limitElementsUnfetched = searchResultUnfetched.slice(0, limit );
     if(limitElements.length > 0 ){
      const lastElement = limitElementsUnfetched[ limitElementsUnfetched.length - 1 ];
      newNextToken = JSON.stringify(lastElement);
     }
     callback(null, {items: limitElements, nextToken: newNextToken});
    }

    callback(null, {items: searchResultFetched, nextToken: null});

  } catch (error) {

    callback(error, error);
   
 }
};
