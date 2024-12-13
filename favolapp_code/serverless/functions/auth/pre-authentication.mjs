import { CloudWatchLogsClient, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
const cloudwatch = new CloudWatchLogsClient();

const { AUTH_LOG_STREAM, LOG_GROUP_NAME } = process.env;

export const handler = async (event, context, callback) => {

  try {

   const logStreamName = AUTH_LOG_STREAM;
   const {userNotFound} = event.request;

   //Definizione dei parametri del log
   let error = false;
   let message = '';
   let sub = event?.request?.userAttributes?.sub;
   let errorInfo = null;

   //Impostazione dei parametri del log
   if(userNotFound){
    error = true;
    errorInfo = {
     message: 'Tentativo di accesso con un utente non esistente',
     type: 'UserNotFound'
    }
    message = `Tentativo di accesso con un utente non esistente.`;
   }else{
    error = false;
    errorInfo = null;
    message = `Inizio del flusso di autenticazione dell'utente ${sub}`;
   }

   //Creazione dell'oggetto per il log
   let logObj = {
     invokedFrom: sub ? sub : null,
     operationName: 'preAuthentication',
     operationType: 'auth',
     error,
     errorInfo,
     operationInfo: null,
     message
   };

   const logMessage = JSON.stringify(logObj);
   const timestamp = new Date().getTime();

   const putLogEventsParams = {
     logGroupName: LOG_GROUP_NAME,
     logStreamName: logStreamName,
     logEvents: [
       {
         message: logMessage,
         timestamp,
       },
     ],
   };

   const putLogEventsCommand = new PutLogEventsCommand(putLogEventsParams);
   await cloudwatch.send(putLogEventsCommand);

   callback(null, event);

  } catch (error) {

   callback(error, error);

  }
};
