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
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import './CreateAccount.css';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Error } from '@mui/icons-material';
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

function CreateAccount({ newUser, setNewUser, onClickClose, setStep }) {
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(false);
  const [error, setError] = useState({
    name: false,
    surname: false,
    email: false,
    phone_number: false,
    birthdate: false,
    gender: false,
    codfis: false,
    city: false,
    comune: false,
    title: false,
    role: false,
  });
  const [alert, setAlert] = useState(null);
  const DialogContentRef = useRef(null);
  const [comuni, setComuni] = useState(null);
  const [comuniLoading, setComuniLoading] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(null);
  const [selectedComune, setSelectedComune] = useState('');

  //Gestione del caricamento e del attivazione o meno del selector dei comuni
  useEffect(() => {
    setComuniLoading(true);
    setSelectedComune('');
    var prevCom = null;
    if (newUser.comune) {
      prevCom = newUser.comune;
    }
    if (newUser.city) {
      const comuniArray = comuniJSON.filter(
        (item) => item.provincia === newUser.city
      );
      setComuni(comuniArray);
      const thereIsPrevComune = comuniArray.find(
        (item) => item.comune === prevCom
      );
      if (thereIsPrevComune) {
        setNewUser((prev) => ({ ...prev, comune: thereIsPrevComune.comune }));
        setSelectedComune(thereIsPrevComune.comune);
      } else {
        setNewUser((prev) => ({ ...prev, comune: '' }));
        setSelectedComune('');
      }
      setComuniLoading(false);
    }
  }, [newUser.city]);

  useEffect(() => {
    if (
      newUser.birthdate.day &&
      newUser.birthdate.month &&
      newUser.birthdate.year
    ) {
      setDatePickerValue(
        dayjs(
          `${newUser.birthdate.month}-${newUser.birthdate.day}-${newUser.birthdate.year}`
        )
      );
    }
  }, [newUser]);

  //Funzioni per il cambio dei parametri nel form
  const onChangeName = (event) => {
    setError((prev) => ({ ...prev, name: false }));
    const text = event.target.value;
    setNewUser((prev) => ({ ...prev, name: text }));
  };

  const onChangeSurname = (event) => {
    setError((prev) => ({ ...prev, surname: false }));
    const text = event.target.value;
    setNewUser((prev) => ({ ...prev, surname: text }));
  };

  const onChangeEmail = (event) => {
    setError((prev) => ({ ...prev, email: false }));
    const text = removeSpacesFromString(event.target.value);
    setNewUser((prev) => ({ ...prev, email: text }));
  };

  const onChangePhoneNumber = (phone_number) => {
    setError((prev) => ({ ...prev, phone_number: false }));
    setNewUser((prev) => ({ ...prev, phone_number: phone_number }));
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
      setNewUser((prev) => ({ ...prev, birthdate: { day, month, year } }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        birthdate: { day: '', month: '', year: '' },
      }));
    }
  };

  const onSelectGender = (event) => {
    setError((prev) => ({ ...prev, gender: false }));
    const gender = event.target.value;
    setNewUser((prev) => ({ ...prev, gender }));
  };

  const onChangeCodFis = (event) => {
    setError((prev) => ({ ...prev, codfis: false }));
    const text = event.target.value.toUpperCase();
    setNewUser((prev) => ({ ...prev, codfis: text }));
  };

  const onSelectCity = (event) => {
    setError((prev) => ({ ...prev, city: false }));
    const city = event.target.value;
    setNewUser((prev) => ({ ...prev, city }));
  };

  const onSelectComune = (event) => {
    setError((prev) => ({ ...prev, comune: false }));
    const comune = event.target.value;
    setNewUser((prev) => ({ ...prev, comune }));
    setSelectedComune(comune);
  };

  const onChangeTitle = (event) => {
    setError((prev) => ({ ...prev, title: false }));
    const text = event.target.value;
    setNewUser((prev) => ({ ...prev, title: text }));
  };

  const onSelectRole = (event) => {
    setError((prev) => ({ ...prev, role: false }));
    const role = event.target.value;
    setNewUser((prev) => ({ ...prev, role }));
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
    let tempUser = newUser;
    const num = tempUser.phone_number.split(' ')[1];
    tempUser = { ...tempUser, phone_number: num };
    let foundEmptyValue = false;
    await traverseObject(tempUser, async (fieldpath, value) => {
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
    let errorMessage = '';
    let passEmail = false;
    //Verifica del formato email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(newUser.email)) {
      errorMessage += 'Formato email non valido.\n';
      passEmail = false;
      setError((prev) => ({ ...prev, email: true }));
    } else {
      passEmail = true;
    }
    //Verifica del numero di telefono
    let passPhoneNumber = false;
    if (isValidPhoneNumber) {
      passPhoneNumber = true;
    } else {
      passPhoneNumber = false;
      errorMessage += 'Il numero di telefono non è valido.\n';
      setError((prev) => ({ ...prev, phone_number: true }));
    }

    //Verifica codice fiscale
    //Step1. Codice inserito
    let passInsertCodFis = false;
    try {
      const insertCodFis = new CodiceFiscale(newUser.codfis);
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
        name: newUser.name,
        surname: newUser.surname,
        gender: newUser.gender,
        day: newUser.birthdate.day,
        month: newUser.birthdate.month,
        year: newUser.birthdate.year,
        birthplace: newUser.comune,
        birthplaceProvincia: newUser.city,
      });
      if (cf.cf === newUser.codfis) {
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

    if (passEmail && passCheckCodFis && passInsertCodFis && passPhoneNumber) {
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
      city: false,
      comune: false,
      country: false,
      title: false,
      role: false,
    });
    setTimeout(async () => {
      const pass = await checkValues();
      if (pass) {
        setStep(1);
      }
    }, 100);
  };

  return (
    <DialogContent
      ref={DialogContentRef}
      className='createaccount-dialog-content'
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
        <Grid item className='grid-item'>
          <TextField
            value={newUser.name}
            size='small'
            className='text-field'
            label='Nome'
            error={error.name}
            onChange={onChangeName}
          />
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            value={newUser.surname}
            size='small'
            className='text-field'
            label='Cognome'
            error={error.surname}
            onChange={onChangeSurname}
          />
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            value={newUser.email}
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
            numberPhone={newUser.phone_number}
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
              label='Data di nascita'
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
            <InputLabel id='select-gender'>Genere</InputLabel>
            <Select
              value={newUser.gender}
              size='small'
              label='Genere'
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
            value={newUser.codfis}
            size='small'
            className='text-field'
            label='Codice Fiscale'
            error={error.codfis}
            onChange={onChangeCodFis}
          />
        </Grid>
        <Grid item className='grid-item'>
          <FormControl>
            <InputLabel id='select-city-label'>Provincia</InputLabel>
            <Select
              value={newUser.city}
              size='small'
              label='Provincia'
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
            <InputLabel id='select-comune-label'>Comune</InputLabel>
            <Select
              value={selectedComune}
              size='small'
              label='Comune'
              disabled={!newUser.city}
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
                <div className='adduser-dialog-loading-comuni'>
                  <CircularProgress />
                </div>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>
              {"Riguardo l'organizzazione"}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            value={newUser.title}
            size='small'
            className='text-field'
            label='Titolo di professione'
            error={error.title}
            onChange={onChangeTitle}
          />
        </Grid>
        <Grid item className='grid-item'>
          <FormControl>
            <InputLabel id='select-label'>Ruolo</InputLabel>
            <Select
              value={newUser.role}
              size='small'
              label='Ruolo'
              className='select-role'
              labelId='select-label'
              error={error.role}
              onChange={onSelectRole}
            >
              <MenuItem value={'admin'}>Admin</MenuItem>
              <MenuItem value={'tutor'}>Tutor</MenuItem>
            </Select>
          </FormControl>
        </Grid>
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

CreateAccount.propTypes = {
  newUser: PropTypes.object,
  setNewUser: PropTypes.func,
  onClickClose: PropTypes.func,
  setStep: PropTypes.func,
};

export default CreateAccount;
