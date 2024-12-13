const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

  //Controllo se avviare la challenge dei termini e condizioni
  const params = {
    TableName: 'UsersTable',
    Key: {
      id: event.userName,
    },
    ProjectionExpression: 'accept_terms, terms_version',
  };
  const data = await dynamoDB.get(params).promise();
  let generate_terms_and_conditions_challenge = false;
  if (data.Item) {
    if (!data.Item.accept_terms) {
      generate_terms_and_conditions_challenge = true;
    } else {
      if (data.Item.terms_version !== '1') {
        generate_terms_and_conditions_challenge = true;
      }
    }
  } else {
    generate_terms_and_conditions_challenge = true;
  }

  //Imposto l'index della sessione che punta all'ultimo elemento della sessione
  const index = event.request.session.length - 1;

  //Prima challenge: SRP_A
  if (event.request.session[index].challengeName == 'SRP_A') {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'PASSWORD_VERIFIER';
  }

  //Seconda challenge: PASSWORD_VERIFIER
  if (
    event.request.session[index].challengeName == 'PASSWORD_VERIFIER' &&
    event.request.session[index].challengeResult == true
  ) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    if (generate_terms_and_conditions_challenge) {
      event.response.challengeName = 'CUSTOM_CHALLENGE';
    }
  }

  //Terza challenge: MFA con codice dall'applicazione
  if (
    event.request.session[index].challengeName == 'SOFTWARE_TOKEN_MFA' &&
    event.request.session[index].challengeResult == true
  ) {
    //Se c'è bisogno della custom challenge allora la imposto come successiva
    if (generate_terms_and_conditions_challenge) {
      event.response.challengeName = 'CUSTOM_CHALLENGE';
      event.response.failAuthentication = false;
      event.response.issueTokens = false;
    } else {
      event.response.failAuthentication = false;
      event.response.issueTokens = true;
    }
  }

  //Se impostata precedentemente verrà avviata la custom challenge
  if (
    event.request.session[index].challengeName == 'CUSTOM_CHALLENGE' &&
    event.request.session[index].challengeResult == true
  ) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  }

  context.done(null, event);
};
