import {
  Alert,
  Button,
  Divider,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import './LoginForm.css';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import { removeSpacesFromString } from '../../../../utils/stringManipulation';
import ForgotPasswordDialog from './components/ForgotPasswordDialog/ForgotPasswordDialog';
import { emailFormatCheck } from '../../utils/checkForms';
import PolicyDialog from './components/PolicyDialog/PolicyDialog';
import UpdatePasswordDialog from './components/UpdatePasswordDialog/UpdatePasswordDialog';
import MFADialog from './components/MFADialog/MFADialog';
import { signIn } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { backendErrorAlerts } from '../../utils/errorHandler';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../slices/snackbar-slice';
import { refresh } from '../../../../slices/auth-slice';

function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);
  const [helperTextEmail, setHelperTextEmail] = useState(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] =
    useState(false);
  const [step, setStep] = useState(0);
  const [nextStep, setNextStep] = useState(null);
  const [openPolicyDialog, setOpenPolicyDialog] = useState(false);
  const [openUpdatePassword, setOpenUpdatePassword] = useState(false);
  const [openMFADialog, setOpenMFADialog] = useState(false);

  const onChangeEmail = (event) => {
    setAlert(null);
    const text = removeSpacesFromString(event.target.value);
    setEmail(text !== '' ? text.toLowerCase() : '');
    const pass = emailFormatCheck(text, setHelperTextEmail);
    if (text === '' || pass) {
      setHelperTextEmail(null);
    }
  };

  const onChangePassword = (event) => {
    setAlert(null);
    const text = removeSpacesFromString(event.target.value);
    setPassword(text);
  };

  useEffect(() => {
    if (nextStep) {
      if (nextStep.challenge === 'ACCEPT_TERMS_AND_CONDITIONS') {
        setStep(1);
      }
      if (nextStep.challenge === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setStep(2);
      }
      if (
        nextStep.challenge === 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP' ||
        nextStep.challenge === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE'
      ) {
        setStep(3);
      }
      if (nextStep.challenge === 'DONE') {
        setStep(4);
      }
      if (nextStep.challenge === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        setStep(5);
      }
    }
  }, [nextStep]);

  useEffect(() => {
    if (step !== 0) {
      if (step === 1) {
        //Open terms condition dialog
        setOpenPolicyDialog(true);
      }
      if (step === 2) {
        //Open update password
        setOpenUpdatePassword(true);
      }
      if (step === 3) {
        //Open MFA dialog
        setOpenMFADialog(true);
        //Login
      }
      if (step === 4) {
        setStep(0);
        setEmail('');
        setPassword('');
        dispatch(showSnackbar({ message: 'Accesso effettuato con successo.' }));
        dispatch(refresh());
      }
      if (step === 5) {
        navigate('/auth/change-password');
      }
    }
  }, [step]);

  const onClickLogin = async (e) => {
    setAlert(null);
    setStep(0);
    e.preventDefault();
    if (!helperTextEmail) {
      if (email !== '' && password !== '') {
        setLoadingLogin(true);
        try {
          const result = await signIn({
            username: email,
            password: password,
            options: {
              authFlowType: 'CUSTOM_WITH_SRP',
            },
          });
          if (result && result.nextStep) {
            if (result.nextStep.signInStep) {
              const nextStep = result.nextStep;
              const challenge = nextStep.signInStep;
              let data = nextStep;
              delete data.signInStep;
              setNextStep({ challenge, data });
            }
          }
        } catch (error) {
          const errorMessage = backendErrorAlerts(error);
          setAlert(errorMessage);
        }
      } else {
        setAlert('Verifica che i campi siano compilati correttamente.');
      }
    }
    setLoadingLogin(false);
  };

  const onClickForgotPassword = () => {
    setOpenForgotPasswordDialog(true);
  };

  return (
    <div className='formouter-container'>
      <div className='form-container'>
        <form>
          <Grid className='loginform-grid' container>
            <Grid item className='grid-item'>
              <div className='title-container'>
                <Typography className='title'>Accedi al servizio</Typography>
              </div>
            </Grid>
            <Grid item className='grid-item'>
              {alert && (
                <Alert variant='filled' severity='error' className='alert'>
                  {alert}
                </Alert>
              )}
            </Grid>
            <Grid item className='grid-item'>
              <TextField
                value={email}
                disabled={loadingLogin}
                size='small'
                type='email'
                fullWidth
                error={helperTextEmail ? true : false}
                helperText={helperTextEmail}
                label='Email'
                onChange={onChangeEmail}
              />
            </Grid>
            <Grid item className='grid-item'>
              <TextField
                value={password}
                disabled={loadingLogin}
                size='small'
                type='password'
                autoComplete='current_password'
                fullWidth
                label='Password'
                onChange={onChangePassword}
              />
            </Grid>
            <Grid item className='grid-item'>
              <div className='loginbutton-container'>
                <LoadingButton
                  loading={loadingLogin}
                  type='submit'
                  onClick={onClickLogin}
                  className='button'
                  variant='contained'
                >
                  {"Effettua l'accesso"}
                </LoadingButton>
              </div>
            </Grid>
            <Divider className='divider' />
            <Grid item className='grid-item'>
              <div className='forgotpassword-container'>
                <Tooltip title='Recupera la password'>
                  <Button
                    className='button'
                    variant='outlined'
                    onClick={onClickForgotPassword}
                    onSubmit={onClickForgotPassword}
                  >
                    Hai dimenticato la password?
                  </Button>
                </Tooltip>
                {openForgotPasswordDialog && (
                  <ForgotPasswordDialog
                    openForgotPassword={openForgotPasswordDialog}
                    setOpenForgotPassword={setOpenForgotPasswordDialog}
                    setNextStep={setNextStep}
                  />
                )}
              </div>
            </Grid>
            {openPolicyDialog && (
              <PolicyDialog
                openPolicyDialog={openPolicyDialog}
                setOpenPolicyDialog={setOpenPolicyDialog}
                setNextStep={setNextStep}
              />
            )}
            {openUpdatePassword && (
              <UpdatePasswordDialog
                open={openUpdatePassword}
                setOpen={setOpenUpdatePassword}
                setNextStep={setNextStep}
              />
            )}
            {openMFADialog && (
              <MFADialog
                open={openMFADialog}
                setOpen={setOpenMFADialog}
                setNextStep={setNextStep}
                nextStep={nextStep}
              />
            )}
          </Grid>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
