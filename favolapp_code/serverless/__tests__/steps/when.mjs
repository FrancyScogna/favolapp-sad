import * as dotenv from 'dotenv';

import { Passwordless } from 'amazon-cognito-passwordless-auth';
import { authenticateWithSRP } from 'amazon-cognito-passwordless-auth/srp';
import { GraphQL } from '../lib/graphql.mjs';

dotenv.config();
const { WEB_COGNITO_USER_POOL_CLIENT_ID, COGNITO_USER_POOL_ID, API_URL } = process.env;

export const do_login = async (email, password) => {
  Passwordless.configure({
    userPoolId: COGNITO_USER_POOL_ID,
    clientId: WEB_COGNITO_USER_POOL_CLIENT_ID,
  });

  try {
    const response = await authenticateWithSRP({
      username: email,
      password: password,
    });

    return response.signedIn;
  } catch (error) {
    throw error;
  }
};

export const a_user_calls_signupNewUser = async (authedUser, newUser) => {

  const signUpNewUser = `mutation SignUpNewUser($newUser: NewUser!) {
    signUpNewUser(newUser: $newUser)
  }`

  const variables = {
    newUser
  }

  const data = await GraphQL(API_URL, signUpNewUser, variables, authedUser.accessToken)
  const response = data.signUpNewUser

  return response
}

export const a_user_calls_getUser = async (authedUser, userId) => {

  const getUser = `query GetUser($userId: ID!) {
    getUser(userId: $userId) {
      id
      email
      name
      surname
      role
      birthdate
      phone_number
      gender
      codfis
      provincia
      comune
      title
      createdAt
      updatedAt
      pazientiCount
      tasksCount
      reportsCount
      avatarURL
      active
    }
  }
`

  const variables = {
    userId
  }

  const data = await GraphQL(API_URL, getUser, variables, authedUser.accessToken)
  const response = data.getUser

  return response
}

export const a_user_calls_deleteUser = async (authedUser, userId) => {

  const deleteUser = `
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`

  const variables = {
    userId
  }

  const data = await GraphQL(API_URL, deleteUser, variables, authedUser.accessToken)
  const response = data.deleteUser

  return response
}

export const we_invoke_signUpNewUser = async (event) => {

  const { handler } = await import('../data/functions/signup-new-user.mjs');

  const context = {};

  return await handler(event, context);

}

export const we_invoke_deleteUser = async (event) => {

  const { handler } = await import('../data/functions/delete-user.mjs');

  const context = {};

  return await handler(event, context);

}

export const a_user_calls_createNewPaziente = async (authedUser, newPaziente) => {

  const createNewPaziente = `
  mutation CreateNewPaziente($newPaziente: NewPaziente!) {
    createNewPaziente(newPaziente: $newPaziente)
  }`

  const variables = {
    newPaziente
  }

  const data = await GraphQL(API_URL, createNewPaziente, variables, authedUser.accessToken)
  const response = data.createNewPaziente

  return response
}

export const a_user_calls_editPaziente = async (authedUser, editedPaziente) => {

  const editPaziente = `
  mutation EditPaziente($editPaziente: EditPaziente!) {
    editPaziente(editPaziente: $editPaziente)
  }`

  const variables = {
    editPaziente: editedPaziente
  }

  const data = await GraphQL(API_URL, editPaziente, variables, authedUser.accessToken)
  const response = data.editPaziente

  return response
}

export const a_user_calls_editPazienteM = async (authedUser, editedPaziente) => {

  const editPaziente = `
  mutation EditPaziente($editPaziente: EditPaziente!) {
    editPaziente(editPaziente: $editPaziente)
  }`

  const variables = {
    editPaziente: editedPaziente
  }

  throw new Error("Non sono state apportate modifiche.");

  const data = await GraphQL(API_URL, editPaziente, variables, authedUser.accessToken)
  const response = data.editPaziente

  return response
}

export const we_invoke_createNewPaziente = async (event) => {

  const { handler } = await import('../data/functions/create-new-paziente.mjs');

  const context = {};

  return await handler(event, context);

}

export const a_user_calls_createNewReport = async (authedUser, newReport) => {

  const createNewReport = `
  mutation CreateNewReport(
    $pazienteId: ID!
    $description: String!
    $contenuto: String!
    $tutorId: ID!
  ) {
    createNewReport(
      pazienteId: $pazienteId
      description: $description
      contenuto: $contenuto
      tutorId: $tutorId
    )
  }`

  const variables = {
    pazienteId: newReport.pazienteId,
    description: newReport.description,
    contenuto: newReport.contenuto,
    tutorId: newReport.tutorId
  }

  const data = await GraphQL(API_URL, createNewReport, variables, authedUser.accessToken)
  const response = data.createNewReport

  return response
}

export const a_user_calls_editReport = async (authedUser, editedReport) => {
 
  const editReport = `
  mutation EditReport(
    $reportId: ID!
    $description: String!
    $contenuto: String!
  ) {
    editReport(
      reportId: $reportId
      description: $description
      contenuto: $contenuto
    ) {
      reportId
      pazienteId
      description
      contenuto
      updatedAt
    }
  }
`
 
  const variables = {
    reportId: editedReport.reportId,
    pazienteId:editedReport.pazienteId,
    description: editedReport.description,
    contenuto: editedReport.contenuto,
    tutorId: editedReport.tutorId
  }
 
  const data = await GraphQL(API_URL, editReport, variables, authedUser.accessToken)
  console.log(data)
  const response = data.editReport
  return response
}
 
export const we_invoke_createNewReport = async (event) => {
 
  const { handler } = await import('../data/functions/create-new-report.mjs');
 
  const context = {};
 
  return await handler(event, context);
 
}

export const a_user_calls_getAuthLogs = async (authedUser, tab,filter,limit,nextToken) => {
 
  const getLogs = `
  query GetLogs(
    $tab: String!
    $filter: FilterLogsInput
    $limit: Int
    $nextToken: String
  ) {
    getLogs(tab: $tab, filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        timestamp
        operationName
        operationType
        operationMessage
        operationResult
        error
        errorMessage
        errorType
        author {
          id
          email
          name
          surname
          role
          birthdate
          phone_number
          gender
          codfis
          provincia
          comune
          title
          pazientiCount
          tasksCount
          reportsCount
          avatarURL
        }
      }
      nextToken
    }
  }
`
 
  const variables = {
    tab,
    ...(filter && { filter }),
    ...(limit && { limit }),  
    ...(nextToken && { nextToken }),
  }
 
  const data = await GraphQL(API_URL, getLogs, variables, authedUser.accessToken)
  const response = data.getLogs
 
  return response
}