import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import './EditReportDialog.css';

import { Close } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { editReport } from '../../../services/mutations';
import { showSnackbar } from '../../../slices/snackbar-slice';
import { generateClient } from 'aws-amplify/api';
import { traverseObject } from '../../../utils/objectManipulation';

const appsync = generateClient();

function EditReportDialog({ open, setOpen, reportData, setReportData }) {
  const [newReport, setNewReport] = useState({
    description: reportData.description || '',
    contenuto: reportData.contenuto || '',
  });
  const [error, setError] = useState({
    description: false,
    contenuto: false,
  });
  const [alert, setAlert] = useState(null);
  const DialogContentRef = useRef(null);
  const dispatch = useDispatch();
  const [loadingMutation, setLoadingMutation] = useState(false);

  useEffect(() => {
    setNewReport({
      description: reportData.description || '',
      contenuto: reportData.contenuto || '',
    });
  }, [reportData]);

  const onChangeDescription = (event) => {
    setError((prev) => ({ ...prev, description: false }));
    const text = event.target.value;
    setNewReport((prev) => ({ ...prev, description: text }));
  };

  const onChangeContenuto = (event) => {
    setError((prev) => ({ ...prev, contenuto: false }));
    const text = event.target.value;
    setNewReport((prev) => ({ ...prev, contenuto: text }));
  };

  const scrollDialogTop = () => {
    DialogContentRef.current.scrollTop = 0;
  };

  const checkValues = async () => {
    let tempReport = {
      description: newReport.description,
      contenuto: newReport.contenuto,
    };

    let foundEmptyValue = false;
    await traverseObject(tempReport, async (fieldpath, value) => {
      if (value === '' || value === undefined || value === null) {
        setError((prev) => ({ ...prev, [fieldpath]: true }));
        foundEmptyValue = true;
      } else {
        setError((prev) => ({ ...prev, [fieldpath]: false }));
      }
    });

    if (foundEmptyValue) {
      setAlert(
        'Verifica che tutti i campi siano stati compilati correttamente.'
      );
      scrollDialogTop();
      return false;
    }

    if (
      newReport.description === reportData.description &&
      newReport.contenuto === reportData.contenuto
    ) {
      setAlert('Non sono state effettuate modifiche');
      scrollDialogTop();
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setLoadingMutation(true);
    setAlert(null);
    setError({
      description: false,
      contenuto: false,
    });

    const pass = await checkValues();
    if (pass) {
      try {
        const result = await appsync.graphql({
          query: editReport,
          variables: {
            reportId: reportData.reportId,
            pazienteId: reportData.pazienteId,
            description: newReport.description,
            contenuto: newReport.contenuto,
          },
        });

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        dispatch(
          showSnackbar({
            message: 'Report modificato con successo!',
            severity: 'success',
          })
        );
        setReportData((prev) => ({
          ...prev,
          reportId: reportData.reportId,
          pazienteId: reportData.pazienteId,
          description: newReport.description,
          contenuto: newReport.contenuto,
        }));
        setOpen(false);
      } catch (error) {
        console.error('Errore durante la modifica del report:', error);
        dispatch(
          showSnackbar({
            message: `Errore durante la modifica del report: ${error.message}`,
            severity: 'error',
          })
        );
      }
    } else {
      dispatch(
        showSnackbar({
          message: 'Non sono state effettuate modifiche',
          severity: 'warning',
        })
      );
    }
    setLoadingMutation(false);
  };

  return (
    <Dialog className='edituser-dialog' open={open}>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>Modifica informazioni report</Typography>
        <IconButton
          onClick={() => setOpen(false)}
          className='close-icon-button'
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent ref={DialogContentRef}>
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
                Descrizione report
              </Typography>
              <Divider className='section-divider' />
            </div>
          </Grid>
          <Grid item className='grid-item'>
            <TextField
              value={newReport.description}
              size='small'
              className='text-field'
              label='Descrizione'
              error={error.description}
              onChange={onChangeDescription}
            />
          </Grid>
          <Grid item className='grid-item'>
            <TextField
              value={newReport.contenuto}
              size='small'
              className='text-field'
              label='Contenuto'
              multiline
              error={error.contenuto}
              onChange={onChangeContenuto}
            />
          </Grid>
          <Grid item className='grid-item' flexDirection='column'>
            <div key={reportData.pazienteId} className='paz-div'>
              <Typography noWrap className='item-fold-paz'>
                {reportData.pazienteName}
              </Typography>
              <Typography noWrap className='item-fold-paz'>
                {reportData.pazienteSurname}
              </Typography>
              <Typography noWrap className='item-fold-paz'>
                {reportData.pazienteCodFis}
              </Typography>
            </div>
          </Grid>
        </Grid>

        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
            }}
            color='error'
          >
            Chiudi
          </Button>
          <LoadingButton
            onClick={handleSave}
            loading={loadingMutation}
            color='primary'
          >
            Salva
          </LoadingButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

EditReportDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  reportData: PropTypes.object,
  setReportData: PropTypes.func,
};

export default EditReportDialog;
