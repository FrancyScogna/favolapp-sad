import { DynamoDBClient, BatchGetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const { USERS_TABLE, PAZIENTI_TUTOR_TABLE } = process.env;
const dynamoDB = new DynamoDBClient();

export const handler = async (event, context, callback) => {
 try{

    const pazienteId = event.source.id;

    const otherQueryCommandParams = {
     TableName: PAZIENTI_TUTOR_TABLE,
     Select: 'ALL_ATTRIBUTES',
     KeyConditionExpression: 'pazienteId = :pazienteId',
     ExpressionAttributeValues: {
      ":pazienteId": { S: pazienteId }
     }
    }
    const queryCommand = new QueryCommand(otherQueryCommandParams);
    const queryResult = await dynamoDB.send(queryCommand);

    if(!queryResult.Items){
     callback(null, []);
    }

    const tutorsIdArray = queryResult.Items.map(item => ({ id: item.userId }));

    if(tutorsIdArray.length > 0 ){

      const batchGetItemParam = {
      RequestItems: { 
        [USERS_TABLE]: { 
        Keys: tutorsIdArray 
        }
      }
      }

      const batchGetItemCommand = new BatchGetItemCommand(batchGetItemParam);
      const batchGetItemResult = await dynamoDB.send(batchGetItemCommand);
      
      const tutors = batchGetItemResult.Responses[USERS_TABLE];

      const tutorTransformed = tutors.map(item => ({
      id: item.id.S,
      provincia: item.provincia.S,
      comune: item.comune.S,
      createdAt: item.createdAt.S,
      email: item.email.S,
      name: item.name.S,
      gender: item.gender.S,
      reportsCount: parseInt(item.reportsCount.N, 10),
      pazientiCount: parseInt(item.pazientiCount.N, 10),
      birthdate: item.birthdate.S,
      role: item.role.S,
      surname: item.surname.S,
      updatedAt: item.updatedAt.S,
      codfis: item.codfis.S,
      phone_number: item.phone_number.S,
      tasksCount: parseInt(item.tasksCount.N, 10),
      title: item.title.S
      }));

      callback(null, tutorTransformed);

    }else{

      callback(null, []);

    }

  } catch (error) {

    callback(error, error);
   
 }
};
