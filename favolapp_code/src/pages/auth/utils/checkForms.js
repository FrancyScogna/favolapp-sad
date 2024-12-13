const alertMessages = {
  emailUncorrect: "L'email inserita non è corretta.",
  empty: 'Verifica che tutti i campi siano stati compilati.',
  uncorrect: 'Verifica che tutti i campi siano stati compilati correttamente.',
  repeatPassword: 'Le password non coincidono.',
  password: {
    title: 'La password deve contenere: \n',
    minLenght: '- Almeno 8 caratteri \n',
    upperCase: '- Almeno una lettera maiuscola \n',
    lowerCase: '- Almeno una lettera minuscola \n',
    number: '- Almeno un numero \n',
    specialChars:
      "- Almeno un carattere speciale tra: '! @ # $ % ^ & * ( ) _ + - = { } [ ] | : ; , . ?'. \n",
  },
};

export const emailFormatCheck = (email, setAlertMessage) => {
  if (email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setAlertMessage(alertMessages.emailUncorrect);
      return false;
    } else {
      return true;
    }
  } else {
    setAlertMessage(alertMessages.empty);
    return false;
  }
};

export const emptyFieldCheck = (setAlertMessage, ...params) => {
  if (
    params.some((param) => param === null) ||
    params.some((param) => param === '')
  ) {
    setAlertMessage(alertMessages.empty);
    return false;
  } else {
    return true;
  }
};

export const passwordFieldCheck = (password, setAlertPassword) => {
  let errorMessage = '';
  // Lunghezza minima di 8 caratteri
  if (password.length < 8) {
    errorMessage += alertMessages.password.minLenght;
  }
  // Almeno una lettera maiuscola
  if (!/[A-Z]/.test(password)) {
    errorMessage += alertMessages.password.upperCase;
  }
  // Almeno una lettera minuscola
  if (!/[a-z]/.test(password)) {
    errorMessage += alertMessages.password.lowerCase;
  }
  // Almeno un numero
  if (!/\d/.test(password)) {
    errorMessage += alertMessages.password.number;
  }
  // Almeno un carattere speciale
  if (!/[!@#$%^&*()_+\-={}[\]|:;,.?]/.test(password)) {
    errorMessage += alertMessages.password.specialChars;
  }
  if (password) {
    errorMessage =
      errorMessage.trim() !== ''
        ? alertMessages.password.title + errorMessage.trim()
        : null;
    setAlertPassword(errorMessage);
  } else {
    setAlertPassword(null);
  }
};

export const codeFieldCheck = (code, setAlertMessage) => {
  if (code.length < 6) {
    setAlertMessage(alertMessages.uncorrect);
    return false;
  }
  return true;
};

export const repeatPasswordFieldCheck = (
  password,
  repeatPassword,
  setAlertRepeatPassword
) => {
  if (repeatPassword !== password && repeatPassword) {
    setAlertRepeatPassword(alertMessages.repeatPassword);
  } else {
    setAlertRepeatPassword(null);
  }
};

export const LoginFormCheckErrors = (email, password, setAlertMessage) => {
  if (!emptyFieldCheck(setAlertMessage, email, password)) {
    return false;
  }
  if (!emailFormatCheck(email, setAlertMessage)) {
    return false;
  }
  return true;
};

export const ForgotPasswordDialogCheckErrors = (email, setAlertMessage) => {
  if (!emptyFieldCheck(setAlertMessage, email)) {
    return false;
  }
  if (!emailFormatCheck(email, setAlertMessage)) {
    return false;
  }
  return true;
};

//Valido anche per ConfirmEmailDialog
export const ConfirmAccountDialogCheckErrors = (code, setAlertMessage) => {
  if (!emptyFieldCheck(setAlertMessage, code)) {
    return false;
  }
  if (!codeFieldCheck(code, setAlertMessage)) {
    return false;
  }
  return true;
};

export const ChangePasswordFormCheckErrors = (
  password,
  repeatPassword,
  setAlertMessage,
  alertPassword,
  alertRepeatPassword
) => {
  if (!emptyFieldCheck(setAlertMessage, password, repeatPassword)) {
    return false;
  }
  if (alertPassword || alertRepeatPassword) {
    setAlertMessage(alertMessages.uncorrect);
    return false;
  }
  return true;
};
