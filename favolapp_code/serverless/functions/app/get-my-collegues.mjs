import { DynamoDBClient, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const { USERS_TABLE, PAZIENTI_TUTOR_TABLE } = process.env;
const dynamoDB = new DynamoDBClient();

async function processCollegues(items) {
 const results = await Promise.all(
   items.map(async (item) => {
     const getItemParams = {
       TableName: USERS_TABLE,
       Key: { id: item.userId }
     };
     const getItemCommand = new GetItemCommand(getItemParams);
     const data = await dynamoDB.send(getItemCommand);
     const user = data.Item
     return {
      id: user.id.S,
      email: user.email.S,
      name: user.name.S,
      surname: user.surname.S,
      role: user.role.S,
      birthdate: user.birthdate.S,
      phone_number: user.phone_number.S,
      gender: user.gender.S,
      codfis: user.codfis.S,
      provincia: user.provincia.S,
      comune: user.comune.S,
      title: user.title.S,
      createdAt: user.createdAt.S,
      updatedAt: user.updatedAt.S,
      pazientiCount: parseInt(user.pazientiCount.N, 10),
      tasksCount: parseInt(user.tasksCount.N, 10),
      reportsCount: parseInt(user.reportsCount.N, 10),
      avatarURL: user.avatarURL ? user.avatarURL.S : null
     }
   })
 );
 return results;
}


export const handler = async (event, context, callback) => {
 try{
  
    const myId = event.identity.username;
    const { limit, nextToken } = event.arguments;

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

    if(!myPazienti.Items){
     callback(null, {items: [], nextToken: null});
    }

    if(myPazienti.Items.length === 0){
     callback(null, {items: [], nextToken: null});
    }

    const otherPazientiNotConcat = await Promise.all(myPazienti.Items.map(async(item) => {
     const otherQueryCommandParams = {
      TableName: PAZIENTI_TUTOR_TABLE,
      Select: 'ALL_ATTRIBUTES',
      KeyConditionExpression: 'pazienteId = :pazienteId',
      ExpressionAttributeValues: {
       ":pazienteId": { S: item.pazienteId.S }
      }
     }
     const otherQueryCommand = new QueryCommand(otherQueryCommandParams);
     return (await dynamoDB.send(otherQueryCommand))?.Items;
    }));

    if(!otherPazientiNotConcat){
     callback(null, {items: [], nextToken: null});
    }

    if(otherPazientiNotConcat.length === 0){
     callback(null, {items: [], nextToken: null});
    }

    const otherPazienti = otherPazientiNotConcat.flat();
    const myColleguesDuplicated = otherPazienti.filter(item => item.userId.S !== myId);

    const myCollegues = myColleguesDuplicated.reduce((acc, item) => {
     if (!acc.some(existingItem => existingItem.userId.S === item.userId.S)) {
       acc.push(item);
     }
     return acc;
   }, []);

    if(!myCollegues){
     callback(null, {items: [], nextToken: null});
    }

    if(myCollegues.length === 0){
     callback(null, {items: [], nextToken: null});
    }

    let myColleguesUnfetched = myCollegues;
    let myColleguesFetched = await processCollegues(myCollegues);

    let newNextToken = null;
    if(nextToken){
     const lastElement = JSON.parse(nextToken);
     const index = myColleguesUnfetched.findIndex(item => item.userId.S === lastElement.userId.S);
     if (index !== -1) {
      let nextElementsUnfatched = null;
      let nextElementsFatched = null;
      if(limit){
       nextElementsUnfatched = myColleguesUnfetched.slice(index + 1, index + 1 + limit);
       nextElementsFatched = myColleguesFetched.slice(index + 1, index + 1 + limit);
       if(nextElementsUnfatched.length > 0){
        newNextToken = nextElementsUnfatched[nextElementsUnfatched.length - 1];
        newNextToken = JSON.stringify(newNextToken);
       }
      }else{
       nextElementsFatched = myColleguesFetched.slice(index + 1);
      }
      callback(null, {items: nextElementsFatched, nextToken: newNextToken});
     } else {
       throw new Error('nextToken non valido');
     }
    }

    if(limit){
     const limitElements = myColleguesFetched.slice(0, limit );
     const limitElementsUnfetched = myColleguesUnfetched.slice(0, limit );
     if(limitElements.length > 0 ){
      const lastElement = limitElementsUnfetched[ limitElementsUnfetched.length - 1 ];
      newNextToken = JSON.stringify(lastElement);
     }
     callback(null, {items: limitElements, nextToken: newNextToken});
    }

    callback(null, {items: myColleguesFetched, nextToken: null});

  } catch (error) {

    callback(error, error);
   
 }
};
