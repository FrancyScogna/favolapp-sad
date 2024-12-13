const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  if (
    event.request.privateChallengeParameters.answer ==
    event.request.challengeAnswer
  ) {
    const params = {
      TableName: 'UsersTable', // Sostituisci con il nome della tua tabella DynamoDB
      Key: {
        id: event.userName,
      },
      UpdateExpression:
        'SET accept_terms = :accept_terms, terms_version = :terms_version', // Specifica gli attributi da aggiornare e i valori da assegnare
      ExpressionAttributeValues: {
        ':accept_terms': true,
        ':terms_version': '1',
      },
      ReturnValues: 'UPDATED_NEW', // Restituisci i nuovi valori aggiornati
    };
    const data = await dynamoDB.update(params).promise();
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }

  context.done(null, event);
};
