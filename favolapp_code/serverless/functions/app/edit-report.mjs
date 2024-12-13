import { DynamoDBClient, UpdateItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDBClient();

const { REPORTS_TABLE } = process.env;

export const handler = async (event, context, callback) => {
  try {
    const { reportId, description, contenuto } = event.arguments;

    // Verifica che i valori siano definiti
    if (!reportId || !description || !contenuto) {
      throw new Error('Missing required fields: reportId, description, contenuto');
    }

    // Trova il report con il reportId dato usando il nuovo indice secondario
    const queryParams = {
      TableName: REPORTS_TABLE,
      IndexName: 'ReportIndex',
      KeyConditionExpression: 'reportId = :reportId',
      ExpressionAttributeValues: {
        ':reportId': { S: reportId }
      }
    };

    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await dynamoDB.send(queryCommand);

    if (queryResult.Items.length === 0) {
      throw new Error(`Report with reportId ${reportId} not found`);
    }

    const pazienteId = queryResult.Items[0].pazienteId.S;

    // Aggiorna la descrizione e il contenuto del report
    const updateItemParams = {
      TableName: REPORTS_TABLE,
      Key: {
        pazienteId: { S: pazienteId },
        reportId: { S: reportId }
      },
      UpdateExpression: 'set #description = :description, #contenuto = :contenuto, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#description': 'description',
        '#contenuto': 'contenuto',
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':description': { S: description },
        ':contenuto': { S: contenuto },
        ':updatedAt': { S: new Date().toISOString() }
      },
      ReturnValues: 'UPDATED_NEW'
    };

    const updateItemCommand = new UpdateItemCommand(updateItemParams);
    const updateResult = await dynamoDB.send(updateItemCommand);

    callback(null, {
      ...updateResult.Attributes,
      reportId,
      pazienteId,
      description,
      contenuto,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    callback(null, {error: { message: error.message, type: error.name}});
  }
};
