import { useState } from 'react';
import { Dialog, DialogTitle, IconButton, Typography } from '@mui/material';
import './AddReportDialog.css';
import { Close } from '@mui/icons-material';
import CloseAddReport from './components/CloseAddDialog/CloseAddReport';
import CreateReport from './components/CreateReport/CreateReport';
import PropTypes from 'prop-types';
import ReviewReport from './components/ReviewReport/ReviewReport';
function AddReportDialog({ open, setOpen }) {
  const [newReport, setNewReport] = useState({
    description: '',
    contenuto: '',
    pazienteId: '',
  });
  const [step, setStep] = useState(0);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const onClickClose = () => {
    setOpenCancelDialog(true);
  };

  return (
    <>
      <Dialog className='addreport-dialog' open={open}>
        <DialogTitle className='dialog-title'>
          <Typography className='title'>
            {step === 0 && 'Aggiungi un report'}
            {step === 1 && 'Riepilogo del report'}
          </Typography>
          <IconButton onClick={onClickClose} className='close-icon-button'>
            <Close />
          </IconButton>
        </DialogTitle>
        {step === 0 && (
          <CreateReport
            newReport={newReport}
            setNewReport={setNewReport}
            setStep={setStep}
            onClickClose={onClickClose}
          />
        )}
        {step === 1 && (
          <ReviewReport
            newReport={newReport}
            setStep={setStep}
            onClickClose={onClickClose}
            setOpenAddUserDialog={setOpen}
          />
        )}
      </Dialog>
      {openCancelDialog && (
        <CloseAddReport
          open={openCancelDialog}
          setOpen={setOpenCancelDialog}
          setOpenAddreport={setOpen}
        />
      )}
    </>
  );
}
AddReportDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

export default AddReportDialog;
