import {
  Alert,
  Button,
  Collapse,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import './CreateReport.css';

import { Delete } from '@mui/icons-material';

import { LoadingButton } from '@mui/lab';
import { useRef, useState, useEffect } from 'react';
import SearchAndSelectPazienti from '../../../AddPazienteDialog/components/SearchAndSelectPazienti/SearchAndSelectPazienti';
import PropTypes from 'prop-types';

function CreateReport({ newReport, setNewReport, onClickClose, setStep }) {
  const [alert, setAlert] = useState(null);
  const DialogContentRef = useRef(null);
  const [openSearchAndSelect, setOpenSearchAndSelect] = useState(false);
  const [pazienti, setPazienti] = useState([]);
  const [error, setError] = useState({
    description: false,
    contenuto: false,
    pazienteId: false,
  });

  useEffect(() => {
    if (pazienti.length > 0) {
      const lastPaziente = pazienti[pazienti.length - 1];
      setNewReport((prev) => ({ ...prev, pazienteId: lastPaziente.id }));
    }
  }, [pazienti]);

  const onChangeDescription = (event) => {
    const text = event.target.value;
    setNewReport((prev) => ({ ...prev, description: text }));
  };

  const onChangeContenuto = (event) => {
    const text = event.target.value;
    setNewReport((prev) => ({ ...prev, contenuto: text }));
  };

  const onClickDeleteTutor = (id) => {
    setPazienti((prevPazienti) => {
      return prevPazienti.filter((paziente) => paziente.id !== id);
    });
  };

  const scrollDialogTop = () => {
    DialogContentRef.current.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const checkValues = async () => {
    let foundEmptyValue = false;

    if (!newReport.description || newReport.description.trim() === '') {
      setError((prev) => ({ ...prev, description: true }));
      foundEmptyValue = true;
    } else {
      setError((prev) => ({ ...prev, description: false }));
    }

    if (!newReport.contenuto || newReport.contenuto.trim() === '') {
      setError((prev) => ({ ...prev, contenuto: true }));
      foundEmptyValue = true;
    } else {
      setError((prev) => ({ ...prev, contenuto: false }));
    }

    if (!newReport.pazienteId) {
      setError((prev) => ({ ...prev, pazienteId: true }));
      foundEmptyValue = true;
    } else {
      setError((prev) => ({ ...prev, pazienteId: false }));
    }

    if (foundEmptyValue) {
      setAlert(
        'Verifica che tutti i campi siano stati compilati correttamente.'
      );
      scrollDialogTop();
      return false;
    } else {
      setAlert(null);
      return true;
    }
  };

  const onClickConfirm = async () => {
    setAlert(null);
    setError({
      description: false,
      contenuto: false,
      pazienteId: false,
    });

    const pass = await checkValues();
    if (pass) {
      setStep(1);
    }
  };

  return (
    <DialogContent ref={DialogContentRef} className='createreport-dialog'>
      <Grid container className='grid-container'>
        <Collapse in={alert ? true : false} style={{ width: '100%' }}>
          <Grid item className='grid-item'>
            <Alert variant='filled' severity='error' className='alert'>
              {alert &&
                alert.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
            </Alert>
          </Grid>
        </Collapse>
        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>
              {'Informazioni report'}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            value={newReport.description}
            size='small'
            className='text-field'
            label='Descrizione report*'
            onChange={onChangeDescription}
            error={error.description}
            helperText={error.description ? 'Descrizione richiesta' : ''}
          />
        </Grid>

        <Grid item className='grid-item'>
          <TextField
            className='info-report'
            value={newReport.contenuto}
            multiline
            label='Contenuto report'
            onChange={onChangeContenuto}
            error={error.contenuto}
            helperText={error.contenuto ? 'Contenuto richiesto' : ''}
          />
        </Grid>

        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>
              {'Assegna Paziente'}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          <Button
            variant='outlined'
            onClick={() => setOpenSearchAndSelect(true)}
            error={error.pazienteId}
          >
            Scegli Paziente
          </Button>
          {openSearchAndSelect && (
            <SearchAndSelectPazienti
              type='paziente'
              open={openSearchAndSelect}
              setOpen={setOpenSearchAndSelect}
              setArray={setPazienti}
              array={pazienti}
            />
          )}
        </Grid>
        {pazienti.length > 0 && (
          <Grid item className='grid-item' flexDirection='column'>
            {pazienti.map((paziente) => (
              <div key={paziente.id} className='tutor-div'>
                <Typography noWrap className='item-fold'>
                  {paziente.name}
                </Typography>
                <Typography noWrap className='item-fold'>
                  {paziente.surname}
                </Typography>
                <Typography noWrap className='item-fold'>
                  {paziente.role}
                </Typography>
                <Typography noWrap className='item-fold'>
                  {paziente.codfis}
                </Typography>
                <IconButton
                  className='icon-button'
                  onClick={() => onClickDeleteTutor(paziente.id)}
                >
                  <Delete />
                </IconButton>
              </div>
            ))}
          </Grid>
        )}
      </Grid>
      <DialogActions>
        <Button onClick={onClickClose} color='error'>
          Chiudi
        </Button>
        <LoadingButton onClick={onClickConfirm}>Avanti</LoadingButton>
      </DialogActions>
    </DialogContent>
  );
}
CreateReport.propTypes = {
  newReport: PropTypes.object,
  setNewReport: PropTypes.func,
  onClickClose: PropTypes.func,
  setStep: PropTypes.func,
};

export default CreateReport;
