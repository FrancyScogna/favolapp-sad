import { PutLogEventsCommand, CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs"
const cloudwatch = new CloudWatchLogsClient();

const { LOG_GROUP_NAME, USER_LOG_STREAM, PAZIENTI_LOG_STREAM, REPORTS_LOG_STREAM } = process.env;

export const handler = async (event, context, callback) => {

  try {

    const body = event.body;
    
    let logStreamName = '';
    let logObj = {
      invokedFrom: body.invokedFrom,
      operationName: body.operationName,
      operationType: body.operationType,
    };
  
    switch(body.operationName){
      case 'editUserInfo': {
        logStreamName = USER_LOG_STREAM;
        let message = '';
        let error = false;
        if(body.error.type !== 'None'){
          message = `Errore durante la modifica dell'utente con id ${body.operationArguments.editUser?.id}`;
          error = true;
        }else{
          message = `L'utente con userId ${body.operationResult.id} è stato modificato.`;
          error = false;
        }
        logObj = { 
          ...logObj,
          message,
          error,
          errorInfo: {
            message: body.error.message,
            type: body.error.type
          },
          operationInfo: body.operationResult
        };
        break;
      }

      case 'signUpNewUser': {
        logStreamName = USER_LOG_STREAM;
        let message = '';
        let error = false;
        if(body.error.type !== 'None'){
          message = `Errore durante la registrazione di un utente.`;
          error = true;
        }else{
          message = `E' stato aggiunto un nuovo utente.`;
          error = false;
        }
        logObj = { 
          ...logObj,
          message,
          error,
          errorInfo: {
            message: body.error.message,
            type: body.error.type
          },
          operationInfo: body.operationArguments?.newUser
        };
        break;
      }

      case 'deleteUser': {
        logStreamName = USER_LOG_STREAM;
        let message = '';
        let error = false;
        if(body.error.type !== 'None'){
          message = `Errore durante l'eliminazione di un utente.`;
          error = true;
        }else{
          message = `E' stato eliminato un utente`;
          error = false;
        }
        logObj = { 
          ...logObj,
          message,
          error,
          errorInfo: {
            message: body.error.message,
            type: body.error.type
          },
          operationInfo: body.operationArguments?.userId
        };
        break;
      }

      case 'createNewPaziente': {
        logStreamName = PAZIENTI_LOG_STREAM;
        let message = '';
        let error = false;
        if(body.error.type !== 'None'){
          message = `Errore durante la creazione di un paziente.`;
          error = true;
        }else{
          message = `E' stato creato un nuovo paziente.`;
          error = false;
        }
        logObj = { 
          ...logObj,
          message,
          error,
          errorInfo: {
            message: body.error.message,
            type: body.error.type
          },
          operationInfo: body.operationArguments?.newPaziente
        };
        break;
      }

      case 'editPaziente': {
        logStreamName = PAZIENTI_LOG_STREAM;
        let message = '';
        let error = false;
        if(body.error.type !== 'None'){
          message = `Errore durante la modifica di un paziente con id ${body.operationArguments.editPaziente?.id}.`;
          error = true;
        }else{
          message = `E' stato modificato un paziente con id ${body.operationArguments.editPaziente?.id}.`;
          error = false;
        }
        logObj = { 
          ...logObj,
          message,
          error,
          errorInfo: {
            message: body.error.message,
            type: body.error.type
          },
          operationInfo: body.operationArguments?.editPaziente
        };
        break;
      }

      case 'markReportAsSeen': {
        logStreamName = REPORTS_LOG_STREAM;
        let message = '';
        let error = false;
        if(body.error.type !== 'None'){
          message = `Errore durante l'operazione di visualizzazione del report.`;
          error = true;
        }else{
          message = `E' stato visualizzato un nuovo report da ${body.invokedFrom}`;
          error = false;
        }
        logObj = { 
          ...logObj,
          message,
          error,
          errorInfo: {
            message: body.error.message,
            type: body.error.type
          },
          operationInfo: body.operationResult
        };
        break;
      }

      case 'createNewReport': {
        logStreamName = REPORTS_LOG_STREAM;
        let message = '';
        let error = false;
        if(body.error.type !== 'None'){
          message = `Errore durante la creazione di un nuovo report.`;
          error = true;
        }else{
          message = `E' stato creato un nuovo report da ${body.invokedFrom}`;
          error = false;
        }
        logObj = { 
          ...logObj,
          message,
          error,
          errorInfo: {
            message: body.error.message,
            type: body.error.type
          },
          operationInfo: body.operationArguments
        };
        break;
      }

      case 'editReport': {
        logStreamName = REPORTS_LOG_STREAM;
        let message = '';
        let error = false;
        if(body.error.type !== 'None'){
          message = `Errore durante la modifica di un report.`;
          error = true;
        }else{
          message = `E' stato modificato un report da ${body.invokedFrom}`;
          error = false;
        }
        logObj = { 
          ...logObj,
          message,
          error,
          errorInfo: {
            message: body.error.message,
            type: body.error.type
          },
          operationInfo: body.operationResult
        };
        break;
      }

      default: {
        callback(null, "Operation not identified");
      }
    }

    const message = JSON.stringify(logObj);
    const timestamp = new Date().getTime();

    const putLogEventsParams = {
      logGroupName: LOG_GROUP_NAME,
      logStreamName: logStreamName,
      logEvents: [
        {
          message,
          timestamp,
        },
      ],
    };

    const putLogEventsCommand = new PutLogEventsCommand(putLogEventsParams);
    const response = await cloudwatch.send(putLogEventsCommand);

    callback(null, response);

  } catch (error) {
    
    callback(error, error);

  }
};