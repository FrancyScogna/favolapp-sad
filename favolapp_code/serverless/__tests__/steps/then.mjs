import * as dotenv from 'dotenv';
import { JwksClient } from 'jwks-rsa';
import jwt from 'jsonwebtoken'
import { BatchGetItemCommand, DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { AdminGetUserCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

dotenv.config();
const { JWKS_URI, USERS_TABLE, COGNITO_USER_POOL_ID, AWS_REGION, PAZIENTI_TABLE, SESSIONS_TABLE, PAZIENTI_TUTOR_TABLE, REPORTS_TABLE } = process.env;
const dynamoDB = new DynamoDBClient();
const cognito = new CognitoIdentityProviderClient({ region: AWS_REGION });


export const verifyAccessToken = async (token) => {

  const client = new JwksClient({
    jwksUri: JWKS_URI,
  });

  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err, null);
      } else {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      }
    });
  };

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
        if (err) {
          reject(err);
        } else {
          resolve(decodedToken);
        }
      });
    });

    return decoded;
  } catch (err) {
    throw err;
  }

}

export const user_exists_in_UsersTable = async (userId) => {

  const getItemParams = {
    TableName: USERS_TABLE,
    Key: {
      id: {
        S: userId,
    }
    }
  };

  try{

    const getItemCommand = new GetItemCommand(getItemParams);
    const data = await dynamoDB.send(getItemCommand);
    return {
      result: true,
      user: data.Item
    }

  }catch(error){
    return {
      result: false,
      user: null
    };
  }

}

export const user_exists_in_Cognito = async (userId) => {

  try {

    const command = new AdminGetUserCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: userId
    });


    const response = await cognito.send(command);
    return {
      result: true,
      user: response,
    };
  } catch (error) {
    if (error.name === "UserNotFoundException") {
      return {
        result: false,
        user: null,
      };
    }
  }

}

export const patient_exists_in_PazientiTable = async (pazienteId) => {

  const getItemParams = {
    TableName: PAZIENTI_TABLE,
    Key: {
      id: {
        S: pazienteId,
    }
    }
  };

  try{

    const getItemCommand = new GetItemCommand(getItemParams);
    const data = await dynamoDB.send(getItemCommand);
    return {
      result: true,
      paziente: data.Item
    }

  }catch(error){
    return {
      result: false,
      paziente: null
    };
  }

}

export const sessions_exists_in_SessionsTable = async(sessionsIds) => {

  try {

    const keys = sessionsIds.map((id) => ({ id: { S: id } }));

    const params = {
      RequestItems: {
        [SESSIONS_TABLE]: {
          Keys: keys,
        },
      },
    };

    const response = await dynamoDB.send(new BatchGetItemCommand(params));

    const retrievedItems = response.Responses[SESSIONS_TABLE] || [];
    const retrievedIds = retrievedItems.map((item) => item.id.S);

    const allFound = sessionsIds.every((id) => retrievedIds.includes(id));

    if (allFound) {
      return {
        result: true,
        sessions: retrievedItems,
      };
    } else {
      return {
        result: false,
        sessions: null,
      };
    }
  } catch (error) {
    return {
      result: false,
      sessions: null,
    };
  }

}

export const items_exists_in_PazientiTutorTable = async(pazienteId, tutorIds) => {

  try {

    // Prepara le chiavi composite da cercare
    const keys = tutorIds.map((userId) => ({
      pazienteId: { S: pazienteId },
      userId: { S: userId },
    }));

    const params = {
      RequestItems: {
        [PAZIENTI_TUTOR_TABLE]: {
          Keys: keys,
        },
      },
    };

    const response = await dynamoDB.send(new BatchGetItemCommand(params));

    const retrievedItems = response.Responses[PAZIENTI_TUTOR_TABLE] || [];

    return {
      result: true,
      items: retrievedItems
    };
  } catch (error) {
    console.error("Errore durante il recupero degli elementi:", error);
    return {
      result: false,
      items: null,
    };
  }
  
};

export const report_exists_in_ReportsTable = async (pazienteId, reportId) => {
  try {
    const params = {
      TableName: REPORTS_TABLE,
      Key: {
        pazienteId: { S: pazienteId }, 
        reportId: { S: reportId }, 
      },
    };

    const response = await dynamoDB.send(new GetItemCommand(params));

    if (response.Item) {
      return {
        result: true,
        report: response.Item,
      };
    } else {
      return {
        result: false,
        report: null,
      };
    }
  } catch (error) {
    console.error("Errore durante il controllo del report:", error);
    return {
      result: false,
      report: null,
    };
  }
};