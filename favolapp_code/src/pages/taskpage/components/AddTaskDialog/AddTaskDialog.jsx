import { useState } from 'react';
import { Dialog, DialogTitle, IconButton, Typography } from '@mui/material';
import './AddTaskDialog.css';
import { Close } from '@mui/icons-material';
import CloseAddTask from './components/CloseAddDialog/CloseAddTask';
import CreateTask from './components/CreateTask/CreateTask';
import PropTypes from 'prop-types';
function AddTaskDialog({ open, setOpen }) {
  const [newtask, setNewtask] = useState({
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
      <Dialog className='addtask-dialog' open={open}>
        <DialogTitle className='dialog-title'>
          <Typography className='title'>
            {step === 0 && 'Aggiungi una Task'}
            {step === 1 && 'Riepilogo del task'}
          </Typography>
          <IconButton onClick={onClickClose} className='close-icon-button'>
            <Close />
          </IconButton>
        </DialogTitle>
        {step === 0 && (
          <CreateTask
            newTask={newtask}
            setNewTask={setNewtask}
            setStep={setStep}
            onClickClose={onClickClose}
          />
        )}
      </Dialog>
      {openCancelDialog && (
        <CloseAddTask
          open={openCancelDialog}
          setOpen={setOpenCancelDialog}
          setOpenAddTask={setOpen}
        />
      )}
    </>
  );
}
AddTaskDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

export default AddTaskDialog;
