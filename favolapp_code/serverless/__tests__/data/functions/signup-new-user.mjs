import {
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
dotenv.config();

const { COGNITO_USER_POOL_ID, USERS_TABLE, AWS_REGION } = process.env;

const dynamoDB = new DynamoDBClient();
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });

function generateRandomPassword(length) {
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const specialChars = '^$*.[]{}()?-"!@#%&/\\,><\':;|_~`+=';
  const numberChars = '0123456789';

  function getRandomChar(charSet) {
    const randomIndex = Math.floor(Math.random() * charSet.length);
    return charSet[randomIndex];
  }

  const passwordArray = [
    getRandomChar(upperCaseChars),
    getRandomChar(lowerCaseChars),
    getRandomChar(specialChars),
    getRandomChar(numberChars),
  ];

  const allChars = upperCaseChars + lowerCaseChars + specialChars + numberChars;
  for (let i = passwordArray.length; i < length; i++) {
    passwordArray.push(getRandomChar(allChars));
  }

  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

export const handler = async (event, context, callback) => {
  const newUser = event.arguments.newUser;

  const temporaryPassword = generateRandomPassword(10);
  const cognitoNewUser = {
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: newUser.email,
    UserAttributes: [
      { Name: 'email', Value: newUser.email },
      { Name: 'email_verified', Value: 'true' },
    ],
    DesiredDeliveryMediums: ['EMAIL'],
    TemporaryPassword: temporaryPassword,
  };

  try {
    // Crea un nuovo utente in Cognito User Pool
    const createUserCommand = new AdminCreateUserCommand(cognitoNewUser);
    const createUserResponse = await cognitoClient.send(createUserCommand);

    // Aggiungi l'utente al gruppo specificato
    const addUserToGroupParams = {
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: newUser.email,
      GroupName: newUser.role.toLowerCase(),
    };

    const addUserToGroupCommand = new AdminAddUserToGroupCommand(
      addUserToGroupParams
    );
    await cognitoClient.send(addUserToGroupCommand);

    // Inserisci le informazioni dell'utente in DynamoDB
    const userId = createUserResponse.User.Attributes.find(
      (attr) => attr.Name === 'sub'
    );
    const putItemParams = {
      TableName: USERS_TABLE,
      Item: {
        id: { S: userId.Value },
        email: { S: newUser.email },
        surname: { S: newUser.surname },
        name: { S: newUser.name },
        role: { S: newUser.role },
        birthdate: { S: newUser.birthdate },
        phone_number: { S: newUser.phone_number },
        gender: { S: newUser.gender },
        codfis: { S: newUser.codfis },
        provincia: { S: newUser.provincia },
        comune: { S: newUser.comune },
        title: { S: newUser.title },
        pazientiCount: { N: '0' },
        tasksCount: { N: '0' },
        reportsCount: { N: '0' },
        createdAt: { S: new Date().toJSON() },
        updatedAt: { S: new Date().toJSON() },
        active: {S: "false"}
      },
    };

    const putItemCommand = new PutItemCommand(putItemParams);
    await dynamoDB.send(putItemCommand);

    return {
      result: true,
      userId: userId.Value
    }
  } catch (error) {
    return error
  }
};
