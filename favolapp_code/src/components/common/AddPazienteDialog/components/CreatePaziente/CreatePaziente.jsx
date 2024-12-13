import {
  Alert,
  Button,
  CircularProgress,
  Collapse,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import './CreatePaziente.css';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Delete, Error } from '@mui/icons-material';
import PhoneNumberInput from '../../../PhoneNumberInput/PhoneNumberInput';
import { LoadingButton } from '@mui/lab';
import { useEffect, useRef, useState } from 'react';
import { removeSpacesFromString } from '../../../../../utils/stringManipulation';
import 'dayjs/locale/it';
import { traverseObject } from '../../../../../utils/objectManipulation';
import comuniJSON from '../../../../../utils/metadata/comuni.json';
import provinceJSON from '../../../../../utils/metadata/province.json';
import CodiceFiscale from 'codice-fiscale-js';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import SearchAndSelect from '../../../SearchAndSelectDialog/SearchAndSelect';

const weekDays = [
  { id: 0, name: 'Lunedì', value: 'monday' },
  { id: 1, name: 'Martedì', value: 'tuesday' },
  { id: 2, name: 'Mercoledì', value: 'wednesday' },
  { id: 3, name: 'Giovedì', value: 'thursday' },
  { id: 4, name: 'Venerdì', value: 'friday' },
  { id: 5, name: 'Sabato', value: 'saturday' },
  { id: 6, name: 'Domenica', value: 'sunday' },
];

