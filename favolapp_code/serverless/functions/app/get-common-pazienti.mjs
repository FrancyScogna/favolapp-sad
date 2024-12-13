import { DynamoDBClient, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const { USERS_TABLE, PAZIENTI_TUTOR_TABLE } = process.env;
const dynamoDB = new DynamoDBClient();

function transformArray(inputArray) {
 return inputArray.map(item => ({
   pazienteId: item.pazienteId.S,
   createdAt: item.createdAt.S,
   userId: item.userId.S,
   updatedAt: item.updatedAt.S
 }));
}

export const handler = async (event, context, callback) => {
 try{

    const myGroup = event.identity.groups[0];
    const myId = event.identity.username;
    const { userId, limit, nextToken } = event.arguments;
    
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

    //Se è vuoto
    if(commonElements.length === 0){
      if(myGroup === 'tutor'){
       throw new Error("Unauthorized");
      }
      callback(null, {items, nextToken: null});
    }

    if(nextToken){
     const lastElement = JSON.parse(nextToken);
     const index = commonElements.findIndex(item => item.pazienteId.S === lastElement.pazienteId.S);
     if (index !== -1) {
      let nextElements = null;
      if(limit){
       nextElements = commonElements.slice(index + 1, index + 1 + limit);
       if(nextElements.length > 0){
        newNextToken = nextElements[nextElements.length - 1];
        newNextToken = JSON.stringify(newNextToken);
       }
      }else{
       nextElements = commonElements.slice(index + 1);
      }
      const result = transformArray(nextElements);
      callback(null, {items: result, nextToken: newNextToken});
     } else {
       throw new Error('nextToken non valido');
     }
    }

    if(limit){
     const limitElements = commonElements.slice(0, limit );
     if(limitElements.length > 0 ){
      const lastElement = limitElements[ limitElements.length - 1 ];
      newNextToken = JSON.stringify(lastElement);
     }
     const result = transformArray(limitElements);
     callback(null, {items: result, nextToken: newNextToken});
    }

    const result = transformArray(commonElements);
    callback(null, {items: result, nextToken: null});

  } catch (error) {

    callback(error, error);
   
 }
};
