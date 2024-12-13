import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import './CloseEditPaziente.css';
import PropTypes from 'prop-types';

function CloseEditPaziente({ open, setOpen, setOpenAddAccount }) {
  const onClickCancel = () => {
    setOpen(false);
  };

  const onClickCloseAll = () => {
    setOpen(false);
    setOpenAddAccount(false);
  };

  return (
    <Dialog open={open} className='closeeditpaziente-dialog'>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>{"Annulla l'operazione"}</Typography>
      </DialogTitle>
      <DialogContent className='dialog-content'>
        <Typography className='description'>
          Chiudendo il form, tutte le modifiche effettuate andranno perse.
        </Typography>
        <Typography className='description-bold'>
          Annulla per proseguire con la registrazione del paziente altrimenti
          <br />
          Chiudi modifica.
        </Typography>
        <DialogActions>
          <Button onClick={onClickCancel}>Annulla</Button>
          <Button color='error' onClick={onClickCloseAll}>
            Chiudi modifica
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

CloseEditPaziente.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  setOpenAddAccount: PropTypes.func,
};

export default CloseEditPaziente;
