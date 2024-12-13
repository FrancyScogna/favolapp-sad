import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import './UpdatePasswordDialog.css';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { removeSpacesFromString } from '../../../../../../utils/stringManipulation';
import {
  ChangePasswordFormCheckErrors,
  passwordFieldCheck,
  repeatPasswordFieldCheck,
} from '../../../../utils/checkForms';
import PropTypes from 'prop-types';
import { confirmSignIn } from 'aws-amplify/auth';
import { backendErrorAlerts } from '../../../../utils/errorHandler';
function UpdatePasswordDialog({ setOpen, open, setNextStep }) {
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [alertPassword, setAlertPassword] = useState(null);
  const [alertRepeatPassword, setAlertRepeatPassword] = useState(null);

  //Quando il testo nell'input Password cambia viene settata la variabile
  const onChangePasswordTextField = (event) => {
    const text = removeSpacesFromString(event.target.value);
    setAlertMessage(null);
    passwordFieldCheck(text, setAlertPassword);
    repeatPasswordFieldCheck(text, repeatPassword, setAlertRepeatPassword);
    setPassword(text !== '' ? text : null);
  };

  //Quando il testo nell'input RepeatPassword cambia viene settata la variabile
  const onChangeRepeatPasswordTextField = (event) => {
    const text = removeSpacesFromString(event.target.value);
    setAlertMessage(null);
    repeatPasswordFieldCheck(password, text, setAlertRepeatPassword);
    setRepeatPassword(text !== '' ? text : null);
  };

  const resetForm = () => {
    setPassword('');
    setRepeatPassword('');
    setAlertMessage(null);
    setLoadingConfirm(false);
    setAlertPassword(false);
    setAlertRepeatPassword(false);
  };

  const onClickClose = () => {
    resetForm();
    setOpen(false);
  };

  const onClickConfirm = async (e) => {
    e.preventDefault();
    setAlertMessage(null);
    setLoadingConfirm(true);
    const pass = ChangePasswordFormCheckErrors(
      password,
      repeatPassword,
      setAlertMessage,
      alertPassword,
      alertRepeatPassword
    );
    if (pass) {
      try {
        const result = await confirmSignIn({
          challengeResponse: password,
        });
        if (result && result.nextStep) {
          if (result.nextStep.signInStep) {
            const nextStep = result.nextStep;
            const challenge = nextStep.signInStep;
            if (challenge !== 'DONE') {
              let data = nextStep;
              delete data.signInStep;
              if (challenge === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
                setNextStep({
                  challenge: data.additionalInfo.name,
                  data: null,
                });
              } else {
                setNextStep({ challenge, data });
              }
            } else {
              setNextStep({ challenge, data: null });
            }
          }
        }
        resetForm();
        setOpen(false);
      } catch (error) {
        const errorMessage = backendErrorAlerts(error);
        setAlertMessage(errorMessage);
      }
    }
    setLoadingConfirm(false);
  };

  return (
    <Dialog
      className='updatepassword-dialog'
      onClose={onClickClose}
      open={open}
    >
      <DialogTitle className='dialog-title'>
        <Typography className='text'>Imposta la password</Typography>
      </DialogTitle>
      <form>
        <DialogContent className='dialog-content'>
          <Typography className='description'>
            Imposta la tua password di accesso.
            <br />
            Utilizzerai questa password per i prossimi accessi al servizio.
          </Typography>
          <Collapse in={alertMessage ? true : false}>
            <Alert className='alert' variant='filled' severity='error'>
              {alertMessage}
            </Alert>
          </Collapse>
          <div className='textfield-container'>
            <TextField
              className='textfield'
              size='small'
              type='password'
              variant='outlined'
              autoComplete={'new-password'}
              label='Password'
              disabled={loadingConfirm}
              onChange={onChangePasswordTextField}
              value={password ? password : ''}
            />
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
            <TextField
              className='textfield'
              size='small'
              autoComplete={'new-password'}
              type='password'
              variant='outlined'
              label={'Ripeti Password'}
              disabled={loadingConfirm}
              onChange={onChangeRepeatPasswordTextField}
              value={repeatPassword ? repeatPassword : ''}
            />
            <Collapse in={alertRepeatPassword ? true : false}>
              <Alert className='alert' variant='filled' severity='error'>
                {alertRepeatPassword}
              </Alert>
            </Collapse>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClickClose}>Chiudi</Button>
          <LoadingButton
            type='submit'
            onSubmit={onClickConfirm}
            loading={loadingConfirm}
            onClick={onClickConfirm}
          >
            Conferma
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

UpdatePasswordDialog.propTypes = {
  setOpen: PropTypes.func,
  open: PropTypes.bool,
  setNextStep: PropTypes.func,
};

export default UpdatePasswordDialog;
