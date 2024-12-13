import { DynamoDBClient, QueryCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDBClient();
const { REPORTS_TABLE, PAZIENTI_TABLE, USERS_TABLE } = process.env;

export const handler = async (event, context) => {
  const otherUserId = event.arguments.otherUserId;
  const limit = event.arguments.limit || 10;
  const nextToken = event.arguments.nextToken ? JSON.parse(Buffer.from(event.arguments.nextToken, 'base64').toString('utf8')) : null;

  let reportItems = [];
  let lastEvaluatedKey = nextToken;

  try {
    const queryCommand = new QueryCommand({
      TableName: REPORTS_TABLE,
      IndexName: 'TutorIndex',
      KeyConditionExpression: 'tutorId = :otherUserId',
      ExpressionAttributeValues: {
        ':otherUserId': { S: otherUserId },
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const reportsResult = await dynamoDB.send(queryCommand);

    if (reportsResult.Items) {
      reportItems = reportsResult.Items;
    }
    lastEvaluatedKey = reportsResult.LastEvaluatedKey;
  } catch (error) {
    console.error('Error querying ReportsTable:', error);
    context.done(error);
    return;
  }


  const detailedReports = await Promise.all(reportItems.map(async (report) => {
    const pazienteCommand = new GetItemCommand({
      TableName: PAZIENTI_TABLE,
      Key: {
        id: { S: report.pazienteId.S },
      },
    });

    const tutorCommand = new GetItemCommand({
      TableName: USERS_TABLE,
      Key: {
        id: { S: report.tutorId.S },
      },
    });

    try {
      const pazienteResult = await dynamoDB.send(pazienteCommand);

      const tutorResult = await dynamoDB.send(tutorCommand);

      if (!pazienteResult.Item) {
        console.error(`Paziente with id ${report.pazienteId.S} not found.`);
        return null;
      }

      if (!tutorResult.Item) {
        console.error(`Tutor with id ${report.tutorId.S} not found.`);
        return null;
      }

      return {
        reportId: report.reportId.S,
        pazienteId: report.pazienteId.S,
        tutorId: report.tutorId.S,
        description: report.description.S,
        seenBy: report.seenBy.SS,
        contenuto: report.contenuto.S,
        createdAt: report.createdAt.S,
        updatedAt: report.updatedAt.S,
        paziente: {
          id: pazienteResult.Item.id.S,
          name: pazienteResult.Item.name.S,
          surname: pazienteResult.Item.surname.S,
          birthdate: pazienteResult.Item.birthdate.S,
          phone_number: pazienteResult.Item.phone_number ? pazienteResult.Item.phone_number.S : null,
          gender: pazienteResult.Item.gender.S,
          email: pazienteResult.Item.email ? pazienteResult.Item.email.S : null,
          codfis: pazienteResult.Item.codfis.S,
          provincia: pazienteResult.Item.provincia.S,
          comune: pazienteResult.Item.comune.S,
          info: pazienteResult.Item.info ? pazienteResult.Item.info.S : null,
          treatment: pazienteResult.Item.treatment.S,
          sessionsCount: pazienteResult.Item.sessionsCount.N,
          tutorsCount: pazienteResult.Item.tutorsCount.N,
        },
        tutor: {
          id: tutorResult.Item.id.S,
          email: tutorResult.Item.email.S,
          name: tutorResult.Item.name.S,
          surname: tutorResult.Item.surname.S,
          role: tutorResult.Item.role.S,
          birthdate: tutorResult.Item.birthdate.S,
          phone_number: tutorResult.Item.phone_number ? tutorResult.Item.phone_number.S : null,
          gender: tutorResult.Item.gender.S,
          codfis: tutorResult.Item.codfis.S,
          provincia: tutorResult.Item.provincia.S,
          comune: tutorResult.Item.comune.S,
          title: tutorResult.Item.title.S,
          createdAt: tutorResult.Item.createdAt.S,
          updatedAt: tutorResult.Item.updatedAt.S,
          pazientiCount: tutorResult.Item.pazientiCount.N,
          tasksCount: tutorResult.Item.tasksCount.N,
          reportsCount: tutorResult.Item.reportsCount.N,
          avatarURL: tutorResult.Item.avatarURL ? tutorResult.Item.avatarURL.S : null,
        },
      };
    } catch (error) {
      console.error('Error fetching detailed information:', error);
      return null;
    }
  }));

  context.done(null, {
    items: detailedReports.filter(report => report !== null),
    nextToken: lastEvaluatedKey ? Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64') : null,
  });
};
