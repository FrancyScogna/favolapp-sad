import { Dialog, DialogTitle, IconButton, Typography } from '@mui/material';
import './AddPazienteDialog.css';
import { Close } from '@mui/icons-material';
import 'dayjs/locale/it';
import PropTypes from 'prop-types';
import CreatePaziente from './components/CreatePaziente/CreatePaziente';
import CloseAddPaziente from './components/CloseAddPaziente/CloseAddPaziente';
import { useState } from 'react';
import ReviewPaziente from './components/ReviewPaziente/ReviewPaziente';

function AddPazienteDialog({ open, setOpen }) {
  const [newPaziente, setNewPaziente] = useState({
    name: '',
    surname: '',
    email: '',
    phone_number: '',
    birthdate: { day: '', month: '', year: '' },
    gender: '',
    codfis: '',
    city: '',
    comune: '',
    info: '',
    treatment: '',
    sessions: [],
    sessionsCount: 0,
    tutors: [],
    tutorsCount: 0,
  });
  const [step, setStep] = useState(0);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  const onClickClose = () => {
    setOpenCancelDialog(true);
  };

  return (
    <>
      <Dialog className='addpaziente-dialog' open={open}>
        <DialogTitle className='dialog-title'>
          <Typography className='title'>
            {step === 0 && 'Aggiungi un nuovo paziente'}
            {step === 1 && 'Riepilogo del paziente'}
          </Typography>
          <IconButton onClick={onClickClose} className='close-icon-button'>
            <Close />
          </IconButton>
        </DialogTitle>
        {step === 0 && (
          <CreatePaziente
            newPaziente={newPaziente}
            setNewPaziente={setNewPaziente}
            setStep={setStep}
            onClickClose={onClickClose}
          />
        )}
        {step === 1 && (
          <ReviewPaziente
            newPaziente={newPaziente}
            setStep={setStep}
            onClickClose={onClickClose}
            setOpenAddUserDialog={setOpen}
          />
        )}
      </Dialog>
      {openCancelDialog && (
        <CloseAddPaziente
          open={openCancelDialog}
          setOpen={setOpenCancelDialog}
          setOpenAddAccount={setOpen}
        />
      )}
    </>
  );
}

AddPazienteDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

export default AddPazienteDialog;
