import './ChangePasswordForm.css';
import {
  Alert,
  Collapse,
  FormGroup,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { removeSpacesFromString } from '../../../../utils/stringManipulation';
import { LoadingButton } from '@mui/lab';
import {
  ChangePasswordFormCheckErrors,
  emailFormatCheck,
  passwordFieldCheck,
  repeatPasswordFieldCheck,
} from '../../utils/checkForms';
import { backendErrorAlerts } from '../../utils/errorHandler';
import { confirmResetPassword } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../slices/snackbar-slice';

function ChangePasswordForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //Caricamento
  const [loadingConfirmPassword, setLoadingConfirmPassword] = useState(false);

  //Variabili utilizzate per la compilazione del form
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [userName, setUserName] = useState('');

  //Variabili per l'alert dei campi del form
  const [alertPassword, setAlertPassword] = useState(null);
  const [alertRepeatPassword, setAlertRepeatPassword] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [emailHelperText, setEmailHelperText] = useState(null);
  const [codeHelperText, setCodeHelperText] = useState(null);

  const onChangeEmailTextField = (event) => {
    const text = removeSpacesFromString(event.target.value);
    setAlertMessage(null);
    setEmailHelperText(null);
    const pass = emailFormatCheck(text, setEmailHelperText);
    if (text === '' || pass) {
      setEmailHelperText(null);
    }
    setUserName(text !== '' ? text : '');
  };

  const onChangeCodeTextField = (event) => {
    const text = removeSpacesFromString(event.target.value);
    setAlertMessage(null);
    setCodeHelperText(null);
    if (text.length > 6) {
      return;
    }
    if (text.length < 6) {
      setCodeHelperText('Il codice non è corretto.');
    }
    if (text === '') {
      setCodeHelperText(null);
    }
    setConfirmationCode(text);
  };

  //Quando il testo nell'input Password cambia viene settata la variabile
  const onChangePasswordTextField = (event) => {
    const text = removeSpacesFromString(event.target.value);
    setAlertMessage(null);
    passwordFieldCheck(text, setAlertPassword);
    repeatPasswordFieldCheck(text, repeatPassword, setAlertRepeatPassword);
    setPassword(text !== '' ? text : '');
  };

  //Quando il testo nell'input RepeatPassword cambia viene settata la variabile
  const onChangeRepeatPasswordTextField = (event) => {
    const text = removeSpacesFromString(event.target.value);
    setAlertMessage(null);
    repeatPasswordFieldCheck(password, text, setAlertRepeatPassword);
    setRepeatPassword(text !== '' ? text : '');
  };

  //Quando si clicca su conferma password si verifica che non ci siano errori tramite
  //il controllo da frontend
  const onClickConfirmPassword = async (e) => {
    e.preventDefault();
    setAlertMessage(null);
    setLoadingConfirmPassword(true);
    const pass = ChangePasswordFormCheckErrors(
      password,
      repeatPassword,
      setAlertMessage,
      alertPassword,
      alertRepeatPassword
    );
    if (
      pass &&
      !emailHelperText &&
      !codeHelperText &&
      userName &&
      confirmationCode
    ) {
      try {
        await confirmResetPassword({
          newPassword: password,
          confirmationCode,
          username: userName,
        });
        navigate('/auth/login');
        dispatch(
          showSnackbar({
            message: `Password modificata con successo!`,
          })
        );
      } catch (error) {
        const errorMessage = backendErrorAlerts(error);
        setAlertMessage(errorMessage);
      }
    }
    setLoadingConfirmPassword(false);
  };

  return (
    <div className='formouter-container'>
      <div className='form-container'>
        <form>
          <FormGroup>
            <Grid container className='changepasswordform-grid-main'>
              <Grid item xs={12} className='changepasswordform-grid-item-title'>
                <Typography className='title'>Cambia password</Typography>
              </Grid>
              <Grid
                item
                xs={12}
                className='changepasswordform-grid-item-description'
              >
                <Typography className='description'>
                  Compila il seguente form per cambiare la tua password.
                  <br />
                  Una volta confermata la nuova password, verrai reindirizzato
                  alla pagina di accesso.
                </Typography>
              </Grid>
              <Grid item xs={11} className='changepasswordform-grid-item-alert'>
                <Collapse in={alertMessage ? true : false}>
                  <Alert className='alert' variant='filled' severity='error'>
                    {alertMessage}
                  </Alert>
                </Collapse>
              </Grid>
              <Grid
                item
                xs={12}
                className='changepasswordform-grid-item-textfield'
              >
                <TextField
                  className='textfield'
                  size='small'
                  type='email'
                  variant='outlined'
                  label={'Email'}
                  error={emailHelperText ? true : false}
                  helperText={emailHelperText}
                  disabled={loadingConfirmPassword}
                  onChange={onChangeEmailTextField}
                  value={userName}
                />
              </Grid>
              <Grid
                item
                xs={12}
                className='changepasswordform-grid-item-textfield'
              >
                <TextField
                  className='textfield'
                  size='small'
                  variant='outlined'
                  type='number'
                  label={'Codice di conferma'}
                  disabled={loadingConfirmPassword}
                  onChange={onChangeCodeTextField}
                  value={confirmationCode}
                  helperText={codeHelperText}
                  error={codeHelperText ? true : false}
                />
              </Grid>
              <Grid
                item
                xs={12}
                className='changepasswordform-grid-item-textfield'
              >
                <TextField
                  className='textfield'
                  size='small'
                  type='password'
                  variant='outlined'
                  autoComplete={'new-password'}
                  label='Password'
                  disabled={loadingConfirmPassword}
                  onChange={onChangePasswordTextField}
                  value={password ? password : ''}
                />
              </Grid>
              <Grid
                item
                xs={11.4}
                className='changepasswordform-grid-item-realtimealert'
              >
                <Collapse in={alertPassword ? true : false}>
                  <Alert className='alert' variant='filled' severity='error'>
                    {alertPassword &&
                      alertPassword.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          <br />
                        </span>
                      ))}
                  </Alert>
                </Collapse>
              </Grid>
              <Grid
                item
                xs={12}
                className='changepasswordform-grid-item-textfield'
              >
                <TextField
                  className='textfield'
                  size='small'
                  autoComplete={'new-password'}
                  type='password'
                  variant='outlined'
                  label={'Ripeti Password'}
                  disabled={loadingConfirmPassword}
                  onChange={onChangeRepeatPasswordTextField}
                  value={repeatPassword ? repeatPassword : ''}
                />
              </Grid>
              <Grid
                item
                xs={11.4}
                className='changepasswordform-grid-item-realtimealert'
              >
                <Collapse in={alertRepeatPassword ? true : false}>
                  <Alert className='alert' variant='filled' severity='error'>
                    {alertRepeatPassword}
                  </Alert>
                </Collapse>
              </Grid>
              <Grid
                item
                xs={10}
                className='changepasswordform-grid-item-confirmbutton'
              >
                <LoadingButton
                  type={'submit'}
                  className='loading-button'
                  variant='contained'
                  loading={loadingConfirmPassword}
                  onClick={onClickConfirmPassword}
                  onSubmit={onClickConfirmPassword}
                >
                  Cambia password
                </LoadingButton>
              </Grid>
            </Grid>
          </FormGroup>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordForm;
