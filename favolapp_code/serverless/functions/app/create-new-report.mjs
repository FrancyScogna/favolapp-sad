import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { ulid } from 'ulid';

const { REPORTS_TABLE, USERS_TABLE, PAZIENTI_TUTOR_TABLE } = process.env;
const dynamoDB = new DynamoDBClient();

export const handler = async (event, context, callback) => {
  try {
    const { pazienteId, description, contenuto, tutorId } = event.arguments;

    if (!tutorId) {
      throw new Error("Missing tutorId in the arguments");
    }

    const params = {
      TableName: PAZIENTI_TUTOR_TABLE,
      IndexName: 'UserIndex',
      Select: 'ALL_ATTRIBUTES',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ":userId": { S: tutorId }
      },
    };

    const response = await dynamoDB.send(new QueryCommand(params));

    const myPazientiIds = response.Items.map((item) =>
      item.pazienteId.S
    );

    const filteredIds = myPazientiIds.filter(id => id === pazienteId);

    if(filteredIds){
      if(filteredIds.length === 0){
        throw new Error("Is not your patient.");
      }
    }

    const reportId = ulid();

    // Aggiungi report nella tabella
    const putItemParams = {
      TableName: REPORTS_TABLE,
      Item: {
        reportId: { S: reportId },
        pazienteId: { S: pazienteId },
        description: { S: description },
        contenuto: { S: contenuto },
        tutorId: { S: tutorId },
        seenBy: { SS: [tutorId] },
        createdAt: { S: new Date().toJSON() },
        updatedAt: { S: new Date().toJSON() }, 
      },
    };

    const putItemCommand = new PutItemCommand(putItemParams);
    await dynamoDB.send(putItemCommand);

    // Incrementa il reportsCount per il tutor
    const updateItemParams = {
      TableName: USERS_TABLE,
      Key: { id: { S: tutorId } },
      UpdateExpression: 'SET reportsCount = reportsCount + :increment',
      ExpressionAttributeValues: { ':increment': { N: '1' } },
      ReturnValues: 'UPDATED_NEW',
    };
    const updateItemCommand = new UpdateItemCommand(updateItemParams);
    await dynamoDB.send(updateItemCommand);

    context.done(null, true);
  } catch (error) {
    callback(null, {error: { message: error.message, type: error.name}});
  }
};
