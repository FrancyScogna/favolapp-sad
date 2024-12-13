import {
  AdminDeleteUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const { USERS_TABLE, USER_POOL_ID, REGION } = process.env;
const dynamoDB = new DynamoDBClient();
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

export const handler = async (event, context, callback) => {
  const userId = event.arguments.userId;

  if (!userId) {
    callback(null, {error: { message: "userId non fornito.", type: "EmptyParamException"}});
  }

  try{
    const updateItemParams = {
      TableName: USERS_TABLE,
      Key: {
        id: { S: userId }
      },
      UpdateExpression: 'SET #active = :defaultValue',
      ExpressionAttributeNames: {
        '#active': 'active'
      },
      ExpressionAttributeValues: {
        ':defaultValue': { S: 'true' }
      },
      ReturnValues: 'ALL_NEW'
    };

    const updateItemCommand = new UpdateItemCommand(updateItemParams);
    await dynamoDB.send(updateItemCommand);

  }catch(error){
    console.error("Errore durante l'aggiornamento dell'utente:", error);
    callback(null, {error: { message: error.message, type: error.name}});
  }

  try {
    const deleteUserCommand = new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: userId,
    });

    await cognitoClient.send(deleteUserCommand);

  } catch (error) {
    console.error("Errore durante l'eliminazione dell'utente:", error);
    callback(null, {error: { message: error.message, type: error.name}});
  }

  return true;

};
