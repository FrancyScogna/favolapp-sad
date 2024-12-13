import {
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import './Pazienti.css';
import { useEffect, useState } from 'react';
import AddPazienteDialog from '../../components/common/AddPazienteDialog/AddPazienteDialog';
import AllPazienti from './components/AllPazienti/AllPazienti';
import MyPazienti from './components/MyPazienti/MyPazienti';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { showSnackbar } from '../../slices/snackbar-slice';
import { getUser } from '../../services/queries';
import CommonPazienti from './components/CommonPazienti/CommonPazienti';
import AllOtherPazienti from './components/AllOtherPazienti/AllOtherPazienti';
const appsync = generateClient();

function Pazienti({ type = 'mine' }) {
  const [openAddPaziente, setOpenAddPaziente] = useState(false);
  const [showAllPazienti, setShowAllPazienti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const { user, role } = useSelector((state) => state.auth);
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const onChangeSwitch = (event) => {
    setShowAllPazienti(event.target.checked);
  };

  const fetchOtherUser = async () => {
    try {
      const data = await appsync.graphql({
        query: getUser,
        variables: { userId },
      });
      let otherUser = data.data.getUser;
      setOtherUser(otherUser);
      setLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message: 'Si è verificato un errore',
          severity: 'error',
        })
      );
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    if (type !== 'mine') {
      if (userId === user.id) {
        if (role === 'admin') {
          navigate('/admin/pazienti', { replace: true });
        } else {
          navigate('/app/pazienti', { replace: true });
        }
      } else {
        fetchOtherUser();
      }
    } else {
      setLoading(false);
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className='pazienti-loading-page'>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className='pazienti-page'>
      <div className='title-container'>
        <Typography className='title'>
          {type === 'mine'
            ? showAllPazienti
              ? 'Tutti i pazienti'
              : 'I miei pazienti'
            : showAllPazienti
              ? `Tutti i pazienti di ${otherUser.name}`
              : `I pazienti in comune con ${otherUser.name}`}
        </Typography>
        {role === 'admin' && type === 'mine' && (
          <Button
            className='add-paziente-button'
            onClick={() => setOpenAddPaziente(true)}
            variant='contained'
          >
            Aggiungi Paziente
          </Button>
        )}
      </div>
      {openAddPaziente && role === 'admin' && (
        <AddPazienteDialog
          open={openAddPaziente}
          setOpen={setOpenAddPaziente}
        />
      )}
      {role === 'admin' && (
        <FormControlLabel
          className='switch-all-pazienti'
          control={<Switch className='switch' onChange={onChangeSwitch} />}
          label='Mostra tutti i pazienti'
          labelPlacement='start'
        />
      )}
      {type === 'mine' ? (
        showAllPazienti ? (
          <AllPazienti />
        ) : (
          <MyPazienti />
        )
      ) : showAllPazienti ? (
        <AllOtherPazienti userId={otherUser.id} />
      ) : (
        <CommonPazienti userId={otherUser.id} />
      )}
    </div>
  );
}

Pazienti.propTypes = {
  type: PropTypes.string,
};

export default Pazienti;
