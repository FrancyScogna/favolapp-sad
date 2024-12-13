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
import { convertToAWSDate } from '../../../../../utils/stringManipulation';
import { createNewPazienteErrorHandler } from '../../errorHandlers';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../../slices/snackbar-slice';
import {
  compareAndReturnDifferencesSubObjects,
  compareArraysMissAdd,
  compareArraysMissUpdateAdd,
} from '../../../../../utils/objectManipulation';
import { editPaziente } from '../../../../../services/mutations';
const appsync = generateClient();

function ReviewPaziente({
  newPaziente,
  setStep,
  onClickClose,
  setOpenAddUserDialog,
  originalSessions,
  originalTutors,
  originalUser,
  fetchPaziente,
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

  function translateDay(day) {
    const daysOfWeek = {
      MONDAY: 'Lunedì',
      TUESDAY: 'Martedì',
      WEDNESDAY: 'Mercoledì',
      THURSDAY: 'Giovedì',
      FRIDAY: 'Venerdì',
      SATURDAY: 'Sabato',
      SUNDAY: 'Domenica',
    };

    return daysOfWeek[day.toUpperCase()] || 'Giorno non valido';
  }

  const verifyEditedFields = () => {};

  const onClickConfirm = async () => {
    setAlert(null);
    setLoading(true);
    verifyEditedFields();
    let { sessions, tutors, ...rest } = newPaziente;
    const isChangedUser = compareAndReturnDifferencesSubObjects(
      rest,
      originalUser
    );
    const isChangedSessions = compareArraysMissUpdateAdd(
      originalSessions,
      sessions
    );
    const isChangedTutors = compareArraysMissAdd(originalTutors, tutors);
    if (
      !isChangedUser &&
      isChangedSessions.areEqual &&
      isChangedTutors.areEqual
    ) {
      dispatch(
        showSnackbar({
          message: 'Non ci sono stati cambiamenti.',
          severity: 'warning',
        })
      );
      setLoading(false);
    } else {
      try {
        let updateUserInfo = {};
        updateUserInfo = { ...updateUserInfo, ...rest, provincia: rest.city };
        delete updateUserInfo.city;
        const BirthDate = convertToAWSDate(
          updateUserInfo.birthdate.day,
          updateUserInfo.birthdate.month,
          updateUserInfo.birthdate.year
        );
        updateUserInfo = { ...updateUserInfo, birthdate: BirthDate };

        if (!isChangedSessions.areEqual) {
          updateUserInfo = {
            ...updateUserInfo,
            sessions: {
              updatedItems: isChangedSessions.updatedItems.map((session) => {
                delete session.edit;
                delete session.dayName;
                session.weekDay = session.weekDay.toUpperCase();
                return session;
              }),
              addedItems: isChangedSessions.addedItems.map((session) => {
                delete session.edit;
                delete session.dayName;
                session.weekDay = session.weekDay.toUpperCase();
                return session;
              }),
              deletedItems: isChangedSessions.missingItems.map((session) => {
                delete session.edit;
                delete session.dayName;
                session.weekDay = session.weekDay.toUpperCase();
                return session;
              }),
            },
            sessionsCount:
              originalSessions.length +
              isChangedSessions.addedItems.length -
              isChangedSessions.missingItems.length,
          };
        }

        if (!isChangedTutors.areEqual) {
          updateUserInfo = {
            ...updateUserInfo,
            tutors: {
              addedItems: isChangedTutors.addedItems,
              deletedItems: isChangedTutors.removedItems,
            },
            tutorsCount:
              originalTutors.length +
              isChangedTutors.addedItems.length -
              isChangedTutors.removedItems.length,
          };
        }
        const data = await appsync.graphql({
          query: editPaziente,
          variables: {
            editPaziente: updateUserInfo,
          },
        });
        if (data && data.data.editPaziente) {
          dispatch(
            showSnackbar({
              message: "L'utente è stato registrato correttamente.",
            })
          );
          fetchPaziente();
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
                    {translateDay(item.weekDay)}
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
          Modifica paziente
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
  originalSessions: PropTypes.array,
  originalTutors: PropTypes.array,
  originalUser: PropTypes.object,
  fetchPaziente: PropTypes.func,
};

export default ReviewPaziente;
