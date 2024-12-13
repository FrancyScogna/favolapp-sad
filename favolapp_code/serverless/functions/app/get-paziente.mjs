import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const { PAZIENTI_TABLE, PAZIENTI_TUTOR_TABLE } = process.env;
const dynamoDB = new DynamoDBClient();

export const handler = async (event, context, callback) => {
 try {

    const { pazienteId } = event.arguments;
    const myId = event.identity.username;
    const myGroup = event.identity.groups[0];

    if (myGroup === 'tutor'){
     const getItemParams = {
      TableName: PAZIENTI_TUTOR_TABLE,
      Key: {
        pazienteId: { S: pazienteId },
        userId: { S: myId }
      }
     }

     const getItemCommand = new GetItemCommand(getItemParams);
     const getItemResult = await dynamoDB.send(getItemCommand);

     if(!getItemResult.Item){
      throw new Error('Unauthorized');
     }
    }

    const getItemParams = {
     TableName: PAZIENTI_TABLE,
     Key: {
       id: { S: pazienteId }
     }
    }

    const getItemCommand = new GetItemCommand(getItemParams);
    const getItemResult = await dynamoDB.send(getItemCommand);

    if(!getItemResult.Item){
     throw new Error("Paziente not exists");
    }

    const paziente = getItemResult.Item;

    const result = {
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
    
    callback(null, result);

  } catch (error) {

    callback(error, error);

 }
};
