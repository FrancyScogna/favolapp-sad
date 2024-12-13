export const backendErrorAlerts = (error) => {
  let errorMessage = 'Si è verificato un errore. Riprova.';

  switch (error.name) {
    case 'UserNotFoundException':
      errorMessage = 'Nome utente non corretto.';
      break;
    case 'NotAuthorizedException':
      errorMessage = 'Nome utente o password non corretti.';
      break;
    case 'UserNotConfirmedException':
      errorMessage = "L'utente non è confermato.";
      break;
    case 'PasswordResetRequiredException':
      errorMessage = 'È richiesto il reset della password.';
      break;
    case 'InvalidParameterException':
      errorMessage = 'Parametro non valido.';
      break;
    case 'MFAMethodNotFoundException':
      errorMessage = 'Metodo MFA non trovato.';
      break;
    case 'UnexpectedLambdaException':
      errorMessage = 'Errore inaspettato nella funzione Lambda.';
      break;
    case 'InvalidLambdaResponseException':
      errorMessage = 'Risposta non valida dalla funzione Lambda.';
      break;
    case 'UserLambdaValidationException':
      errorMessage = 'Errore di validazione della funzione Lambda.';
      break;
    case 'TooManyRequestsException':
      errorMessage = 'Troppe richieste. Riprova più tardi.';
      break;
    case 'CodeMismatchException':
      errorMessage = 'Codice di verifica non corretto.';
      break;
    case 'ExpiredCodeException':
      errorMessage = 'Codice di verifica scaduto.';
      break;
    case 'LimitExceededException':
      errorMessage = 'Limite di tentativi superato. Riprova più tardi.';
      break;
    case 'CodeDeliveryFailureException':
      errorMessage = 'Invio del codice di verifica non riuscito.';
      break;
    case 'ForbiddenException':
      errorMessage =
        'Richiesta non consentita. Controlla le impostazioni del tuo pool di utenti.';
      break;
    case 'InternalErrorException':
      errorMessage = 'Errore interno del server. Riprova più tardi.';
      break;
    case 'InvalidEmailRoleAccessPolicyException':
      errorMessage =
        'Amazon Cognito non è autorizzato a utilizzare la tua identità email.';
      break;
    case 'InvalidSmsRoleAccessPolicyException':
      errorMessage =
        'Il ruolo fornito per la configurazione SMS non ha il permesso di pubblicare tramite Amazon SNS.';
      break;
    case 'InvalidSmsRoleTrustRelationshipException':
      errorMessage =
        'Relazione di fiducia non valida per il ruolo fornito per la configurazione SMS.';
      break;
    case 'InvalidUserPoolConfigurationException':
      errorMessage = 'Configurazione del pool utenti non valida.';
      break;
    case 'ResourceNotFoundException':
      errorMessage = 'Risorsa non trovata.';
      break;
    case 'AliasExistsException':
      errorMessage = 'Questo alias è già stato utilizzato da un altro utente.';
      break;
    case 'SoftwareTokenMFANotFoundException':
      errorMessage = 'MFA con token software non attivato per il pool utenti.';
      break;
    default:
      errorMessage = error.message || 'Si è verificato un errore. Riprova.';
      break;
  }

  return errorMessage;
};
