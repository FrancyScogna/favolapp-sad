import { CloudWatchLogsClient, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
const cloudwatch = new CloudWatchLogsClient();

const { AUTH_LOG_STREAM, LOG_GROUP_NAME } = process.env;

export const handler = async (event, context, callback) => {

  try {

   const logStreamName = AUTH_LOG_STREAM;

   //Definizione dei parametri del log
   const sub = event.request.userAttributes.sub;
   const error = false;
   const errorInfo = null;
   const message = `Termine del flusso di autenticazione per l'utente ${sub}. Accesso effettuato.`;

   //Creazione dell'oggetto per il log
   let logObj = {
     invokedFrom: sub ? sub : null,
     operationName: 'postAuthentication',
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
