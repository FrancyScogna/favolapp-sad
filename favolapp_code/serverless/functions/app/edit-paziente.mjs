import { DynamoDBClient, BatchWriteItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { ulid } from 'ulid';

const { USERS_TABLE, PAZIENTI_TABLE, PAZIENTI_TUTOR_TABLE, SESSIONS_TABLE} = process.env;
const dynamoDB = new DynamoDBClient();

export const handler = async (event, context, callback) => {
 try{

    const { editPaziente } = event.arguments;

    const updateItemParams = {
     TableName: PAZIENTI_TABLE,
     Key: {
         id: { S: editPaziente.id }
     },
     UpdateExpression: `set #name = :name, #surname = :surname, #birthdate = :birthdate, 
     #phone_number = :phone_number, #gender = :gender, #email = :email, #codfis = :codfis, 
     #provincia = :provincia, #comune = :comune, #info = :info, #createdAt = :createdAt, 
     #updatedAt = :updatedAt, #treatment = :treatment, #sessionsCount = :sessionsCount, 
     #tutorsCount = :tutorsCount`,
     ExpressionAttributeNames: {
         "#name": "name",
         "#surname": "surname",
         "#birthdate": "birthdate",
         "#phone_number": "phone_number",
         "#gender": "gender",
         "#email": "email",
         "#codfis": "codfis",
         "#provincia": "provincia",
         "#comune": "comune",
         "#info": "info",
         "#createdAt": "createdAt",
         "#updatedAt": "updatedAt",
         "#treatment": "treatment",
         "#sessionsCount": "sessionsCount",
         "#tutorsCount": "tutorsCount"
     },
     ExpressionAttributeValues: {
         ":name": { S: editPaziente.name },
         ":surname": { S: editPaziente.surname },
         ":birthdate": { S: editPaziente.birthdate },
         ":phone_number": { S: editPaziente.phone_number },
         ":gender": { S: editPaziente.gender },
         ":email": { S: editPaziente.email },
         ":codfis": { S: editPaziente.codfis },
         ":provincia": { S: editPaziente.provincia },
         ":comune": { S: editPaziente.comune },
         ":info": { S: editPaziente.info },
         ":createdAt": { S: editPaziente.createdAt },
         ":updatedAt": { S: new Date().toJSON() },
         ":treatment": { S: editPaziente.treatment },
         ":sessionsCount": { N: String(editPaziente.sessionsCount) },
         ":tutorsCount": { N: String(editPaziente.tutorsCount) }
     },
     ReturnValues: "UPDATED_NEW"
    };

    const updateItemCommand = new UpdateItemCommand(updateItemParams);
    await dynamoDB.send(updateItemCommand);

    //Sessions
    if(editPaziente.sessions){

     const { updatedItems, addedItems, deletedItems } = editPaziente.sessions[0];

     //Create and delete
     let mapArray = [];
     if(addedItems.length > 0){
      const putRequests = addedItems.map(item => ({
       PutRequest: {
        Item: {
         id: { S: ulid() },
         pazienteId: { S: editPaziente.id },
         weekDay: { S: item.weekDay },
         startTime: { S: item.startTime },
         endTime: { S: item.endTime },
         createdAt: { S: new Date().toJSON() },
         updatedAt: { S: new Date().toJSON() }
        }
       }
      }));
      mapArray = [...mapArray, ...putRequests];
     }
     if(deletedItems.length > 0){
      const deleteRequests = deletedItems.map(item => ({
       DeleteRequest: {
        Key: {
         id: { S: item.id }
        }
       }
      }))
      mapArray = [...mapArray, ...deleteRequests];
     }

     if(mapArray.length > 0){
      const batchWriteItemParams = {
       RequestItems: {
        [SESSIONS_TABLE]: mapArray
       }
      };
      const batchWriteItemCommand = new BatchWriteItemCommand(batchWriteItemParams);
      await dynamoDB.send(batchWriteItemCommand);
     }

     //Update
     if(updatedItems.length > 0){
      const updateSessions = updatedItems.map(async(item) => {
        const updateItemParams = {
         TableName: SESSIONS_TABLE,
         Key: {
             id: { S: item.id }
         },
         UpdateExpression: `set #weekDay = :weekDay, #startTime = :startTime, #endTime = :endTime, 
         #pazienteId = :pazienteId, #createdAt = :createdAt, #updatedAt = :updatedAt`,
         ExpressionAttributeNames: {
             "#weekDay": "weekDay",
             "#startTime": "startTime",
             "#endTime": "endTime",
             "#pazienteId": "pazienteId",
             "#createdAt": "createdAt",
             "#updatedAt": "updatedAt",
         },
         ExpressionAttributeValues: {
             ":weekDay": { S: item.weekDay },
             ":startTime": { S: item.startTime },
             ":endTime": { S: item.endTime },
             ":pazienteId": { S: item.pazienteId },
             ":createdAt": { S: item.createdAt },
             ":updatedAt": { S: new Date().toJSON() }
         },
         ReturnValues: "UPDATED_NEW"
        };
        const updateItemCommand = new UpdateItemCommand(updateItemParams);
        await dynamoDB.send(updateItemCommand);
       })
       await Promise.all(updateSessions);
     }

    }

    //Tutors
    if(editPaziente.tutors){

     const { addedItems, deletedItems } = editPaziente.tutors[0];

     //Create and delete
     let mapArray = [];
     if(addedItems.length > 0){
      const putRequests = addedItems.map(item => ({
       PutRequest: {
        Item: {
         userId: { S: item.id },
         pazienteId: { S: editPaziente.id },
         createdAt: { S: new Date().toJSON() },
         updatedAt: { S: new Date().toJSON() }
        }
       }
      }));
      mapArray = [...mapArray, ...putRequests];

      const updatePazientiCount = addedItems.map(async(item) => {
       const updateItemParams = {
        TableName: USERS_TABLE,
        Key: { id: { S: item.id } },
        UpdateExpression: `SET pazientiCount = pazientiCount + :increment`,
        ExpressionAttributeValues: { ":increment": { N: String(1) } },
        ReturnValues: 'UPDATED_NEW'
       };
       const updateItemCommand = new UpdateItemCommand(updateItemParams);
       await dynamoDB.send(updateItemCommand);
      })
      await Promise.all(updatePazientiCount);
     }

     if(deletedItems.length > 0){
      const deleteRequests = deletedItems.map(item => ({
       DeleteRequest: {
        Key: {
         userId: { S: item.id },
         pazienteId: { S: editPaziente.id }
        }
       }
      }))
      mapArray = [...mapArray, ...deleteRequests];

      const updatePazientiCount = deletedItems.map(async(item) => {
       const updateItemParams = {
        TableName: USERS_TABLE,
        Key: { id: { S: item.id } },
        UpdateExpression: `SET pazientiCount = pazientiCount - :decrement`,
        ExpressionAttributeValues: { ":decrement": { N: String(1) } },
        ReturnValues: 'UPDATED_NEW'
       };
       const updateItemCommand = new UpdateItemCommand(updateItemParams);
       await dynamoDB.send(updateItemCommand);
      })
      await Promise.all(updatePazientiCount);
     }

     if(mapArray.length > 0){
      const batchWriteItemParams = {
       RequestItems: {
        [PAZIENTI_TUTOR_TABLE]: mapArray
       }
      };
      const batchWriteItemCommand = new BatchWriteItemCommand(batchWriteItemParams);
      await dynamoDB.send(batchWriteItemCommand);
     }

    }

    context.done(null, true);

  } catch (error) {

    callback(error, error);
   
 }
};
