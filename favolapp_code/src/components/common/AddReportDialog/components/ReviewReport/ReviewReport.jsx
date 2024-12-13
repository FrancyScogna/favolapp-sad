import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Button,
  Collapse,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import './ReviewReport.css';
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { generateClient } from 'aws-amplify/api';
import { createNewReport } from '../../../../../services/mutations';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../../../../../slices/snackbar-slice';
const appsync = generateClient();

function ReviewReport({
  newReport,
  setStep,
  onClickClose,
  setOpenAddUserDialog,
}) {
  const DialogContentRef = useRef();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const attributesReportList = [
    { attribute: 'Descrizione report', value: newReport.description },
    { attribute: 'Contenuto report', value: newReport.contenuto },
    { attribute: 'Pazienti assegnati', value: newReport.pazienteId },
  ];

  const onClickBack = () => {
    setStep(0);
  };

  const scrollDialogTop = () => {
    DialogContentRef.current.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const errorHandler = (errorName) => {
    switch (errorName) {
      case 'SomeSpecificError':
        return 'Specific error message.';
      // Aggiungi altri casi specifici se necessario
      default:
        return 'Si è verificato un errore. Per favore riprova.';
    }
  };

  const onClickConfirm = async () => {
    setAlert(null);
    setLoading(true);
    try {
      const data = await appsync.graphql({
        query: createNewReport,
        variables: {
          pazienteId: newReport.pazienteId,
          description: newReport.description,
          contenuto: newReport.contenuto,
          tutorId: user.id,
        },
      });
      if (data && data.data.createNewReport) {
        dispatch(
          showSnackbar({
            message: 'Il report è stato registrato correttamente.',
          })
        );
        setOpenAddUserDialog(false);
        setLoading(false);
      }
    } catch (error) {
      if (error) {
        let errorName = '';
        if (
          'errors' in error &&
          Array.isArray(error.errors) &&
          error.errors.length > 0
        ) {
          errorName = error.errors[0].errorType;
        } else {
          errorName = error.name;
        }
        const errorMessage = errorHandler(errorName);
        setTimeout(() => {
          setAlert(errorMessage);
          scrollDialogTop();
        }, 100);
      }
      setLoading(false);
    }
  };

  return (
    <DialogContent
      className='reviewreport-dialog-content'
      ref={DialogContentRef}
    >
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
              {'Informazioni sul report'}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        {attributesReportList.map((attr) => (
          <Grid key={attr.attribute} item className='grid-item'>
            <Typography className='attribute'>{attr.attribute}:</Typography>
            <Typography className='value'>{attr.value}</Typography>
          </Grid>
        ))}
      </Grid>
      <DialogActions>
        <Button className='close-button' color='error' onClick={onClickClose}>
          Chiudi
        </Button>
        <Button onClick={onClickBack}>Indietro</Button>
        <LoadingButton loading={loading} onClick={onClickConfirm}>
          Registra Report
        </LoadingButton>
      </DialogActions>
    </DialogContent>
  );
}

ReviewReport.propTypes = {
  newReport: PropTypes.object,
  setStep: PropTypes.func,
  onClickClose: PropTypes.func,
  setOpenAddUserDialog: PropTypes.func,
};

export default ReviewReport;
