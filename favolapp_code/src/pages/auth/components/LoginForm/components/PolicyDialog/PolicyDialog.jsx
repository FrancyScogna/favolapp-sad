import './PolicyDialog.css';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { confirmSignIn } from 'aws-amplify/auth';
import { LoadingButton } from '@mui/lab';
import termsAndConditions from '../../../../../../assets/files/terms-and-conditions.md';
import ReactMarkDown from 'react-markdown';

function PolicyDialog({ openPolicyDialog, setOpenPolicyDialog, setNextStep }) {
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const onClickClose = () => {
    if (!loadingConfirm) {
      setOpenPolicyDialog(false);
      setLoadingConfirm(false);
    }
  };

  const onClickAccept = async () => {
    setLoadingConfirm(true);
    try {
      const result = await confirmSignIn({
        challengeResponse: 'accept',
      });
      if (result && result.nextStep) {
        if (result.nextStep.signInStep) {
          const nextStep = result.nextStep;
          const challenge = nextStep.signInStep;
          if (challenge !== 'DONE') {
            let data = nextStep;
            delete data.signInStep;
            if (challenge === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
              setNextStep({ challenge: data.additionalInfo.name, data: null });
            } else {
              setNextStep({ challenge, data });
            }
          } else {
            setNextStep({ challenge, data: null });
          }
        }
      }
      setOpenPolicyDialog(false);
    } catch (error) {
      //pass
    }
    setLoadingConfirm(false);
  };

  return (
    <Dialog className='dialog' onClose={onClickClose} open={openPolicyDialog}>
      <DialogTitle className='dialog-title'>
        <Typography className='text'>Termini e condizioni</Typography>
      </DialogTitle>
      <DialogContent className='dialog-content'>
        <ReactMarkDown>{termsAndConditions}</ReactMarkDown>
      </DialogContent>
      <DialogActions>
        <Button disabled={loadingConfirm} onClick={onClickClose}>
          Chiudi
        </Button>
        <LoadingButton loading={loadingConfirm} onClick={onClickAccept}>
          Accetta
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

PolicyDialog.propTypes = {
  openPolicyDialog: PropTypes.bool,
  setOpenPolicyDialog: PropTypes.func,
  setNextStep: PropTypes.func,
};

export default PolicyDialog;
