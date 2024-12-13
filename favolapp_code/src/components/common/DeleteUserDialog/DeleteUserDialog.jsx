import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import './DeleteUserDialog.css';
import { showSnackbar } from '../../../slices/snackbar-slice';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { deleteUser } from '../../../services/mutations';
import { generateClient } from 'aws-amplify/api';
import { useState } from 'react';

function DeleteUserDialog({ open, setOpen, userProfile, setUserProfile}) {
  const dispatch = useDispatch();
  const client = generateClient();
  const [text, setText] = useState("");
  const [disableButton, setDisableButton] = useState(true);

  const deleteFn = async () => {
    try {
      await client.graphql({
        query: deleteUser,
        variables: { userId: userProfile.id },
      });
      dispatch(showSnackbar({ message: "Hai eliminato l'utente dalla piattaforma." }));
      setOpen(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message: "C'è stato un errore durante l'eliminazione dell'utente.",
          severity: 'error',
        })
      );
    }
  };

  const onChangeText = (e) => {
    setText(e.target.value);
    const text = e.target.value.toLowerCase();
    if(text !== "conferma" ){
      setDisableButton(true);
    }else{
      setDisableButton(false);
    }
  }

  return (
    <Dialog open={open} className='deleteuser-dialog'>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>Elimina Utente</Typography>
      </DialogTitle>
      <DialogContent className='dialog-content'>
        <Typography className='description'>
          {`Sei sicuro di voler eliminare ${userProfile.email} dalla piattaforma?`}
        </Typography>
        <Typography className='description'>
          Per eliminare l'utente, digita <strong>conferma</strong> e clicca su <strong style={{color: "red"}}>Elimina</strong>.
        </Typography>
        <TextField
          size='small'
          fullWidth
          style={{marginTop: "5px"}}
          value={text}
          onChange={onChangeText}
        />
        <DialogActions>
          <Button onClick={() => {setOpen(false); setUserProfile(null); setDisableButton(true), setText("")}}>Annulla</Button>
          <Button onClick={deleteFn} color='error' disabled={disableButton}>
            Elimina
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

DeleteUserDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  userProfile: PropTypes.object,
  setUserProfile: PropTypes.func
};

export default DeleteUserDialog;
