import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  ListItemButton,
  TextField,
  Typography,
} from '@mui/material';
import './SearchAndSelectPazienti.css';
import { Close } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../../slices/snackbar-slice';
import PropTypes from 'prop-types';
import { generateClient } from 'aws-amplify/api';
import { searchMyPazienti } from '../../../../../services/queries';

const appsync = generateClient();

function SearchAndSelectPazienti({ open, setOpen, setArray, array }) {
  const [searchField, setSearchField] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchParam, setSearchParam] = useState('');
  const [nextToken, setNextToken] = useState(null);
  const [resultArray, setResultArray] = useState([]);
  const dispatch = useDispatch();

  const onChangeSearchField = (e) => {
    const text = e.target.value;
    setSearchField(text);
  };

  const onClickSearch = async () => {
    setLoadingSearch(true);
    setResultArray([]);
    setNextToken(null);
    try {
      if (searchField) {
        setSearchParam(searchField);
        const data = await appsync.graphql({
          query: searchMyPazienti,
          variables: { query: searchField, limit: 10, nextToken: nextToken },
        });
        if (data.data.searchMyPazienti.items.length > 0) {
          setResultArray([...data.data.searchMyPazienti.items]);
          setNextToken(data.data.searchMyPazienti.nextToken);
        } else {
          setResultArray([{ id: 'empty-search' }]);
        }
        setLoadingSearch(false);
      } else {
        setLoadingSearch(false);
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: 'Si è verificato un errore con il Database, riprova.',
          severity: 'error',
        })
      );
    }
  };

  const onClickSearchMore = async () => {
    try {
      if (nextToken) {
        setLoadingSearch(true);
        const data = await appsync.graphql({
          query: searchMyPazienti,
          variables: { query: searchParam, limit: 10, nextToken: nextToken },
        });
        setResultArray((prev) => [
          ...prev,
          ...data.data.searchMyPazienti.items,
        ]);
        setNextToken(data.data.searchMyPazienti.nextToken);
        setLoadingSearch(false);
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: 'Si è verificato un errore con il Database, riprova.',
          severity: 'error',
        })
      );
    }
  };

  const onClickClose = () => {
    setOpen(false);
    setResultArray([]);
  };

  const onClickSelect = (id) => {
    const thereIsPaziente = array.find((item) => item.id === id);
    if (!thereIsPaziente) {
      const item = resultArray.find((item) => item.id === id);
      setArray((prev) => [...prev, item]);

      onClickClose();
    } else {
      dispatch(
        showSnackbar({
          message: 'Questo elemento è già stato assegnato.',
          severity: 'error',
        })
      );
    }
  };

  return (
    <Dialog className='searchandselect-dialog' open={open}>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>Cerca e seleziona un paziente</Typography>
        <IconButton onClick={onClickClose} className='close-icon-button'>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className='dialog-content'>
        <Typography className='description'>
          Inserisci il nome o il cognome e clicca il tasto cerca.
        </Typography>
        <Grid container className='grid-container'>
          <Grid item className='grid-item'>
            <TextField
              size='small'
              label='Nome/Cognome'
              value={searchField}
              onChange={onChangeSearchField}
              className='search-textfield'
            />
            <LoadingButton
              onClick={onClickSearch}
              loading={loadingSearch}
              disabled={!searchField}
              variant='contained'
              className='search-button'
            >
              Cerca
            </LoadingButton>
          </Grid>
          {resultArray.length > 0 && resultArray[0].id !== 'empty-search' && (
            <>
              <Grid item className='grid-item'>
                <Typography className='result-text'>Risultati</Typography>
              </Grid>
              {resultArray.map((item) => (
                <Grid item key={item.id} className='grid-item'>
                  <div className='list-items'>
                    <ListItemButton
                      onClick={() => onClickSelect(item.id)}
                      className='list-item'
                    >
                      <Typography noWrap className='item-fold'>
                        {item.name}
                      </Typography>
                      <Typography noWrap className='item-fold'>
                        {item.surname}
                      </Typography>
                      <Typography noWrap className='item-fold'>
                        {item.codfis}
                      </Typography>
                      <Typography noWrap className='item-fold'>
                        {item.treatment}
                      </Typography>
                    </ListItemButton>
                  </div>
                </Grid>
              ))}
              {nextToken && (
                <Grid className='grid-item'>
                  <div className='search-more'>
                    <LoadingButton
                      loading={loadingSearch}
                      variant='contained'
                      onClick={onClickSearchMore}
                    >
                      Continua la ricerca
                    </LoadingButton>
                  </div>
                </Grid>
              )}
            </>
          )}
          {resultArray.length > 0 && resultArray[0].id === 'empty-search' && (
            <div className='empty-search'>
              <Typography className='empty'>
                Nessun risultato trovato
              </Typography>
            </div>
          )}
          {loadingSearch && (
            <div className='loading-search'>
              <CircularProgress />
            </div>
          )}
        </Grid>
        <DialogActions>
          <Button color='error' onClick={onClickClose}>
            Chiudi
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

SearchAndSelectPazienti.propTypes = {
  type: PropTypes.string,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  setArray: PropTypes.func,
  array: PropTypes.array,
};

export default SearchAndSelectPazienti;
