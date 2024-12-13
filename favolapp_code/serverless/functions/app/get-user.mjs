import { DynamoDBClient, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const { USERS_TABLE, PAZIENTI_TUTOR_TABLE } = process.env;
const dynamoDB = new DynamoDBClient();

function mapDynamoDBItemToUser(item) {
  return {
      id: item.id.S,
      email: item.email.S,
      name: item.name.S,
      surname: item.surname.S,
      role: item.role.S,
      birthdate: item.birthdate.S,
      phone_number: item.phone_number.S,
      gender: item.gender.S,
      codfis: item.codfis.S,
      provincia: item.provincia.S,
      comune: item.comune.S,
      title: item.title.S,
      createdAt: item.createdAt.S,
      updatedAt: item.updatedAt.S,
      active: item.active ? item.active.S : "false",
      pazientiCount: parseInt(item.pazientiCount.N, 10),
      tasksCount: parseInt(item.tasksCount.N, 10),
      reportsCount: parseInt(item.reportsCount.N, 10),
      avatarURL: item.avatarURL ? item.avatarURL.S : null
  };
}

export const handler = async (event, context, callback) => {
 try{

    const myGroup = event.identity.groups[0];
    const myId = event.identity.username;
    
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

    if(myGroup === 'tutor'){

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
       ":userId": { S: event.arguments.userId }
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
       throw new Error("Unauthorized");
     }

    }
    
    const user = mapDynamoDBItemToUser(data.Item);
    callback(null, user);

  } catch (error) {

    callback(error, error);
   
 }
};
