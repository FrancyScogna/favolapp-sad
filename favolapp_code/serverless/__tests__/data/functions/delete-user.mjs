import {
  AdminDeleteUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();
const { COGNITO_USER_POOL_ID, USERS_TABLE, AWS_REGION } = process.env;
const dynamoDB = new DynamoDBClient();
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });

export const handler = async (event, context, callback) => {

  const userId = event.arguments.userId;

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
    return error;
  }

  try {
    const deleteUserCommand = new AdminDeleteUserCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: userId,
    });

    await cognitoClient.send(deleteUserCommand);

  } catch (error) {
    return error;
  }

  return true;

};
