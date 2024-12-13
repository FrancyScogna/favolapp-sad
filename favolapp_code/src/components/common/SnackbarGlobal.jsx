import { useDispatch, useSelector } from 'react-redux';
import {
  hideSnackbar,
  trigResetTimerSnackbar,
} from '../../slices/snackbar-slice';
import { Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';

function SnackbarGlobal() {
  const dispatch = useDispatch();
  const snackbar = useSelector((state) => state.snackbar);
  const [cont, setCont] = useState(0);
  const autoCloseTimeout = 4000; //ms

  //Trig di reset del timer quando viene generata un'altra Snackbar
  useEffect(() => {
    if (snackbar.trigResetTimer) {
      setCont(0);
      dispatch(trigResetTimerSnackbar());
    }
  }, [snackbar]);

  //Timer che viene utilizzato per la chiusura della snackbar
  useEffect(() => {
    let timer;
    const handleTimer = () => {
      setCont((prevCont) => prevCont + 1);
      if (cont === autoCloseTimeout / 1000) {
        dispatch(hideSnackbar());
        clearInterval(timer);
        setCont(0);
      }
    };
    if (snackbar.open) {
      timer = setInterval(handleTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [snackbar.open, cont, dispatch]);

  //Funzione che blocca la chiusura della snackbar cliccando ovunque
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
  };

  return (
    <Snackbar
      open={snackbar.open}
      onClose={handleClose}
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
    >
      <Alert variant='filled' severity={snackbar.severity}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}

export default SnackbarGlobal;
