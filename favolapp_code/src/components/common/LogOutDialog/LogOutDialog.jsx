import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import './LogOutDialog.css';
import { showSnackbar } from '../../../slices/snackbar-slice';
import { logout } from '../../../slices/auth-slice';
import { signOut } from 'aws-amplify/auth';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

function LogOutDialog({ open, setOpen }) {
  const dispatch = useDispatch();
  const logoutFn = async () => {
    try {
      await signOut();
      dispatch(logout());
      dispatch(showSnackbar({ message: 'Ti sei disconnesso da favolApp!' }));
    } catch (error) {
      dispatch(
        showSnackbar({
          message: "C'è stato un errore durante il logout.",
          severity: 'error',
        })
      );
    }
  };
  return (
    <Dialog open={open} className='logout-dialog'>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>Disconnessione</Typography>
      </DialogTitle>
      <DialogContent className='dialog-content'>
        <Typography className='description'>
          Sei sicuro di volerti disconnettere da favolApp?
        </Typography>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={logoutFn} color='error'>
            Disconnetti
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

LogOutDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

export default LogOutDialog;
