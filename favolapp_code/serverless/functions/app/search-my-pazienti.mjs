import { DynamoDBClient, GetItemCommand, QueryCommand, Select } from '@aws-sdk/client-dynamodb';

const { PAZIENTI_TABLE, PAZIENTI_TUTOR_TABLE } = process.env;
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

    const {query, limit, nextToken}  = event.arguments;
    const myId = event.identity.username;

    const queryCommandParams = {
     TableName: PAZIENTI_TUTOR_TABLE,
     IndexName: 'UserIndex',
     Select: 'ALL_ATTRIBUTES',
     KeyConditionExpression: 'userId = :userId',
     ExpressionAttributeValues: {
      ":userId": { S: myId }
    },
     Limit: limit,
     ExclusiveStartKey: nextToken ? JSON.parse(nextToken) : null
    }

    const queryCommand = new QueryCommand(queryCommandParams);
    const queryResult = await dynamoDB.send(queryCommand);

    let items = [];
    if(queryResult.Items && queryResult.Items.length > 0){
     items = await processPazienti(queryResult.Items);
     items = items.filter((item) => (item.name.includes(query) || item.surname.includes(query) || item.codfis.includes(query)));
    }

    let newNextToken = null;
    if(queryResult.LastEvaluatedKey){
     newNextToken = JSON.stringify(queryResult.LastEvaluatedKey);
    }
    
    callback(null, {items, nextToken: newNextToken});

  } catch (error) {

    callback(error, error);
   
 }
};
