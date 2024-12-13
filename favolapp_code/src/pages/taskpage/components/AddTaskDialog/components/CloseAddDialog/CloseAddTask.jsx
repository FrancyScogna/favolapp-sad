import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import './CloseAddTask.css';
import PropTypes from 'prop-types';

function CloseAddTask({ open, setOpen, setOpenAddTask }) {
  const onClickCancel = () => {
    setOpen(false);
  };

  const onClickCloseAll = () => {
    setOpen(false);
    setOpenAddTask(false); // Assicurati di chiamare correttamente la funzione
  };

  return (
    <Dialog open={open} className='closeaddtask-dialog'>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>{"Annulla l'operazione"}</Typography>
      </DialogTitle>
      <DialogContent className='dialog-content'>
        <Typography className='description'>
          Chiudendo il form, tutti i dati inseriti andranno persi.
        </Typography>
        <Typography className='description-bold'>
          Annulla per proseguire con la creazione della task altrimenti
          <br />
          Chiudi Aggiunta Task.
        </Typography>
        <DialogActions>
          <Button onClick={onClickCancel}>Annulla</Button>
          <Button color='error' onClick={onClickCloseAll}>
            Chiudi aggiunta task
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
CloseAddTask.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  setOpenAddTask: PropTypes.func,
};

export default CloseAddTask;
