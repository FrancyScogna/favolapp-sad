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
import './ReviewPaziente.css';
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { generateClient } from 'aws-amplify/api';
import { createNewPaziente } from '../../../../../services/mutations';
import { convertToAWSDate } from '../../../../../utils/stringManipulation';
import { createNewPazienteErrorHandler } from '../../errorHandlers';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../../slices/snackbar-slice';
const appsync = generateClient();

function ReviewPaziente({
  newPaziente,
  setStep,
  onClickClose,
  setOpenAddUserDialog,
}) {
  const DialogContentRef = useRef();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const dispatch = useDispatch();

  const attributesUserList = [
    { attribute: 'Nome', value: newPaziente.name },
    { attribute: 'Cognome', value: newPaziente.surname },
    {
      attribute: 'Email',
      value: newPaziente.email ? newPaziente.email : 'Non indicata',
    },
    {
      attribute: 'Numero di telefono',
      value: newPaziente.phone_number.split(' ')[1]
        ? newPaziente.phone_number
        : 'Non indicato',
    },
    {
      attribute: 'Data di nascita',
      value: `${String(newPaziente.birthdate.day).padStart(2, '0')}/${String(newPaziente.birthdate.month).padStart(2, '0')}/${newPaziente.birthdate.year}`,
    },
    { attribute: 'Genere', value: newPaziente.gender },
    { attribute: 'Codice fiscale', value: newPaziente.codfis },
    { attribute: 'Provincia', value: newPaziente.city },
    { attribute: 'Comune', value: newPaziente.comune },
    { attribute: 'Area di trattamento', value: newPaziente.treatment },
    {
      attribute: 'Info',
      value: newPaziente.info ? newPaziente.info : 'Non indicato',
    },
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

  async function processSessions(sessions) {
    if (sessions.length === 0) return [];

    // Crea una copia del vettore sessions
    const sessionsCopy = sessions.map((session) => ({ ...session }));

    return Promise.all(
      sessionsCopy.map(async (session) => {
        // Applica le modifiche alla copia
        delete session.id;
        delete session.dayName;
        session.weekDay = session.weekDay.toUpperCase();

        // Restituisci la copia modificata
        return session;
      })
    );
  }

  async function processTutors(tutors) {
    if (tutors.length === 0) return [];
    return Promise.all(
      tutors.map(async (tutor) => {
        tutor = { id: tutor.id };
        return tutor;
      })
    );
  }

  const onClickConfirm = async () => {
    setAlert(null);
    setLoading(true);
    try {
      const BirthDate = convertToAWSDate(
        newPaziente.birthdate.day,
        newPaziente.birthdate.month,
        newPaziente.birthdate.year
      );
      const data = await appsync.graphql({
        query: createNewPaziente,
        variables: {
          newPaziente: {
            email: newPaziente.email ? newPaziente.email : null,
            name: newPaziente.name,
            surname: newPaziente.surname,
            birthdate: BirthDate,
            phone_number: newPaziente.phone_number
              ? newPaziente.phone_number
              : '',
            gender: newPaziente.gender,
            codfis: newPaziente.codfis,
            provincia: newPaziente.city,
            comune: newPaziente.comune,
            treatment: newPaziente.treatment,
            info: newPaziente.info ? newPaziente.info : '',
            sessions: await processSessions(newPaziente.sessions),
            sessionsCount: 0,
            tutors: await processTutors(newPaziente.tutors),
            tutorsCount: 0,
          },
        },
      });
      if (data && data.data.createNewPaziente) {
        dispatch(
          showSnackbar({
            message: "L'utente è stato registrato correttamente.",
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
        const errorMessage = createNewPazienteErrorHandler(errorName);
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
      className='reviewpaziente-dialog-content'
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
              {"Informazioni sull'utente"}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        {attributesUserList.map((attr) => (
          <Grid key={attr.attribute} item className='grid-item'>
            <Typography className='attribute'>{attr.attribute}:</Typography>
            <Typography className='value'>{attr.value}</Typography>
          </Grid>
        ))}
        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>
              {'Sessioni settimanali'}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          {newPaziente.sessions.length > 0 ? (
            <div className='sessions-list'>
              {newPaziente.sessions.map((item) => (
                <div className='session-item' key={item.id}>
                  <Typography className='attribute'>Giorno:</Typography>
                  <Typography className='value' marginRight='10px'>
                    {item.dayName}
                  </Typography>
                  <Typography className='attribute'>Inizio:</Typography>
                  <Typography className='value' marginRight='10px'>
                    {item.startTime}
                  </Typography>
                  <Typography className='attribute'>Fine:</Typography>
                  <Typography className='value' marginRight='10px'>
                    {item.endTime}
                  </Typography>
                </div>
              ))}
            </div>
          ) : (
            <Typography>
              Non sono state indicate sessioni settimanali.
            </Typography>
          )}
        </Grid>
        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>
              {'Tutor assegnati'}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          {newPaziente.tutors.length > 0 ? (
            <div className='tutors-list'>
              {newPaziente.tutors.map((item) => (
                <div className='tutor-item' key={item.id}>
                  <Typography className='attribute' marginRight='10px'>
                    {item.name}
                  </Typography>
                  <Typography className='attribute' marginRight='10px'>
                    {item.surname}
                  </Typography>
                  <Typography className='attribute' marginRight='10px'>
                    {item.role}
                  </Typography>
                  <Typography className='attribute' marginRight='10px'>
                    {item.codfis}
                  </Typography>
                </div>
              ))}
            </div>
          ) : (
            <Typography>
              Non sono stati assegnati tutor per il paziente.
            </Typography>
          )}
        </Grid>
      </Grid>
      <DialogActions>
        <Button className='close-button' color='error' onClick={onClickClose}>
          Chiudi
        </Button>
        <Button onClick={onClickBack}>Indietro</Button>
        <LoadingButton loading={loading} onClick={onClickConfirm}>
          Registra paziente
        </LoadingButton>
      </DialogActions>
    </DialogContent>
  );
}

ReviewPaziente.propTypes = {
  newPaziente: PropTypes.object,
  setStep: PropTypes.func,
  onClickClose: PropTypes.func,
  setOpenAddUserDialog: PropTypes.func,
};

export default ReviewPaziente;
