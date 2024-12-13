import {
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
} from '@mui/material';
import './Activity.css';
import { useEffect, useState } from 'react';
import ActivityList from './ActivityList/ActivityList';
import {
  ContentPaste,
  /*Dns,*/
  Login,
  People,
  Report,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { generateClient } from 'aws-amplify/api';
import { getLogs } from '../../services/queries';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../slices/snackbar-slice';
const appsync = generateClient();

function Activity() {
  const [logs, setLogs] = useState([]);
  const [logsNextToken, setLogsNextToken] = useState(null);
  const [logsContinueFetch, setLogsContinueFetch] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filterSelect, setFilterSelect] = useState('');
  const [filterInput, setFilterInput] = useState({ type: null, input: '' });
  const [queryParams, setQueryParams] = useState({
    query: getLogs,
    variables: { tab: 'auth', filter: null },
  });
  const [dateIsInvalid, setDateIsInvalid] = useState(false);
  const [toggleValue, setToggleValue] = useState('auth');
  const toggleMobile = useMediaQuery('(max-width:450px)');
  const toggleButtons = [
    {
      value: 'auth',
      text: toggleMobile ? <Login /> : <Typography>Auth</Typography>,
      title: 'Auth',
    },
    {
      value: 'users',
      text: toggleMobile ? <People /> : <Typography>Utenti</Typography>,
      title: 'Utenti',
    },
    {
      value: 'pazienti',
      text: toggleMobile ? <ContentPaste /> : <Typography>Pazienti</Typography>,
      title: 'Pazienti',
    },
    {
      value: 'reports',
      text: toggleMobile ? <Report /> : <Typography>Report</Typography>,
      title: 'Report',
    },
    /*{
      value: 'tasks',
      text: toggleMobile ? <Dns /> : <Typography>Task</Typography>,
      title: 'Task',
    },*/
  ];
  const dispatch = useDispatch();

  const onChangeToggleButton = (_, value) => {
    if (value) {
      setToggleValue(value);
      setLogsNextToken(null);
      setLogs([]);
      setQueryParams((prev) => ({
        ...prev,
        variables: { ...prev.variables, tab: value },
      }));
    }
  };

  const onSelectFilter = (event) => {
    const value = event.target.value;
    setFilterSelect(value);
    setFilterInput((prev) => ({ ...prev, type: value, input: '' }));
  };

  const onClickApplyFilter = () => {
    setLogs([]);
    setLogsNextToken(null);
    setQueryParams((prev) => ({
      ...prev,
      variables: {
        ...prev.variables,
        filter: filterInput,
      },
    }));
  };

  const onClickResetFilter = () => {
    setLogs([]);
    setLogsNextToken(null);
    setFilterSelect('');
    setFilterInput({ type: null, input: '' });
    if (queryParams.variables.filter) {
      setQueryParams((prev) => ({
        ...prev,
        variables: {
          ...prev.variables,
          filter: null,
        },
      }));
    }
  };

  const onChangeAuthorFilter = (event) => {
    setFilterInput((prev) => ({ ...prev, input: event.target.value }));
  };

  const onChangeDayFilter = (event) => {
    if (!isNaN(event.$D) && !isNaN(event.$M) && !isNaN(event.$y)) {
      setFilterInput((prev) => ({
        ...prev,
        input: `${event.$D}/${event.$M + 1}/${event.$y}`,
      }));
    } else {
      setFilterInput((prev) => ({ ...prev, input: '' }));
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      let params = queryParams;
      params = {
        ...params,
        variables: {
          ...params.variables,
          limit: 101,
          nextToken: logsNextToken ? logsNextToken : null,
        },
      };
      const data = await appsync.graphql(params);
      const items = data.data.getLogs.items;
      if (items) {
        items.map((item) => {
          setLogs((prev) => [...prev, item]);
        });
      }
      if (data.data.getLogs.nextToken) {
        setLogsNextToken(data.data.getLogs.nextToken);
      } else {
        setLogsNextToken(null);
        setLogsContinueFetch(false);
      }
      setLogsLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [queryParams]);

  return (
    <div className='activity-page'>
      <div className='title-container'>
        <Typography className='title'>
          Attività |{' '}
          {toggleButtons.find((button) => button.value === toggleValue).title}
        </Typography>
      </div>
      <div className='toggle-buttons'>
        <ToggleButtonGroup
          fullWidth
          value={toggleValue}
          onChange={onChangeToggleButton}
          exclusive={true}
          size='small'
        >
          {toggleButtons.map((button, index) => (
            <ToggleButton
              className='toggle-button'
              key={index}
              value={button.value}
            >
              {button.text}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
      <div className='filter'>
        <div className='filter-selection'>
          <Typography className='text' noWrap>
            Filtra per:
          </Typography>
          <FormControl>
            <InputLabel id='filter-select-label'>Seleziona</InputLabel>
            <Select
              value={filterSelect}
              className='select'
              labelId='filter-select-label'
              label='Seleziona'
              size='small'
              onChange={onSelectFilter}
            >
              <MenuItem value={'author'}>Autore</MenuItem>
              <MenuItem value={'day'}>Giorno</MenuItem>
            </Select>
          </FormControl>
        </div>
        {filterSelect && (
          <div className='filter-selected'>
            <div className='insert-data'>
              {filterSelect === 'author' ? (
                <TextField
                  className='text-field'
                  size='small'
                  label='Inserisci autore'
                  onChange={onChangeAuthorFilter}
                />
              ) : (
                <LocalizationProvider
                  adapterLocale='it'
                  dateAdapter={AdapterDayjs}
                >
                  <DatePicker
                    onChange={onChangeDayFilter}
                    className='date-picker'
                    label='Inserisci data'
                    onError={(error) => setDateIsInvalid(error ? true : false)}
                  />
                </LocalizationProvider>
              )}
            </div>
            <div className='buttons'>
              <Button
                size='small'
                disabled={!filterInput.input || dateIsInvalid}
                variant='contained'
                className='apply-filter'
                onClick={onClickApplyFilter}
              >
                Applica filtro
              </Button>
              <Button
                size='small'
                color='error'
                variant='contained'
                className='reset-filter'
                onClick={onClickResetFilter}
              >
                Rimuovi filtro
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className='activitylist-container'>
        <ActivityList
          data={logs}
          fetchPaginationData={fetchLogs}
          continueFetching={logsContinueFetch}
          setData={setLogs}
          loadingItems={logsLoading}
        />
      </div>
    </div>
  );
}

export default Activity;
