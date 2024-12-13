import {
  Alert,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import './EditUserInfoDialog.css';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Close, Error } from '@mui/icons-material';
import PhoneNumberInput from '../PhoneNumberInput/PhoneNumberInput';
import { LoadingButton } from '@mui/lab';
import { useEffect, useRef, useState } from 'react';
import 'dayjs/locale/it';
import {
  compareAndReturnDifferences,
  traverseObject,
} from '../../../utils/objectManipulation';
import comuniJSON from '../../../utils/metadata/comuni.json';
import provinceJSON from '../../../utils/metadata/province.json';
import CodiceFiscale from 'codice-fiscale-js';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../slices/snackbar-slice';
import { generateClient } from 'aws-amplify/api';
import { editUserInfo } from '../../../services/mutations';
import { editAuthUser } from '../../../slices/auth-slice';
import { convertToAWSDate } from '../../../utils/stringManipulation';
const appsync = generateClient();
function EditUserInfoDialog({ open, setOpen, userProfile, setUserProfile }) {
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(false);
  const [error, setError] = useState({
    name: false,
    surname: false,
    phone_number: false,
    birthdate: false,
    gender: false,
    codfis: false,
    provincia: false,
    comune: false,
    title: false,
  });
  const [alert, setAlert] = useState(null);
  const DialogContentRef = useRef(null);
  const [comuni, setComuni] = useState(null);
  const [comuniLoading, setComuniLoading] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(null);
  const [selectedComune, setSelectedComune] = useState('');
  const dispatch = useDispatch();
  const [newUser, setNewUser] = useState(userProfile);
  const [loadingMutation, setLoadingMutation] = useState(false);

  //Gestione del caricamento e del attivazione o meno del selector dei comuni
  useEffect(() => {
    setComuniLoading(true);
    setSelectedComune('');
    var prevCom = null;
    if (newUser.comune) {
      prevCom = newUser.comune;
    }
    if (newUser.provincia) {
      const comuniArray = comuniJSON.filter(
        (item) => item.provincia === newUser.provincia
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
  }, [newUser.provincia]);

  useEffect(() => {
    if (newUser.birthdate) {
      const date = newUser.birthdate.split('-');
      setDatePickerValue(
        dayjs(`${Number(date[1])}-${Number(date[2])}-${Number(date[0])}`)
      );
    }
  }, []);

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

  const onChangePhoneNumber = (phone_number) => {
    setError((prev) => ({ ...prev, phone_number: false }));
    setNewUser((prev) => ({ ...prev, phone_number: phone_number }));
  };

  const onChangeBirthdate = (event) => {
    setError((prev) => ({
      ...prev,
      birthdate: false,
    }));
    if (event) {
      const day = isNaN(event.$D) ? '' : event.$D;
      const month = isNaN(event.$M) ? '' : event.$M + 1;
      const year = isNaN(event.$y) ? '' : event.$y;
      let date = '';
      if (day && month && year) {
        date = convertToAWSDate(day, month, year);
      }
      setNewUser((prev) => ({ ...prev, birthdate: date }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        birthdate: '',
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
    setError((prev) => ({ ...prev, provincia: false }));
    const provincia = event.target.value;
    setNewUser((prev) => ({ ...prev, provincia }));
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

  const scrollDialogTop = () => {
    DialogContentRef.current.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  //Controllo dei valori e gestione degli errori
  const checkValues = async () => {
    let tempUser = {
      name: newUser.name,
      surname: newUser.surname,
      phone_number: newUser.phone_number,
      birthdate: newUser.birthdate,
      codfis: newUser.codfis,
      provincia: newUser.provincia,
      comune: newUser.comune,
      title: newUser.title,
    };
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
      const date = newUser.birthdate.split('-');

      const cf = new CodiceFiscale({
        name: newUser.name,
        surname: newUser.surname,
        gender: newUser.gender,
        day: parseInt(date[2]),
        month: parseInt(date[1]),
        year: parseInt(date[0]),
        birthplace: newUser.comune,
        birthplaceProvincia: newUser.provincia,
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

    if (passCheckCodFis && passInsertCodFis && passPhoneNumber) {
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
    setLoadingMutation(true);
    //Reset degli errori
    setAlert(null);
    setError({
      name: false,
      surname: false,
      phone_number: false,
      birthdate: false,
      codfis: false,
      provincia: false,
      comune: false,
      title: false,
    });
    setTimeout(async () => {
      const pass = await checkValues();
      if (pass) {
        const edit = compareAndReturnDifferences(userProfile, newUser);
        if (edit) {
          //Invia mutation
          const editUser = {
            id: newUser.id,
            name: newUser.name,
            surname: newUser.surname,
            birthdate: newUser.birthdate,
            phone_number: newUser.phone_number,
            gender: newUser.gender,
            codfis: newUser.codfis,
            provincia: newUser.provincia,
            comune: newUser.comune,
            title: newUser.title,
          };
          try {
            await appsync.graphql({
              query: editUserInfo,
              variables: { editUser },
            });
            setUserProfile((prev) => ({ ...prev, ...editUser }));
            dispatch(editAuthUser({ user: editUser }));
            dispatch(
              showSnackbar({
                message: "L'utente è stato modificato correttamente.",
              })
            );
            setOpen(false);
          } catch (error) {
            dispatch(
              showSnackbar({
                message: 'Si è verificato un errore.',
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
      }
      setLoadingMutation(false);
    }, 100);
  };

  return (
    <Dialog className='edituser-dialog' open={open}>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>
          {'Modifica informazioni utente'}
        </Typography>
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
              disabled
              value={newUser.email}
              size='small'
              className='text-field'
              label='Email'
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
                value={newUser.provincia}
                size='small'
                label='Provincia'
                className='select-city'
                labelId='select-city-label'
                error={error.provincia}
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
                disabled={!newUser.provincia}
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
                value={newUser.role.toLowerCase()}
                disabled
                size='small'
                label='Ruolo'
                className='select-role'
                labelId='select-label'
              >
                <MenuItem value={'admin'}>Admin</MenuItem>
                <MenuItem value={'tutor'}>Tutor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setNewUser();
            }}
            color='error'
          >
            Chiudi
          </Button>
          <LoadingButton loading={loadingMutation} onClick={onClickConfirm}>
            Salva
          </LoadingButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

EditUserInfoDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  userProfile: PropTypes.object,
  setUserProfile: PropTypes.func,
};

export default EditUserInfoDialog;
