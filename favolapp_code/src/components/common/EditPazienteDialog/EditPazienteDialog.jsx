import { Dialog, DialogTitle, IconButton, Typography } from '@mui/material';
import './EditPazienteDialog.css';
import { Close } from '@mui/icons-material';
import 'dayjs/locale/it';
import PropTypes from 'prop-types';
import EditPaziente from './components/EditPaziente/EditPaziente';
import CloseEditPaziente from './components/CloseEditPaziente/CloseEditPaziente';
import { useEffect, useState } from 'react';
import ReviewPaziente from './components/ReviewPaziente/ReviewPaziente';

function EditPazienteDialog({ open, setOpen, paziente, fetchPaziente }) {
  const [newPaziente, setNewPaziente] = useState({
    name: '',
    surname: '',
    email: '',
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
  const [originalSessions, setOriginalSessions] = useState([]);
  const [originalTutors, setOriginalTutors] = useState([]);
  const [originalUser, setOriginalUser] = useState({});

  const onClickClose = () => {
    setOpenCancelDialog(true);
  };

  useEffect(() => {
    if (paziente) {
      setNewPaziente(paziente);
      const splittedBirthdate = paziente.birthdate.split('-');
      setNewPaziente((prev) => ({
        ...prev,
        birthdate: {
          day: splittedBirthdate[2],
          month: splittedBirthdate[1],
          year: splittedBirthdate[0],
        },
        city: paziente.provincia,
        sessions: prev.sessions.map((session) => {
          session.weekDay = session.weekDay.toLowerCase();
          return session;
        }),
      }));
      const { sessions, tutors, ...rest } = paziente;
      setOriginalUser({
        ...rest,
        birthdate: {
          day: splittedBirthdate[2],
          month: splittedBirthdate[1],
          year: splittedBirthdate[0],
        },
        city: paziente.provincia,
      });
      if (tutors.length > 0) {
        setOriginalTutors(tutors);
      }
      if (sessions.length > 0) {
        setOriginalSessions(sessions);
      }
    }
  }, []);

  return (
    <>
      <Dialog className='editpaziente-dialog' open={open}>
        <DialogTitle className='dialog-title'>
          <Typography className='title'>
            {step === 0 && 'Modifica il paziente'}
            {step === 1 && 'Riepilogo del paziente'}
          </Typography>
          <IconButton onClick={onClickClose} className='close-icon-button'>
            <Close />
          </IconButton>
        </DialogTitle>
        {step === 0 && (
          <EditPaziente
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
            originalSessions={originalSessions}
            originalTutors={originalTutors}
            originalUser={originalUser}
            fetchPaziente={fetchPaziente}
          />
        )}
      </Dialog>
      {openCancelDialog && (
        <CloseEditPaziente
          open={openCancelDialog}
          setOpen={setOpenCancelDialog}
          setOpenAddAccount={setOpen}
        />
      )}
    </>
  );
}

EditPazienteDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  paziente: PropTypes.object,
  fetchPaziente: PropTypes.func,
};

export default EditPazienteDialog;
