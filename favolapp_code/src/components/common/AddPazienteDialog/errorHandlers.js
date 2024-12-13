export function createNewPazienteErrorHandler(errore) {
  switch (errore) {
    case 'Unauthorized':
      return 'Non sei autorizzato ad eseguire questa operazione.';
    case 'NoValidAuthTokens':
      return 'Non sei autorizzato ad eseguire questa operazione.';
    case 'CodeDeliveryFailureException':
      return 'Errore durante la consegna del codice di verifica.';
    case 'InternalErrorException':
      return 'Errore interno di Amazon Cognito.';
    case 'InvalidLambdaResponseException':
      return 'Risposta non valida da parte di AWS Lambda.';
    case 'InvalidParameterException':
      return 'Parametro non valido, verifica che i parametri inseriti siano validi.';
    case 'InvalidPasswordException':
      return 'Password non valida.';
    case 'InvalidSmsRoleAccessPolicyException':
      return 'Il ruolo fornito per la configurazione SMS non ha i permessi necessari.';
    case 'InvalidSmsRoleTrustRelationshipException':
      return 'La relazione di trust per il ruolo fornito per la configurazione SMS non è valida.';
    case 'NotAuthorizedException':
      return 'Utente non autorizzato.';
    case 'PreconditionNotMetException':
      return 'La condizione preliminare non è stata soddisfatta.';
    case 'ResourceNotFoundException':
      return 'Risorsa non trovata.';
    case 'TooManyRequestsException':
      return 'Troppe richieste per questa operazione.';
    case 'UnexpectedLambdaException':
      return 'Eccezione inaspettata con AWS Lambda.';
    case 'UnsupportedUserStateException':
      return "Stato dell'utente non supportato.";
    case 'UserLambdaValidationException':
      return 'Eccezione di convalida utente con AWS Lambda.';
    case 'UsernameExistsException':
      return 'Il nome utente esiste già nel pool utenti.';
    case 'UserNotFoundException':
      return 'Utente non trovato.';
    case 'ConditionalCheckFailedException':
      return "Una condizione specificata nell'operazione non ha potuto essere valutata.";
    case 'InternalServerError':
      return 'Si è verificato un errore sul lato del server.';
    case 'ItemCollectionSizeLimitExceededException':
      return 'La collezione di elementi è troppo grande.';
    case 'ProvisionedThroughputExceededException':
      return 'Il tasso di richiesta è troppo alto.';
    case 'RequestLimitExceeded':
      return 'La frequenza delle richieste supera il limite consentito.';
    case 'TransactionConflictException':
      return "L'operazione è stata rifiutata a causa di una transazione in corso per l'elemento.";
    default:
      return 'Errore sconosciuto';
  }
}
