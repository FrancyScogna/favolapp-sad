import { Chance } from "chance";
import { generateRandomPassword, generateSessions, getInvalidSecret, getProvinciaComuneCodfis } from "../lib/lib.mjs";
import jwt from 'jsonwebtoken'
import { do_login } from "./when.mjs";
import { DynamoDBClient, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import * as dotenv from 'dotenv';

dotenv.config();
const { USERS_TABLE, PAZIENTI_TABLE, PAZIENTI_TUTOR_TABLE, REPORTS_TABLE } = process.env;
const dynamoDB = new DynamoDBClient();
const chance = new Chance();

export const an_existing_user_credentials = () => {

  const email = "francosco@hotmail.it";
  const password = "Ciao123!";

  return {
    email,
    password
  }

}

export const a_random_user_credentials = () => {

  const email = chance.email();
  const password = generateRandomPassword();

  return {
    email,
    password
  }

}

export const a_random_accessToken = () => {

  const payload = {
    sub: 'd2c59434-60c1-70fd-c34f-b806eb80f413',
    'cognito:groups': ['admin'],
    iss: 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_75OkWRxuA',
    client_id: '5hj6pjlsjj9hb5pn0mo5g42jj1',
    origin_jti: 'b69a908a-b465-45ff-921e-cdb74c31703c',
    event_id: '0d846e0b-2bbd-4b7b-856d-16fa46874ba4',
    token_use: 'access',
    scope: 'aws.cognito.signin.user.admin',
    auth_time: 1733997311,
    exp: 1734000911,
    iat: 1733997311,
    jti: '92f94410-31f1-4df8-bc40-94ca5d9c586f',
    username: 'd2c59434-60c1-70fd-c34f-b806eb80f413'
  };

  const invalidSecret = getInvalidSecret();

  const token = jwt.sign(payload, invalidSecret, { algorithm: 'RS256', header: {kid: 'WT41Cz4PRklbIroYV1lu9+dB307WsjozqXyXiTAO8dU='} });

  return token;

}

export const an_authenticated_supervisor = async () => {

  const email = "francosco@hotmail.it";
  const password = "Ciao123!";

  const authedUser = await do_login(email, password);

  return authedUser;

}

export const an_authenticated_tutor = async () => {

  const email = "scognamiglio.1997@gmail.com";
  const password = "Ciao123!";

  const authedUser = await do_login(email, password);

  return authedUser;

}

export const a_new_user = () => {

  const gender = chance.pickone(['M', 'F']);
  var fullName;
  if(gender === "M"){
    fullName = chance.name({nationality: "it", gender: 'male'});
  }else{
    fullName = chance.name({nationality: "it", gender: 'female'});
  }
  const name = fullName.split(" ")[0];
  const surname = fullName.split(" ")[1];
  const birthdate = chance.birthday().toISOString().split('T')[0];
  const email = `${name}.${surname}.${chance.letter()}${chance.letter()}${chance.letter()}@gmail.com`;

  const {provincia, comune, codfis} = getProvinciaComuneCodfis(name, surname, birthdate, gender);

  return {
      email: email.toLowerCase(),
      name: name,
      surname: surname,
      role: "TUTOR",
      birthdate: birthdate,
      phone_number: `+39 ${chance.integer({ min: 3200000000, max: 3299999999 })}`,
      gender: gender,
      codfis: codfis,
      provincia: provincia,
      comune: comune,
      title: chance.pickone(['Psicologo', 'Logopedista', 'Educatore'])
  }
}

export const a_new_paziente = async () => {

  const gender = chance.pickone(['M', 'F']);
  var fullName;
  if(gender === "M"){
    fullName = chance.name({nationality: "it", gender: 'male'});
  }else{
    fullName = chance.name({nationality: "it", gender: 'female'});
  }
  const name = fullName.split(" ")[0];
  const surname = fullName.split(" ")[1];
  const birthdate = chance.birthday().toISOString().split('T')[0];
  const email = `${name}.${surname}.${chance.letter()}${chance.letter()}${chance.letter()}@gmail.com`;

  const {provincia, comune, codfis} = getProvinciaComuneCodfis(name, surname, birthdate, gender);

  const num_sessions_tutors = 3;

  const usersArray = await an_array_of_random_items_from_db(num_sessions_tutors, USERS_TABLE);

  const usersIdArray = usersArray.map((item) => ({ id: item.id }));

  const sessionsArray = generateSessions(num_sessions_tutors);
  

  return {
      email: email.toLowerCase(),
      name: name,
      surname: surname,
      birthdate: birthdate,
      phone_number: `+39 ${chance.integer({ min: 3200000000, max: 3299999999 })}`,
      gender: gender,
      codfis: codfis,
      provincia: provincia,
      comune: comune,
      info: chance.paragraph(),
      treatment: chance.pickone(["AHDH", "Autismo", "DSA"]),
      sessions: sessionsArray,
      sessionsCount: num_sessions_tutors,
      tutors: usersIdArray,
      tutorsCount: num_sessions_tutors
  }
}

export const a_random_patient = async() => {

  const patient = await an_array_of_random_items_from_db(1, PAZIENTI_TABLE);

  return patient[0];

}

export const an_array_of_random_items_from_db = async(count, tableName) => {
  try {
    
    const scanCommand = new ScanCommand({ TableName: tableName });
    const data = await dynamoDB.send(scanCommand);

    if (!data.Items || data.Items.length === 0) {
      throw new Error("La tabella DynamoDB è vuota.");
    }

    const items = data.Items.map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([key, value]) => [key, value.S || value.N || value.B || value])
      )
    );

    if (items.length < count) {
      throw new Error("Non ci sono abbastanza elementi per soddisfare la richiesta.");
    }

    const randomItems = [];
    const usedIds = new Set();

    while (randomItems.length < count) {
      const randomIndex = Math.floor(Math.random() * items.length);
      const randomItem = items[randomIndex];

      if (!usedIds.has(randomItem.id)) {
        randomItems.push(randomItem);
        usedIds.add(randomItem.id);
      }
    }

    return randomItems;
  } catch (error) {
    console.error("Errore durante l'estrazione degli elementi:", error);
    throw error;
  }
}

