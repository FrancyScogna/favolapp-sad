import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import './CloseAddReport.css';
import PropTypes from 'prop-types';

function CloseAddReport({ open, setOpen, setOpenAddreport }) {
  const onClickCancel = () => {
    setOpen(false);
  };

  const onClickCloseAll = () => {
    setOpen(false);
    setOpenAddreport(false); // Assicurati di chiamare correttamente la funzione
  };

  return (
    <Dialog open={open} className='closeaddreport-dialog'>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>{"Annulla l'operazione"}</Typography>
      </DialogTitle>
      <DialogContent className='dialog-content'>
        <Typography className='description'>
          Chiudendo il form, tutti i dati inseriti andranno persi.
        </Typography>
        <Typography className='description-bold'>
          Annulla per proseguire con la creazione del report altrimenti
          <br />
          Chiudi Aggiunta report.
        </Typography>
        <DialogActions>
          <Button onClick={onClickCancel}>Annulla</Button>
          <Button color='error' onClick={onClickCloseAll}>
            Chiudi aggiunta report
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
CloseAddReport.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  setOpenAddreport: PropTypes.func,
};

export default CloseAddReport;
