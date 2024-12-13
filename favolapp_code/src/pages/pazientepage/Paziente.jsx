import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import './Paziente.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { getPaziente } from '../../services/queries';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../../slices/snackbar-slice';
import EditPazienteDialog from '../../components/common/EditPazienteDialog/EditPazienteDialog';
const appsync = generateClient();

function Paziente() {
  const [loading, setLoading] = useState(true);
  const [paziente, setPaziente] = useState(null);
  const [openEditPaziente, setOpenEditPaziente] = useState(false);
  const { pazienteId } = useParams();
  const { role } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchPaziente = async () => {
    setLoading(true);
    try {
      const data = await appsync.graphql({
        query: getPaziente,
        variables: {
          pazienteId,
        },
      });
      setPaziente(data.data.getPaziente);
      setLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message: 'Si è verificato un errore.',
          severity: 'error',
        })
      );
      navigate('/', { replace: true });
      setLoading(false);
    }
  };

  const infoPaziente = [
    { id: 'name', attribute: 'Nome', value: paziente?.name },
    { id: 'surname', attribute: 'Cognome', value: paziente?.surname },
    {
      id: 'birthdate',
      attribute: 'Data di Nascita',
      value: paziente?.birthdate,
    },
    {
      id: 'phone_number',
      attribute: 'Numero di Telefono',
      value: paziente?.phone_number ? paziente.phone_number : 'Non indicato.',
    },
    { id: 'gender', attribute: 'Genere', value: paziente?.gender },
    {
      id: 'email',
      attribute: 'Email',
      value: paziente?.email ? paziente.email : 'Non indicata.',
    },
    { id: 'codfis', attribute: 'Codice Fiscale', value: paziente?.codfis },
    { id: 'provincia', attribute: 'Provincia', value: paziente?.provincia },
    { id: 'comune', attribute: 'Comune', value: paziente?.comune },
    {
      id: 'info',
      attribute: 'Informazioni',
      value: paziente?.info ? paziente.info : 'Non indicate.',
    },
    { id: 'treatment', attribute: 'Trattamento', value: paziente?.treatment },
    {
      id: 'sessionsCount',
      attribute: 'Numero di Sessioni',
      value: paziente?.sessionsCount,
    },
    {
      id: 'tutorsCount',
      attribute: 'Numero di Tutor',
      value: paziente?.tutorsCount,
    },
  ];

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

  useEffect(() => {
    fetchPaziente();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className='loading-paziente'>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className='paziente-page'>
      <div className='title'>
        <Typography className='text'>La scheda di {paziente.name}</Typography>
        <div className='buttons'>
          {/*<Button variant='contained' className='button'>
            Visualizza reports
          </Button>*/}
          {role === 'admin' && (
            <>
              <Button
                onClick={() => setOpenEditPaziente(true)}
                variant='contained'
                className='button'
              >
                Modifica
              </Button>
              {openEditPaziente && (
                <EditPazienteDialog
                  open={openEditPaziente}
                  setOpen={setOpenEditPaziente}
                  paziente={paziente}
                  fetchPaziente={fetchPaziente}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className='info-box'>
        <Grid container className='grid-container'>
          <Grid item className='grid-item'>
            <Typography className='info-title'>
              {"Informazioni sull'utente"}
            </Typography>
          </Grid>
          <Divider className='divider' />
          {infoPaziente.map((attr) => (
            <Grid key={attr.id} className='grid-item'>
              <Typography className='attribute'>{attr.attribute}:</Typography>
              <Typography className='value'>{attr.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </div>
      <div className='sessions-box'>
        <Grid container className='grid-container'>
          <Grid item className='grid-item'>
            <Typography className='sessions-title'>
              Sessioni settimanali
            </Typography>
          </Grid>
          <Divider className='divider' />
          {paziente.sessions.length > 0 ? (
            paziente.sessions.map((session) => (
              <Grid key={session.id} item className='grid-item'>
                <Typography className='session-attribute'>Giorno:</Typography>
                <Typography className='session-value'>
                  {translateDay(session.weekDay)}
                </Typography>
                <Typography className='session-attribute'>
                  Ora di inizio:
                </Typography>
                <Typography className='session-value'>
                  {session.startTime}
                </Typography>
                <Typography className='session-attribute'>
                  Ora di fine:
                </Typography>
                <Typography className='session-value'>
                  {session.endTime}
                </Typography>
              </Grid>
            ))
          ) : (
            <Grid item className='grid-item'>
              <Typography className='session-empty'>
                Non ci sono sessioni settimanali.
              </Typography>
            </Grid>
          )}
        </Grid>
      </div>
      <div className='tutors-box'>
        <Grid container className='grid-container'>
          <Grid item className='grid-item'>
            <Typography className='tutors-title'>Tutor assegnati</Typography>
          </Grid>
          <Divider className='divider' />
          {paziente.tutors.length > 0 ? (
            paziente.tutors.map((tutor) => (
              <Grid key={tutor.id} item className='grid-item'>
                <Typography className='tutor-value'>{tutor.name}</Typography>
                <Typography className='tutor-value'>{tutor.surname}</Typography>
                <Typography className='tutor-value'>{tutor.title}</Typography>
                <Typography className='tutor-value'>{tutor.codfis}</Typography>
              </Grid>
            ))
          ) : (
            <Grid item className='grid-item'>
              <Typography className='tutor-empty'>
                Non ci sono tutor assegnati.
              </Typography>
            </Grid>
          )}
        </Grid>
      </div>
    </div>
  );
}

export default Paziente;