export const a_random_my_patient = async(tutorId) => {

  try {

    const params = {
      TableName: PAZIENTI_TUTOR_TABLE,
      IndexName: 'UserIndex',
      Select: 'ALL_ATTRIBUTES',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ":userId": { S: tutorId }
      },
    };

    const response = await dynamoDB.send(new QueryCommand(params));

    const pazienteIds = response.Items.map((item) =>
      item.pazienteId.S
    );

    if (pazienteIds.length === 0) {
      throw new Error("No pazienteId found for the given tutorId.");
    }

    // Seleziona un pazienteId casuale
    const randomIndex = Math.floor(Math.random() * pazienteIds.length);
    return pazienteIds[randomIndex];

  } catch (error) {
    console.error("Errore durante il recupero di pazienteId:", error);
    throw error;
  }

}

export const a_new_report = (tutorId, pazienteId) => {

  return {
    pazienteId,
    tutorId,
    description: chance.sentence(),
    contenuto: chance.paragraph()
  }

}

export const a_random_not_my_patient = async(tutorId) => {

  try {

    const params = {
      TableName: PAZIENTI_TUTOR_TABLE,
      IndexName: 'UserIndex',
      Select: 'ALL_ATTRIBUTES',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ":userId": { S: tutorId }
      },
    };

    const response = await dynamoDB.send(new QueryCommand(params));

    const pazienteIds = response.Items.map((item) =>
      item.pazienteId.S
    );

    const scanCommand = new ScanCommand({ TableName: PAZIENTI_TABLE });
    const data = await dynamoDB.send(scanCommand);

    const items = data.Items.map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([key, value]) => [key, value.S || value.N || value.B || value])
      )
    );

    const itemsId = items.map(item => item = item.id);

    const filteredIds = itemsId.filter(id => !pazienteIds.includes(id));
    const randomIndex = Math.floor(Math.random() * filteredIds.length);
    return filteredIds[randomIndex];

  } catch (error) {
    console.error("Errore durante il recupero di pazienteId:", error);
    throw error;
  }

}

export const a_random_my_report = async(tutorId) => {

  try {
    const params = {
      TableName: REPORTS_TABLE,
      IndexName: 'TutorIndex',
      Select: 'ALL_ATTRIBUTES',
      KeyConditionExpression: 'tutorId = :tutorId',
      ExpressionAttributeValues: {
        ":tutorId": { S: tutorId },
      },
    };

    const response = await dynamoDB.send(new QueryCommand(params));

    const reports = response.Items.map((item) => ({
      reportId: item.reportId.S,
      pazienteId: item.pazienteId.S,
      tutorId: item.tutorId.S,
      description: item.description.S,
      contenuto: item.contenuto.S
 
    }));

    if (reports.length === 0) {
      throw new Error("No reports found for the given tutorId.");
    }

    const randomIndex = Math.floor(Math.random() * reports.length);
    return reports[randomIndex];

  } catch (error) {
    console.error("Errore durante il recupero dei report:", error);
    throw error;
  }
}

export const a_random_not_my_report = async (tutorId) => {
  try {

    const paramsAllReports = {
      TableName: REPORTS_TABLE,
      Select: 'ALL_ATTRIBUTES',
    };

    const allReportsResponse = await dynamoDB.send(new ScanCommand(paramsAllReports));
    const allReports = allReportsResponse.Items.map((item) => ({
      reportId: item.reportId.S,
      pazienteId: item.pazienteId.S,
      tutorId: item.tutorId.S,
      description:item.description.S,
      contenuto:item.contenuto.S
    }));

 
    const notMyReports = allReports.filter((report) => report.tutorId !== tutorId);

    if (notMyReports.length === 0) {
      throw new Error("No reports found for patients not belonging to the given tutor.");
    }

    const randomIndex = Math.floor(Math.random() * notMyReports.length);
    return notMyReports[randomIndex];
  } catch (error) {
    console.error("Errore durante il recupero dei report non appartenenti al tutor:", error);
    throw error;
  }
};