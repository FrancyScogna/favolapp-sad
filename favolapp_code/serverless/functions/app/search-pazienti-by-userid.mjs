import { DynamoDBClient, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const { PAZIENTI_TUTOR_TABLE, PAZIENTI_TABLE } = process.env;
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

    const {userId, query, nextToken, limit} = event.arguments;

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
    const queryResult = await dynamoDB.send(otherQueryCommand);

    const pazientiArrayFull = queryResult.Items;
    const pazientiArrayFatchedFull = await processPazienti(pazientiArrayFull);

    let pazientiArray = [];
    let pazientiArrayFatched = [];
    if(pazientiArrayFatchedFull.length > 0){
     pazientiArrayFatched = pazientiArrayFatchedFull.filter((item) => (item.name.includes(query) || item.surname.includes(query) || item.codfis.includes(query)));
     pazientiArray = pazientiArrayFull.filter(item1 => 
      pazientiArrayFatched.some(item2 => item1.pazienteId.S === item2.id));
    }else{
     callback(null, {items: [], nextToken: null});
    }

    let items = [];
    let newNextToken = null;
    //Se è vuoto allora restituisco un vettore vuoto
    if(pazientiArrayFatched.length === 0){
     callback(null, {items, nextToken: newNextToken});
    }

    if(nextToken){
     const lastElement = JSON.parse(nextToken);
     const index = pazientiArray.findIndex(item => item.pazienteId.S === lastElement.pazienteId.S);
     if (index !== -1) {
      let nextElements = null;
      let nextElementsFatched = null;
      if(limit){
       nextElements = pazientiArray.slice(index + 1, index + 1 + limit);
       nextElementsFatched = pazientiArrayFatched.slice(index + 1, index + 1 + limit);
       if(nextElements.length > 0){
        newNextToken = nextElements[nextElements.length - 1];
        newNextToken = JSON.stringify(newNextToken);
       }
      }else{
       nextElementsFatched = pazientiArrayFatched.slice(index + 1);
      }
      callback(null, {items: nextElementsFatched, nextToken: newNextToken});
     } else {
       throw new Error('nextToken non valido');
     }
    }

    if(limit){
     const limitElements = pazientiArray.slice(0, limit );
     const limitElementsFatched = pazientiArrayFatched.slice(0, limit);
     if(limitElements.length > 0 ){
      const lastElement = limitElements[ limitElements.length - 1 ];
      newNextToken = JSON.stringify(lastElement);
     }
     callback(null, {items: limitElementsFatched, nextToken: newNextToken});
    }

    callback(null, {items: pazientiArrayFatched, nextToken: null});

  } catch (error) {

    callback(error, error);
   
 }
};
