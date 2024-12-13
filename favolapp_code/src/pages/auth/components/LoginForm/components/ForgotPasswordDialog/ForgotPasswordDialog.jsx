import './ForgotPasswordDialog.css';
import PropTypes from 'prop-types';
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
import { useState } from 'react';
import { removeSpacesFromString } from '../../../../../../utils/stringManipulation';
import { emailFormatCheck } from '../../../../utils/checkForms';
import { LoadingButton } from '@mui/lab';
import { resetPassword } from 'aws-amplify/auth';
import { backendErrorAlerts } from '../../../../utils/errorHandler';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../../../slices/snackbar-slice';
function ForgotPasswordDialog({
  openForgotPassword,
  setOpenForgotPassword,
  setNextStep,
}) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loadingSend, setLoadingSend] = useState(false);
  const [alert, setAlert] = useState(null);
  const [helperText, setHelperText] = useState(null);

  const onChangeEmailTextField = (event) => {
    const text = removeSpacesFromString(event.target.value);
    setAlert(null);
    setEmail(text !== '' ? text.toLowerCase() : '');
    const pass = emailFormatCheck(text, setHelperText);
    if (text === '' || pass) {
      setHelperText(null);
    }
  };

  const onClickSend = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (!helperText) {
      if (email !== '') {
        setLoadingSend(true);
        try {
          const result = await resetPassword({ username: email });
          if (result && result.nextStep) {
            if (result.nextStep.resetPasswordStep) {
              const nextStep = result.nextStep;
              const challenge = nextStep.resetPasswordStep;
              setNextStep({ challenge, data: null });
              setOpenForgotPassword(false);
              setEmail('');
              setAlert(null);
              setHelperText(null);
              dispatch(
                showSnackbar({
                  message: `Codice di verifica inviato a ${email}`,
                })
              );
            }
          }
        } catch (error) {
          const errorMessage = backendErrorAlerts(error);
          setAlert(errorMessage);
        }
      } else {
        setAlert('Verifica che il campo email sia compilato correttamente.');
      }
    }
    setLoadingSend(false);
  };

  const onClickClose = () => {
    if (!loadingSend) {
      setOpenForgotPassword(false);
      setEmail('');
      setAlert(null);
      setHelperText(null);
    }
  };

  return (
    <Dialog
      className='forgotpassword-dialog'
      onClose={onClickClose}
      open={openForgotPassword}
    >
      <DialogTitle className='dialog-title'>
        <Typography className='text'>Recupera la password</Typography>
      </DialogTitle>
      <form>
        <DialogContent className='dialog-content'>
          <Typography className='description'>
            {'Hai dimenticato la password?'}
            <br />
            {
              "Inserisci l'email associata all'account per ottenere il codice per cambiare la password."
            }
            <br />
            {"Se non ricevi l'email, contatta il supporto."}
          </Typography>
          <Collapse in={alert ? true : false}>
            <Alert className='alert' variant='filled' severity='error'>
              {alert}
            </Alert>
          </Collapse>
          <TextField
            value={email ? email : ''}
            disabled={loadingSend}
            onChange={onChangeEmailTextField}
            type='text'
            error={helperText ? true : false}
            helperText={helperText}
            className='textfield'
            label='Email'
            size='small'
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={loadingSend} onClick={onClickClose}>
            {'Chiudi'}
          </Button>
          <LoadingButton
            type='submit'
            loading={loadingSend}
            disabled={
              loadingSend || email === ''
                ? true
                : false || helperText
                  ? true
                  : false
            }
            onSubmit={onClickSend}
            onClick={onClickSend}
          >
            {'Invia'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

ForgotPasswordDialog.propTypes = {
  openForgotPassword: PropTypes.bool,
  setOpenForgotPassword: PropTypes.func,
  setNextStep: PropTypes.func,
};

export default ForgotPasswordDialog;
