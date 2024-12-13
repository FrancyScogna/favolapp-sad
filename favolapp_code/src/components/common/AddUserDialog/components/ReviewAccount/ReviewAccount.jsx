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
import './ReviewAccount.css';
import { convertToAWSDate } from '../../../../../utils/stringManipulation';
import { signUpNewUserErrorHandler } from '../../errorsHandler';
import { useRef, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { signUpNewUser } from '../../../../../services/mutations';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../../slices/snackbar-slice';
import PropTypes from 'prop-types';

const appsync = generateClient();

function ReviewAccount({
  newUser,
  setStep,
  onClickClose,
  setOpenAddUserDialog,
}) {
  const DialogContentRef = useRef();
  const [alert, setAlert] = useState(null);
  const dispatch = useDispatch();

  const attributesUserList = [
    { attribute: 'Nome', value: newUser.name },
    { attribute: 'Cognome', value: newUser.surname },
    { attribute: 'Email', value: newUser.email },
    { attribute: 'Numero di telefono', value: newUser.phone_number },
    {
      attribute: 'Data di nascita',
      value: `${String(newUser.birthdate.day).padStart(2, '0')}/${String(newUser.birthdate.month).padStart(2, '0')}/${newUser.birthdate.year}`,
    },
    { attribute: 'Genere', value: newUser.gender },
    { attribute: 'Codice fiscale', value: newUser.codfis },
    { attribute: 'Provincia', value: newUser.city },
    { attribute: 'Comune', value: newUser.comune },
  ];
  const attributesOrgList = [
    { attribute: 'Titolo', value: newUser.title },
    { attribute: 'Ruolo', value: newUser.role.toUpperCase() },
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

  const onClickConfirm = async () => {
    setAlert(null);
    try {
      const BirthDate = convertToAWSDate(
        newUser.birthdate.day,
        newUser.birthdate.month,
        newUser.birthdate.year
      );
      const data = await appsync.graphql({
        query: signUpNewUser,
        variables: {
          newUser: {
            email: newUser.email,
            name: newUser.name,
            surname: newUser.surname,
            role: newUser.role.toUpperCase(),
            birthdate: BirthDate,
            phone_number: newUser.phone_number,
            gender: newUser.gender,
            codfis: newUser.codfis,
            provincia: newUser.city,
            comune: newUser.comune,
            title: newUser.title,
          },
        },
      });
      if (data && data.data.signUpNewUser) {
        dispatch(
          showSnackbar({
            message: "L'utente è stato registrato correttamente.",
          })
        );
        setOpenAddUserDialog(false);
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
        const errorMessage = signUpNewUserErrorHandler(errorName);
        setTimeout(() => {
          setAlert(errorMessage);
          scrollDialogTop();
        }, 100);
      }
    }
  };

  return (
    <DialogContent
      className='reviewaccount-dialog-content'
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
              {"Riguardo l'organizzazione"}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        {attributesOrgList.map((attr) => (
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
        <LoadingButton onClick={onClickConfirm}>Registra utente</LoadingButton>
      </DialogActions>
    </DialogContent>
  );
}

ReviewAccount.propTypes = {
  newUser: PropTypes.object,
  setStep: PropTypes.func,
  onClickClose: PropTypes.func,
  setOpenAddUserDialog: PropTypes.func,
};

export default ReviewAccount;
