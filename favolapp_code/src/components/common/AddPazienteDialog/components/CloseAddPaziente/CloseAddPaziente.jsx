import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import './CloseAddPaziente.css';
import PropTypes from 'prop-types';

function CloseAddPaziente({ open, setOpen, setOpenAddAccount }) {
  const onClickCancel = () => {
    setOpen(false);
  };

  const onClickCloseAll = () => {
    setOpen(false);
    setOpenAddAccount(false);
  };

  return (
    <Dialog open={open} className='closeaddaccount-dialog'>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>{"Annulla l'operazione"}</Typography>
      </DialogTitle>
      <DialogContent className='dialog-content'>
        <Typography className='description'>
          Chiudendo il form, tutti i dati inseriti andranno persi.
        </Typography>
        <Typography className='description-bold'>
          Annulla per proseguire con la registrazione del paziente altrimenti
          <br />
          Chiudi Registrazione.
        </Typography>
        <DialogActions>
          <Button onClick={onClickCancel}>Annulla</Button>
          <Button color='error' onClick={onClickCloseAll}>
            Chiudi registrazione
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

CloseAddPaziente.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  setOpenAddAccount: PropTypes.func,
};

export default CloseAddPaziente;
