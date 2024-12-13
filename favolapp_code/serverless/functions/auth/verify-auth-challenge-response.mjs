import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
const dynamoDB = new DynamoDBClient();

const { USERS_TABLE, TERMS_VERSION } = process.env;

export const handler = async (event, context) => {
  if (
    event.request.privateChallengeParameters.answer ==
    event.request.challengeAnswer
  ) {
    const params = {
      TableName: USERS_TABLE, // Sostituisci con il nome della tua tabella DynamoDB
      Key: {
        id: {
          S: event.userName,
        },
      },
      UpdateExpression:
        'SET accept_terms = :accept_terms, terms_version = :terms_version', // Specifica gli attributi da aggiornare e i valori da assegnare
      ExpressionAttributeValues: {
        ':accept_terms': {
          BOOL: true,
        },
        ':terms_version': {
          S: TERMS_VERSION,
        },
      },
      ReturnValues: 'UPDATED_NEW', // Restituisci i nuovi valori aggiornati
    };
    const command = new UpdateItemCommand(params);
    await dynamoDB.send(command);
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }

  context.done(null, event);
};
