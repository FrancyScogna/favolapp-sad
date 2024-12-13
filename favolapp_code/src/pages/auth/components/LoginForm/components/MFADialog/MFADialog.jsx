import {
  Alert,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import './MFADialog.css';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { removeSpacesFromString } from '../../../../../../utils/stringManipulation';
import PropTypes from 'prop-types';
import { confirmSignIn } from 'aws-amplify/auth';
import { backendErrorAlerts } from '../../../../utils/errorHandler';
function MFADialog({ open, setOpen, setNextStep, nextStep }) {
  const [alert, setAlert] = useState(null);
  const [code, setCode] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [mode, setMode] = useState(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  useEffect(() => {
    if (nextStep) {
      if (nextStep.challenge === 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP') {
        setupQrCode();
        setMode('setup');
      }
      if (nextStep.challenge === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
        setMode('confirm');
      }
    }
  }, []);

  const setupQrCode = () => {
    const username = 'francosco@hotmail.it';
    const sharedSecret = nextStep?.data.totpSetupDetails.sharedSecret;
    const qrCode = `otpauth://totp/AWSCognito:${username}}?secret=${sharedSecret}&issuer=AWSCognito`;
    setTimeout(() => {
      setQrCode(qrCode);
    }, 2000);
  };

  const onChangeCodeTextField = (event) => {
    setAlert(null);
    const text = removeSpacesFromString(event.target.value);
    if (text.length > 6) {
      return;
    }
    setCode(text);
  };

  const resetForm = () => {
    setCode('');
    setLoadingConfirm(false);
    setAlert(null);
    setQrCode(null);
  };

  const onClickClose = () => {
    resetForm();
    setOpen(false);
  };

  const onClickConfirm = async (e) => {
    e.preventDefault();
    setLoadingConfirm(true);
    setAlert(null);
    if (code === '' || code.length < 6) {
      setAlert('Devi inserire un codice valido.');
    } else {
      try {
        const result = await confirmSignIn({
          challengeResponse: code,
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
        setAlert(errorMessage);
      }
    }
    setLoadingConfirm(false);
  };

  return (
    <Dialog className='mfa-dialog' onClose={onClickClose} open={open}>
      <DialogTitle className='dialog-title'>
        <Typography className='text'>
          Imposta autenticazione a due fattori
        </Typography>
      </DialogTitle>
      <form>
        <DialogContent className='dialog-content'>
          <Typography className='description'>
            {mode === 'setup'
              ? `Per impostare l'autenticazione a due fattori bisogna inquadrare il
             qrCode in un app di autenticazione come Google Authenticator o
             altre app simili.`
              : `Inserire il codice presente sull'app di autenticazione.`}
          </Typography>
          {mode === 'setup' && (
            <div className='qrcode-container'>
              {qrCode && (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}`}
                  alt='qrCode'
                />
              )}
              {!qrCode && (
                <div className='loading-qrcode'>
                  <CircularProgress />
                </div>
              )}
            </div>
          )}
          <Collapse in={alert ? true : false}>
            <Alert className='alert' variant='filled' severity='error'>
              {alert}
            </Alert>
          </Collapse>
          <TextField
            value={code ? code : ''}
            disabled={loadingConfirm}
            onChange={onChangeCodeTextField}
            type='number'
            className='textfield'
            label='Codice'
            size='small'
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={loadingConfirm} onClick={onClickClose}>
            Chiudi
          </Button>
          <LoadingButton
            type='submit'
            onSubmit={onClickConfirm}
            disabled={loadingConfirm}
            onClick={onClickConfirm}
          >
            Invia
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

MFADialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  nextStep: PropTypes.object,
  setNextStep: PropTypes.func,
};

export default MFADialog;
