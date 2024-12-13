import { GetLogEventsCommand, CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
const cloudwatch = new CloudWatchLogsClient();
const dynamoDB = new DynamoDBClient();

const { LOG_GROUP_NAME, USER_LOG_STREAM, PAZIENTI_LOG_STREAM, AUTH_LOG_STREAM, USERS_TABLE, REPORTS_LOG_STREAM } = process.env;

const processUser = async(userId, callback) => {
  try{

    const getItemParams = {
      TableName: USERS_TABLE,
      Key: {
        id: {
          S: userId,
       }
      }
    };
    const getItemCommand = new GetItemCommand(getItemParams);
    const data = await dynamoDB.send(getItemCommand);

    if(!data.Item){
     throw new Error("User not exists");
    }

    const item = data.Item;
    return {
      id: item.id.S,
      email: item.email.S,
      name: item.name.S,
      surname: item.surname.S,
      role: item.role.S,
      birthdate: item.birthdate.S,
      phone_number: item.phone_number.S,
      gender: item.gender.S,
      codfis: item.codfis.S,
      provincia: item.provincia.S,
      comune: item.comune.S,
      title: item.title.S,
      createdAt: item.createdAt.S,
      updatedAt: item.updatedAt.S,
      pazientiCount: parseInt(item.pazientiCount.N, 10),
      tasksCount: parseInt(item.tasksCount.N, 10),
      reportsCount: parseInt(item.reportsCount.N, 10),
      avatarURL: item.avatarURL ? item.avatarURL.S : null
    };

  } catch (error) {
    callback(error, error);
  }
};

function transformEvents(allEvents) {
 const processEvents = allEvents.map((event) => {
     const parsedMessage = JSON.parse(event.message);
     return {
         id: event.eventId,
         timestamp: new Date(event.timestamp).toISOString(),
         author: parsedMessage.invokedFrom,
         operationName: parsedMessage.operationName,
         operationType: parsedMessage.operationType,
         operationMessage: parsedMessage.message,
         operationResult: JSON.stringify(parsedMessage.operationInfo),
         error: parsedMessage.error,
         errorMessage: parsedMessage.errorInfo?.message,
         errorType: parsedMessage.errorInfo?.type
     };
 });
 return processEvents;
}

const processUserAllEvents = (allEvents, callback) => {
   const processEvents = allEvents.map(async(event) => {
     const parsedMessage = JSON.parse(event.message);

     let user = null;
     if(parsedMessage.invokedFrom){
      user = await processUser(parsedMessage.invokedFrom, callback);
     }else{
      user = null;
     }

     parsedMessage.invokedFrom = user;
     
     return {
         ...event,
         message: JSON.stringify(parsedMessage)
     };
  });
  return Promise.all(processEvents);
};

function searchAuthors(events, searchString) {
 return events.filter(event => {
   const messageObj = JSON.parse(event.message);
   return messageObj.invokedFrom &&
       (messageObj.invokedFrom.name.includes(searchString) ||
        messageObj.invokedFrom.surname.includes(searchString) ||
        messageObj.invokedFrom.codfis.includes(searchString));
 });
}

export const handler = async (event, context, callback) => {

  try {

    const {tab, filter, limit, nextToken} = event.arguments;

    let stremLogName = '';
    switch(tab){
     case 'auth': {
      stremLogName = AUTH_LOG_STREAM;
      break;
     }
     case 'users': {
      stremLogName = USER_LOG_STREAM;
      break;
     }
     case 'pazienti': {
      stremLogName = PAZIENTI_LOG_STREAM;
      break;
     }
     case 'reports': {
      stremLogName = REPORTS_LOG_STREAM
      break;
     }
     default: {
      throw new Error("Can't find log stream.");
     }
    }

    let getLogEventsParams = {
     logGroupName: LOG_GROUP_NAME,
     logStreamName: stremLogName,
     unmask: true,
     startFromHead: true
   };

   if(filter){
    if(filter.type === 'day'){
     const dateSplitted = filter.input.split('/');
     const day = parseInt(dateSplitted[0], 10);
     const month = parseInt(dateSplitted[1], 10) - 1;
     const year = parseInt(dateSplitted[2], 10);
     const startDate = new Date(year, month, day, 0, 0, 0);
     const startTime = startDate.getTime();
     const endDate = new Date(year, month, day, 23, 59, 59);
     const endTime = endDate.getTime();
     getLogEventsParams = {...getLogEventsParams, startTime, endTime};
    }
   }

   let maxLoop = 100;
   let loop = 0;
   let stop = false;
   let compare = null;
   let allEvents = [];
   do{
   
    getLogEventsParams = {...getLogEventsParams, nextToken: compare};
    const getLogEventsCommand = new GetLogEventsCommand(getLogEventsParams);
    const data = await cloudwatch.send(getLogEventsCommand);

    allEvents = allEvents.concat(data.events);
    compare = data.nextForwardToken;

    if(getLogEventsParams.nextToken === data.nextForwardToken){
     stop = true;
    }

    loop =+ 1;

   }while(!stop && loop < maxLoop);

   allEvents = await processUserAllEvents(allEvents, callback);

    if(allEvents.length > 0){
     if(filter){
      if(filter.type === 'author'){
        allEvents = searchAuthors(allEvents, filter.input);
      }
     }
     allEvents.sort((a,b) => b.timestamp - a.timestamp);
   }

   let newNextToken = null;

   let nextElements = null;
   if(nextToken){
    if(allEvents.length > 0){
     const index = allEvents.findIndex(item => item.eventId === nextToken);
     if(index != -1){
      if(limit){
       nextElements = allEvents.slice(index+1, index + 1 + limit);
       if(nextElements.length > 0){
        newNextToken = nextElements[nextElements.length -1].eventId;
       }
      }else{
       nextElements = allEvents.slice(index + 1);
      }
      callback(null, {items: transformEvents(nextElements), nextToken: newNextToken});
     }else{
      throw new Error('nextToken non valido');
     }
    }
   }

   let limitElements = null;
   if(limit){
    if(allEvents.length > 0){
     limitElements = allEvents.slice(0, limit );
     if(limitElements.length > 0 ){
      newNextToken = limitElements[ limitElements.length - 1 ].eventId;
     }
     callback(null, {items: transformEvents(limitElements), nextToken: newNextToken});
    }
   }

   callback(null, {items: transformEvents(allEvents), nextToken: null});

  } catch (error) {
    
    callback(error, error);

  }
};