function CreatePaziente({
  newPaziente,
  setNewPaziente,
  onClickClose,
  setStep,
}) {
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(false);
  const [error, setError] = useState({
    name: false,
    surname: false,
    email: false,
    phone_number: false,
    birthdate: false,
    codfis: false,
    gender: false,
    city: false,
    comune: false,
    treatment: false,
    sessions: false,
  });
  const [alert, setAlert] = useState(null);
  const DialogContentRef = useRef(null);
  const [comuni, setComuni] = useState(null);
  const [comuniLoading, setComuniLoading] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(null);
  const [selectedComune, setSelectedComune] = useState('');
  const [sessions, setSessions] = useState([]);
  const [openSearchAndSelect, setOpenSearchAndSelect] = useState(false);
  const [tutors, setTutors] = useState([]);

  //Gestione del caricamento e del attivazione o meno del selector dei comuni
  useEffect(() => {
    setComuniLoading(true);
    setSelectedComune('');
    var prevCom = null;
    if (newPaziente.comune) {
      prevCom = newPaziente.comune;
    }
    if (newPaziente.city) {
      const comuniArray = comuniJSON.filter(
        (item) => item.provincia === newPaziente.city
      );
      setComuni(comuniArray);
      const thereIsPrevComune = comuniArray.find(
        (item) => item.comune === prevCom
      );
      if (thereIsPrevComune) {
        setNewPaziente((prev) => ({
          ...prev,
          comune: thereIsPrevComune.comune,
        }));
        setSelectedComune(thereIsPrevComune.comune);
      } else {
        setNewPaziente((prev) => ({ ...prev, comune: '' }));
        setSelectedComune('');
      }
      setComuniLoading(false);
    }
  }, [newPaziente.city]);

  useEffect(() => {
    if (
      newPaziente.birthdate.day &&
      newPaziente.birthdate.month &&
      newPaziente.birthdate.year
    ) {
      setDatePickerValue(
        dayjs(
          `${newPaziente.birthdate.month}-${newPaziente.birthdate.day}-${newPaziente.birthdate.year}`
        )
      );
    }
  }, [newPaziente]);

  //Funzioni per il cambio dei parametri nel form
  const onChangeName = (event) => {
    setError((prev) => ({ ...prev, name: false }));
    const text = event.target.value;
    setNewPaziente((prev) => ({ ...prev, name: text }));
  };

  const onChangeSurname = (event) => {
    setError((prev) => ({ ...prev, surname: false }));
    const text = event.target.value;
    setNewPaziente((prev) => ({ ...prev, surname: text }));
  };

  const onChangeEmail = (event) => {
    setError((prev) => ({ ...prev, email: false }));
    const text = removeSpacesFromString(event.target.value);
    setNewPaziente((prev) => ({ ...prev, email: text }));
  };

  const onChangePhoneNumber = (phone_number) => {
    setError((prev) => ({ ...prev, phone_number: false }));
    setNewPaziente((prev) => ({ ...prev, phone_number: phone_number }));
  };

  const onChangeBirthdate = (event) => {
    setError((prev) => ({
      ...prev,
      birthdate: false,
      ['birthdate.day']: false,
      ['birthdate.month']: false,
      ['birthdate.year']: false,
    }));
    if (event) {
      const day = isNaN(event.$D) ? '' : event.$D;
      const month = isNaN(event.$M) ? '' : event.$M + 1;
      const year = isNaN(event.$y) ? '' : event.$y;
      setNewPaziente((prev) => ({ ...prev, birthdate: { day, month, year } }));
    } else {
      setNewPaziente((prev) => ({
        ...prev,
        birthdate: { day: '', month: '', year: '' },
      }));
    }
  };

  const onSelectGender = (event) => {
    setError((prev) => ({ ...prev, gender: false }));
    const gender = event.target.value;
    setNewPaziente((prev) => ({ ...prev, gender }));
  };

  const onChangeCodFis = (event) => {
    setError((prev) => ({ ...prev, codfis: false }));
    const text = event.target.value.toUpperCase();
    setNewPaziente((prev) => ({ ...prev, codfis: text }));
  };

  const onSelectCity = (event) => {
    setError((prev) => ({ ...prev, city: false }));
    const city = event.target.value;
    setNewPaziente((prev) => ({ ...prev, city }));
  };

  const onSelectComune = (event) => {
    setError((prev) => ({ ...prev, comune: false }));
    const comune = event.target.value;
    setNewPaziente((prev) => ({ ...prev, comune }));
    setSelectedComune(comune);
  };

  const onChangeTreatment = (event) => {
    setError((prev) => ({ ...prev, treatment: false }));
    const text = event.target.value;
    setNewPaziente((prev) => ({ ...prev, treatment: text }));
  };

  const onChangeInfo = (event) => {
    const text = event.target.value;
    setNewPaziente((prev) => ({ ...prev, info: text }));
  };

  const onClickAddSession = () => {
    const newSession = {
      id: sessions.length === 0 ? 0 : sessions.length,
      weekDay: null,
      startTime: null,
      endTime: null,
    };
    setSessions((prev) => [...prev, newSession]);
  };

  const onClickDeleteSession = (id) => {
    setSessions((prevSessions) => {
      const filteredSessions = prevSessions.filter(
        (session) => session.id !== id
      );
      return filteredSessions.map((session, index) => ({
        ...session,
        id: index,
      }));
    });
  };

  const onChangeSessionDay = (e, id) => {
    const day = weekDays.find((item) => item.value === e.target.value);
    setError((prev) => ({ ...prev, sessions: false }));
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === id
          ? { ...session, weekDay: e.target.value, dayName: day.name }
          : session
      )
    );
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
  };

  const onChangeSessionStartTime = (e, id) => {
    setError((prev) => ({ ...prev, sessions: false }));
    if (e) {
      const startTime = formatTime(`${e.$H}:${e.$m}`);
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === id ? { ...session, startTime } : session
        )
      );
    } else {
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === id ? { ...session, startTime: null } : session
        )
      );
    }
  };

  const onChangeSessionEndTime = (e, id) => {
    setError((prev) => ({ ...prev, sessions: false }));
    if (e) {
      const endTime = formatTime(`${e.$H}:${e.$m}`);
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === id ? { ...session, endTime } : session
        )
      );
    } else {
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === id ? { ...session, endTime: null } : session
        )
      );
    }
  };

  const onClickDeleteTutor = (id) => {
    setTutors((prevTutors) => {
      return prevTutors.filter((tutor) => tutor.id !== id);
    });
  };

  const scrollDialogTop = () => {
    DialogContentRef.current.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  //Controllo dei valori e gestione degli errori
  const checkValues = async () => {
    //Verifica campi vuoti
    let foundEmptyValue = false;
    await traverseObject(newPaziente, async (fieldpath, value) => {
      if (
        (value === '' || value === undefined || value === null) &&
        fieldpath !== 'email' &&
        fieldpath !== 'phone_number' &&
        fieldpath !== 'info' &&
        fieldpath !== 'tutors' &&
        fieldpath !== 'sessions'
      ) {
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
    let errorMessage = '';
    let passEmail = false;
    //Verifica del formato email
    if (newPaziente.email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(newPaziente.email)) {
        errorMessage += 'Formato email non valido.\n';
        passEmail = false;
        setError((prev) => ({ ...prev, email: true }));
      } else {
        passEmail = true;
      }
    } else {
      passEmail = true;
    }
    //Verifica del numero di telefono
    let passPhoneNumber = false;
    let thereIsPhoneNumber = false;
    if (newPaziente.phone_number) {
      const content = newPaziente.phone_number.split(' ')[1];
      if (content) {
        thereIsPhoneNumber = true;
      } else {
        thereIsPhoneNumber = false;
      }
    }
    if (thereIsPhoneNumber) {
      if (isValidPhoneNumber) {
        passPhoneNumber = true;
      } else {
        passPhoneNumber = false;
        errorMessage += 'Il numero di telefono non è valido.\n';
        setError((prev) => ({ ...prev, phone_number: true }));
      }
    } else {
      passPhoneNumber = true;
    }

    //Verifica codice fiscale
    //Step1. Codice inserito
    let passInsertCodFis = false;
    try {
      const insertCodFis = new CodiceFiscale(newPaziente.codfis);
      insertCodFis.isValid();
      passInsertCodFis = true;
    } catch (e) {
      passInsertCodFis = false;
      errorMessage += 'Il codice fiscale inserito non è valido.\n';
      setError((prev) => ({ ...prev, codfis: true }));
    }

    //Step2. Dati inseriti
    let passCheckCodFis = false;
    if (passInsertCodFis) {
      const cf = new CodiceFiscale({
        name: newPaziente.name,
        surname: newPaziente.surname,
        gender: newPaziente.gender,
        day: newPaziente.birthdate.day,
        month: newPaziente.birthdate.month,
        year: newPaziente.birthdate.year,
        birthplace: newPaziente.comune,
        birthplaceProvincia: newPaziente.city,
      });
      if (cf.cf === newPaziente.codfis) {
        passCheckCodFis = true;
      } else {
        passCheckCodFis = false;
        errorMessage +=
          "Il codice fiscale inserito non coincide con i dati dell'utente.\n";
        setError((prev) => ({ ...prev, codfis: true }));
      }
    } else {
      passCheckCodFis = true;
    }

    let passSessions = false;
    if (sessions.length > 0) {
      let thereIsError = false;
      sessions.map(async (session) => {
        if (thereIsError) return;
        await traverseObject(session, (field, value) => {
          if (field !== 'dayName') {
            if (
              (value === '' ||
                value === undefined ||
                value === null ||
                value === 'NaN:NaN') &&
              !thereIsError
            ) {
              setError((prev) => ({ ...prev, sessions: true }));
              errorMessage +=
                'Verifica che i campi delle sessioni sono compilati correttamente';
              thereIsError = true;
            }
          }
        });
      });
      if (thereIsError) {
        passSessions = false;
      } else {
        passSessions = true;
      }
    } else {
      passSessions = true;
    }

    if (
      passEmail &&
      passCheckCodFis &&
      passInsertCodFis &&
      passPhoneNumber &&
      passSessions
    ) {
      setAlert(null);
      return true;
    } else {
      errorMessage = errorMessage.trim() !== '' ? errorMessage.trim() : null;
      setAlert(errorMessage);
      scrollDialogTop();
      return false;
    }
  };

  const checkErrorObject = async () => {
    let thereAreErrors = false;
    await traverseObject(error, (_, value) => {
      if (value === true) {
        thereAreErrors = true;
      }
    });
    if (!thereAreErrors) {
      setAlert(null);
    }
  };

  useEffect(() => {
    checkErrorObject();
  }, [error]);

  //Operazioni
  const onClickConfirm = () => {
    //Reset degli errori
    setAlert(null);
    setError({
      name: false,
      surname: false,
      email: false,
      phone_number: false,
      birthdate: false,
      codfis: false,
      gender: false,
      city: false,
      comune: false,
      treatment: false,
      sessions: false,
    });
    setTimeout(async () => {
      const pass = await checkValues();
      if (pass) {
        if (tutors.length > 0) {
          setNewPaziente((prev) => ({
            ...prev,
            tutors,
            tutorsCount: tutors.length,
          }));
        } else {
          setNewPaziente((prev) => ({ ...prev, tutors: [], tutorsCount: 0 }));
        }
        if (sessions.length > 0) {
          setNewPaziente((prev) => ({
            ...prev,
            sessions,
            sessionsCount: sessions.length,
          }));
        } else {
          setNewPaziente((prev) => ({
            ...prev,
            sessions: [],
            sessionsCount: 0,
          }));
        }
        setStep(1);
      }
    }, 100);
  };

  useEffect(() => {
    if (newPaziente.sessions.length > 0) {
      setSessions(newPaziente.sessions);
    }
    if (newPaziente.tutors.length > 0) {
      setTutors(newPaziente.tutors);
    }
  }, [newPaziente]);

  return (
    <DialogContent ref={DialogContentRef} className='createpaziente-dialog'>
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
        <Grid item className='grid-item'>
          <TextField
            value={newPaziente.name}
            size='small'
            className='text-field'
            label='Nome*'
            error={error.name}
            onChange={onChangeName}
          />
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            value={newPaziente.surname}
            size='small'
            className='text-field'
            label='Cognome*'
            error={error.surname}
            onChange={onChangeSurname}
          />
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            value={newPaziente.email}
            size='small'
            className='text-field'
            label='Email'
            error={error.email}
            onChange={onChangeEmail}
          />
        </Grid>
        <Grid item className='grid-item'>
          <PhoneNumberInput
            setNumberPhone={onChangePhoneNumber}
            setIsValidNumberPhone={setIsValidPhoneNumber}
            errorFromOut={error.phone_number}
            numberPhone={newPaziente.phone_number}
            textFieldProps={{
              size: 'small',
              placeholder: 'Numero di telefono',
            }}
          />
        </Grid>
        <Grid item className='grid-item'>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='it'>
            <DatePicker
              onChange={onChangeBirthdate}
              className='date-picker'
              label='Data di nascita*'
              value={datePickerValue}
            />
          </LocalizationProvider>
          {(error.birthdate ||
            error['birthdate.day'] ||
            error['birthdate.month'] ||
            error['birthdate.year']) && <Error className='icon-error' />}
        </Grid>
        <Grid item className='grid-item'>
          <FormControl>
            <InputLabel id='select-gender'>Genere*</InputLabel>
            <Select
              value={newPaziente.gender}
              size='small'
              label='Genere*'
              className='select-gender'
              labelId='select-gender'
              error={error.gender}
              onChange={onSelectGender}
            >
              <MenuItem value={'M'}>Maschio</MenuItem>
              <MenuItem value={'F'}>Femmina</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            value={newPaziente.codfis}
            size='small'
            className='text-field'
            label='Codice Fiscale*'
            error={error.codfis}
            onChange={onChangeCodFis}
          />
        </Grid>
        <Grid item className='grid-item'>
          <FormControl>
            <InputLabel id='select-city-label'>Provincia*</InputLabel>
            <Select
              value={newPaziente.city}
              size='small'
              label='Provincia*'
              className='select-city'
              labelId='select-city-label'
              error={error.city}
              onChange={onSelectCity}
            >
              {provinceJSON.map((item) => (
                <MenuItem key={item.provincia} value={item.provincia}>
                  {item.provincia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item className='grid-item'>
          <FormControl>
            <InputLabel id='select-comune-label'>Comune*</InputLabel>
            <Select
              value={selectedComune}
              size='small'
              label='Comune*'
              disabled={!newPaziente.city}
              className='select-comune'
              labelId='select-comune-label'
              error={error.comune}
              onChange={onSelectComune}
            >
              {!comuniLoading &&
                comuni &&
                comuni.map((item) => (
                  <MenuItem
                    key={item.comune + String(Math.random())}
                    value={item.comune}
                  >
                    {item.comune}
                  </MenuItem>
                ))}
              {comuniLoading && !comuni && (
                <div className='createpaziente-dialog-loading-comuni'>
                  <CircularProgress />
                </div>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            value={newPaziente.treatment}
            size='small'
            className='text-field'
            label='Area di trattamento*'
            error={error.treatment}
            onChange={onChangeTreatment}
          />
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            className='info-paziente'
            onChange={onChangeInfo}
            value={newPaziente.info}
            multiline
            label='Informazioni aggiuntive'
          />
        </Grid>
        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>
              {'Sessioni settimanali'}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          <Button variant='outlined' onClick={onClickAddSession}>
            Aggiungi sessione
          </Button>
        </Grid>
        {sessions.length > 0 && (
          <Grid item className='grid-item' flexDirection='column'>
            {sessions.map((session) => (
              <div className='session-div' key={session.id}>
                <FormControl>
                  <InputLabel id='select-session-day-label'>Giorno</InputLabel>
                  <Select
                    value={session.weekDay ? session.weekDay : ''}
                    size='small'
                    label='Giorno'
                    className='select-session-day'
                    labelId='select-session-day-label'
                    onChange={(e) => onChangeSessionDay(e, session.id)}
                  >
                    {weekDays.map((day) => (
                      <MenuItem key={day.id} value={day.value}>
                        {day.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    className='select-time'
                    label='Ora inizio'
                    format='HH:mm'
                    value={
                      session.startTime
                        ? dayjs(session.startTime, 'HH:mm')
                        : null
                    }
                    ampm={false}
                    onChange={(e) => onChangeSessionStartTime(e, session.id)}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    className='select-time'
                    label='Ora fine'
                    format='HH:mm'
                    value={
                      session.startTime ? dayjs(session.endTime, 'HH:mm') : null
                    }
                    ampm={false}
                    onChange={(e) => onChangeSessionEndTime(e, session.id)}
                  />
                </LocalizationProvider>
                <IconButton
                  onClick={() => onClickDeleteSession(session.id)}
                  className='session-icon-button'
                >
                  <Delete />
                </IconButton>
              </div>
            ))}
          </Grid>
        )}
        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>{'Assegna tutor'}</Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          <Button
            variant='outlined'
            onClick={() => setOpenSearchAndSelect(true)}
          >
            Assegna tutor
          </Button>
          {openSearchAndSelect && (
            <SearchAndSelect
              type='tutor'
              open={openSearchAndSelect}
              setOpen={setOpenSearchAndSelect}
              setArray={setTutors}
              array={tutors}
            />
          )}
        </Grid>
        {tutors.length > 0 && (
          <Grid item className='grid-item' flexDirection='column'>
            {tutors.map((tutor) => (
              <div key={tutor.id} className='tutor-div'>
                <Typography noWrap className='item-fold'>
                  {tutor.name}
                </Typography>
                <Typography noWrap className='item-fold'>
                  {tutor.surname}
                </Typography>
                <Typography noWrap className='item-fold'>
                  {tutor.role}
                </Typography>
                <Typography noWrap className='item-fold'>
                  {tutor.codfis}
                </Typography>
                <IconButton
                  onClick={() => onClickDeleteTutor(tutor.id)}
                  className='icon-button'
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

CreatePaziente.propTypes = {
  newPaziente: PropTypes.object,
  setNewPaziente: PropTypes.func,
  onClickClose: PropTypes.func,
  setStep: PropTypes.func,
};

export default CreatePaziente;
