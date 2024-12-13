import { Dialog, DialogTitle, IconButton, Typography } from '@mui/material';
import './AddUserDialog.css';
import { Close } from '@mui/icons-material';
import 'dayjs/locale/it';
import PropTypes from 'prop-types';
import CreateAccount from './components/CreateAccount/CreateAccount';
import CloseAddAccount from './components/CloseAddAccount/CloseAddAccount';
import { useState } from 'react';
import ReviewAccount from './components/ReviewAccount/ReviewAccount';

function AddUserDialog({ open, setOpen }) {
  const [newUser, setNewUser] = useState({
    name: '',
    surname: '',
    email: '',
    phone_number: '',
    birthdate: { day: '', month: '', year: '' },
    gender: '',
    codfis: '',
    city: '',
    comune: '',
    title: '',
    role: '',
  });
  const [step, setStep] = useState(0);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  const onClickClose = () => {
    setOpenCancelDialog(true);
  };

  return (
    <>
      <Dialog className='adduser-dialog' open={open}>
        <DialogTitle className='dialog-title'>
          <Typography className='title'>
            {step === 0 && "Aggiungi utente all'organizzazione"}
            {step === 1 && 'Riepilogo nuovo utente'}
          </Typography>
          <IconButton onClick={onClickClose} className='close-icon-button'>
            <Close />
          </IconButton>
        </DialogTitle>
        {step === 0 && (
          <CreateAccount
            newUser={newUser}
            setNewUser={setNewUser}
            setStep={setStep}
            onClickClose={onClickClose}
          />
        )}
        {step === 1 && (
          <ReviewAccount
            newUser={newUser}
            setStep={setStep}
            onClickClose={onClickClose}
            setOpenAddUserDialog={setOpen}
          />
        )}
      </Dialog>
      {openCancelDialog && (
        <CloseAddAccount
          open={openCancelDialog}
          setOpen={setOpenCancelDialog}
          setOpenAddAccount={setOpen}
        />
      )}
    </>
  );
}

AddUserDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

export default AddUserDialog;
