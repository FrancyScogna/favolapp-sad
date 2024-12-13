import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { ulid } from 'ulid';
import * as dotenv from 'dotenv';

dotenv.config();
const { USERS_TABLE, PAZIENTI_TABLE, PAZIENTI_TUTOR_TABLE, SESSIONS_TABLE} = process.env;
const dynamoDB = new DynamoDBClient();

//Creazione delle sessioni
async function processSessions(sessions, pazienteId) {
  var sessionsIdArray = [];
  if (sessions.length === 0) return;
  Promise.all(
    sessions.map(async (session) => {
      const sessionId = ulid();
      const putItemParams = {
        TableName: SESSIONS_TABLE,
        Item: {
          id: { S: sessionId },
          pazienteId: { S: pazienteId },
          weekDay: { S: session.weekDay },
          startTime: { S: session.startTime },
          endTime: { S: session.endTime },
          createdAt: { S: new Date().toJSON() },
          updatedAt: { S: new Date().toJSON() },
        },
      };
      const putItemCommand = new PutItemCommand(putItemParams);
      await dynamoDB.send(putItemCommand);
      sessionsIdArray.push(sessionId)
    })
  );
  return sessionsIdArray;
}

//Creazioni della relazione tutor-paziente
//Update dei tutors su pazientiCount (+1)
async function processTutors(tutors, pazienteId) {
  if (tutors.length === 0) return;
  return Promise.all(
    tutors.map(async (tutor) => {
      const putItemParams = {
        TableName: PAZIENTI_TUTOR_TABLE,
        Item: {
          pazienteId: { S: pazienteId },
          userId: { S: tutor.id },
          createdAt: { S: new Date().toJSON() },
          updatedAt: { S: new Date().toJSON() },
        },
      };
      const putItemCommand = new PutItemCommand(putItemParams);
      await dynamoDB.send(putItemCommand);

      const updateItemParams = {
        TableName: USERS_TABLE,
        Key: { id: { S: tutor.id } },
        UpdateExpression: `SET pazientiCount = pazientiCount + :increment`,
        ExpressionAttributeValues: { ":increment": { N: String(1) } },
        ReturnValues: 'UPDATED_NEW'
      };
      const updateItemCommand = new UpdateItemCommand(updateItemParams);
      await dynamoDB.send(updateItemCommand);

    })
  );
}

export const handler = async (event, context, callback) => {
 try{

    const {newPaziente} = event.arguments;

    const pazienteId = ulid();

    //Aggiungi paziente nella tabella
    const putItemParams = {
      TableName: PAZIENTI_TABLE,
      Item: {
        id: { S: pazienteId },
        email: { S: newPaziente.email ? newPaziente.email : '' },
        surname: { S: newPaziente.surname },
        name: { S: newPaziente.name },
        birthdate: { S: newPaziente.birthdate },
        phone_number: { S: newPaziente.phone_number ? newPaziente.phone_number : '' },
        gender: { S: newPaziente.gender },
        codfis: { S: newPaziente.codfis },
        provincia: { S: newPaziente.provincia },
        comune: { S: newPaziente.comune },
        info: { S: newPaziente.info },
        treatment:{ S: newPaziente.treatment },
        sessionsCount: { N: String(newPaziente.sessions.length) },
        tutorsCount:{ N: String(newPaziente.tutors.length) },
        createdAt: { S: new Date().toJSON() },
        updatedAt: { S: new Date().toJSON() },
      },
      ReturnValues: 'ALL_OLD'
    };
    const putItemCommand = new PutItemCommand(putItemParams);
    const paziente = (await dynamoDB.send(putItemCommand));

    //Sessioni
    var sessionsIds = [];
    if(newPaziente.sessions.length > 0){
      sessionsIds = await processSessions(newPaziente.sessions, pazienteId);
    }

    //Tutors
    if(newPaziente.tutors.length > 0){
      await processTutors(newPaziente.tutors, pazienteId);
    }

    const tutorsIds = event.arguments.newPaziente.tutors.map(item => item = item.id)

    return {
      result: true,
      pazienteId,
      sessionsIds,
      tutorsIds
    }

  } catch (error) {
    return {
      result: false,
      paziente: null,
      sessions: null,
      tutors: null
    }
   
 }
};
