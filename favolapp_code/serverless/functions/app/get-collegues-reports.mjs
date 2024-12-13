import { DynamoDBClient, QueryCommand, BatchGetItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDBClient();
const { REPORTS_TABLE, PAZIENTI_TABLE, USERS_TABLE, PAZIENTI_TUTOR_TABLE } = process.env;

function parseDynamoDBItem(item) {
  if (typeof item !== 'object' || item === null) return item;

  if (Array.isArray(item)) {
    return item.map(parseDynamoDBItem);
  }

  const parsedItem = {};
  for (const key in item) {
    const value = item[key];
    // Controlla se il valore è un oggetto DynamoDB
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Estrai il valore effettivo (ad es., { S: "value" } -> "value")
      const dynamoType = Object.keys(value)[0]; // "S", "N", "BOOL", ecc.
      parsedItem[key] = value[dynamoType];
    } else {
      // Altrimenti, ricorsivamente analizza
      parsedItem[key] = parseDynamoDBItem(value);
    }
  }
  return parsedItem;
}

export const handler = async (event) => {
  const limit = event.arguments.limit || 1000;
  const nextToken = event.arguments.nextToken
    ? JSON.parse(Buffer.from(event.arguments.nextToken, 'base64').toString('utf8'))
    : null;

  let reports = [];
  let myPazientiItems = [];
  let lastEvaluatedKey = nextToken;

  try {
    const myQueryCommandParams = {
      TableName: PAZIENTI_TUTOR_TABLE,
      IndexName: 'UserIndex',
      Select: 'ALL_ATTRIBUTES',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ":userId": { S: event.identity.sub },
      },
    };

    const myQueryCommand = new QueryCommand(myQueryCommandParams);
    const myPazienti = await dynamoDB.send(myQueryCommand);
    myPazientiItems = myPazienti.Items || [];

  } catch (error) {
    console.error('Error querying PazientiTutorTable:', error);
    throw new Error('Error fetching pazienti.');
  }

  if (myPazientiItems.length === 0) {
    return {
      items: [],
      nextToken: null,
    };
  }

  try {
    for (const paziente of myPazientiItems) {
      const pazienteId = paziente.pazienteId.S;

      const reportsQueryParams = {
        TableName: REPORTS_TABLE,
        IndexName: 'PazienteIndex',
        KeyConditionExpression: 'pazienteId = :pazienteId',
        ExpressionAttributeValues: {
          ":pazienteId": { S: pazienteId },
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      };

      const reportsQueryCommand = new QueryCommand(reportsQueryParams);
      const reportsResult = await dynamoDB.send(reportsQueryCommand);

      if (reportsResult.Items) {
        reports.push(...reportsResult.Items);
      }

      lastEvaluatedKey = reportsResult.LastEvaluatedKey;

      if (reports.length >= limit) {
        break;
      }
    }
  } catch (error) {
    console.error('Error querying ReportsTable:', error);
    throw new Error('Error fetching reports.');
  }

  if (reports.length === 0) {
    return {
      items: [],
      nextToken: null,
    };
  }

  console.log("Reports");
  reports.map(item => console.log("item", item));

  const pazienteIds = [...new Set(reports.map(report => report.pazienteId.S))];
  const tutorIds = [...new Set(reports.map(report => report.tutorId.S))];

  console.log("PazienteIds");
  pazienteIds.map(item => console.log(item));
  console.log("TutorIds");
  tutorIds.map(item => console.log(item));

  try {
    const batchGetParams = {
      RequestItems: {
        [PAZIENTI_TABLE]: {
          Keys: pazienteIds.map(id => ({ id: { S: id } })),
        },
        [USERS_TABLE]: {
          Keys: tutorIds.map(id => ({ id: { S: id } })),
        },
      },
    };


    const batchResult = await dynamoDB.send(new BatchGetItemCommand(batchGetParams));

    console.log("BatchResult");
    console.log("PazientiTableBatch");
    batchResult.Responses[PAZIENTI_TABLE].map(item => console.log(item));
    console.log("UsersTableBatch");
    batchResult.Responses[USERS_TABLE].map(item => console.log(item));
    
    const pazienteMap = Object.fromEntries(
      (batchResult.Responses[PAZIENTI_TABLE] || []).map(item => [item.id.S, item])
    );
    const tutorMap = Object.fromEntries(
      (batchResult.Responses[USERS_TABLE] || []).map(item => [item.id.S, item])
    );

    const detailedReports = reports.map(report => ({
      reportId: report.reportId.S,
      paziente: pazienteMap[report.pazienteId.S] || null,
      tutor: tutorMap[report.tutorId.S] || null,
      pazienteId: report.pazienteId.S,
      tutorId: report.tutorId.S,
      description: report.description.S,
      contenuto: report.contenuto.S,
      createdAt: report.createdAt.S,
      updatedAt: report.updatedAt.S,
      seenBy: report.seenBy.SS
    }));

    const formattedReports = detailedReports.map(report => ({
      ...report,
      paziente: report.paziente ? parseDynamoDBItem(report.paziente) : null,
      tutor: report.tutor ? parseDynamoDBItem(report.tutor) : null,
    }));

    console.log("DetailedReports");
    formattedReports.map(item => console.log(item));

    return {
      items: formattedReports,
      nextToken: lastEvaluatedKey ? Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64') : null,
    };
  } catch (error) {
    console.error('Error fetching detailed information:', error);
    throw new Error('Error fetching additional details.');
  }
};
