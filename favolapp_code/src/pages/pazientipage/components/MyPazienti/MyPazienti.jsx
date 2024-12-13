import { Button, IconButton, InputAdornment, InputBase } from '@mui/material';
import './MyPazienti.css';
import PazienteList from '../PazienteList/PazienteList';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getMyPazienti, searchMyPazienti } from '../../../../services/queries';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../slices/snackbar-slice';
import { Search } from '@mui/icons-material';
const appsync = generateClient();

function MyPazienti() {
  const [allMyPazienti, setAllMyPazienti] = useState([]);
  const [allMyPazientiNextToken, setAllMyPazientiNextToken] = useState(null);
  const [allMyPazientiContinueFetch, setAllMyPazientiContinueFetch] =
    useState(true);
  const [allMyPazientiLoading, setAllMyPazientiLoading] = useState(false);
  const [searchAllMyPazientiData, setSearchAllMyPazientiData] = useState([]);
  const [searchAllMyPazientiNextToken, setSearchAllMyPazientiNextToken] =
    useState(null);
  const [
    searchAllMyPazientiContinueFetch,
    setSearchAllMyPazientiContinueFetch,
  ] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(false);
  const [searchTextChanged, setSearchTextChanged] = useState(false);
  const dispatch = useDispatch();

  const fetchAllMyPazienti = async () => {
    setSearchAllMyPazientiData([]);
    setAllMyPazientiLoading(true);
    try {
      const data = await appsync.graphql({
        query: getMyPazienti,
        variables: {
          limit: 101,
          nextToken: allMyPazientiNextToken ? allMyPazientiNextToken : null,
        },
      });
      const items = data.data.getMyPazienti.items;
      if (items) {
        items.map((item) => {
          setAllMyPazienti((prev) => [...prev, item]);
        });
      }
      if (data.data.getMyPazienti.nextToken) {
        setAllMyPazientiNextToken(data.data.getMyPazienti.nextToken);
      } else {
        setAllMyPazientiNextToken(null);
        setAllMyPazientiContinueFetch(false);
      }
      setAllMyPazientiLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllMyPazientiLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMyPazienti();
  }, []);

  const fetchSearchMyPazienti = async () => {
    setAllMyPazientiLoading(true);
    setAllMyPazienti([]);
    if (searchTextChanged) {
      setSearchAllMyPazientiData([]);
    }
    setSearchResult(true);
    try {
      const data = await appsync.graphql({
        query: searchMyPazienti,
        variables: {
          query: searchText,
          limit: 101,
          nextToken: searchAllMyPazientiNextToken
            ? searchAllMyPazientiNextToken
            : null,
        },
      });
      const items = data.data.searchMyPazienti.items;
      if (items) {
        items.map((item) => {
          setSearchAllMyPazientiData((prev) => [...prev, item]);
        });
      }
      if (data.data.searchMyPazienti.nextToken) {
        setSearchAllMyPazientiNextToken(data.data.searchMyPazienti.nextToken);
      } else {
        setSearchAllMyPazientiNextToken(null);
        setSearchAllMyPazientiContinueFetch(false);
      }
      setAllMyPazientiLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllMyPazientiLoading(false);
    }
  };

  const onClickSearch = () => {
    fetchSearchMyPazienti();
    setSearchTextChanged(false);
  };

  const onChangeSearchField = (event) => {
    const text = event.target.value;
    setSearchTextChanged(true);
    setSearchText(text);
  };

  const onClickResetSearch = () => {
    setSearchAllMyPazientiData([]);
    fetchAllMyPazienti();
    setSearchResult(false);
    setSearchTextChanged(false);
    setSearchText('');
  };

  return (
    <div className='mypazienti-container'>
      <div className='search-input'>
        <InputBase
          className='search-input-field'
          placeholder='Cerca un paziente...'
          value={searchText}
          onChange={onChangeSearchField}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton
                onClick={onClickSearch}
                disabled={searchText ? false : true}
              >
                <Search />
              </IconButton>
            </InputAdornment>
          }
        />
      </div>
      <div className='pazientelist-container'>
        {searchResult && (
          <Button
            variant='contained'
            color='error'
            size='small'
            className='reset-search-button'
            onClick={onClickResetSearch}
          >
            Ripristina ricerca
          </Button>
        )}
        <PazienteList
          data={
            searchAllMyPazientiData.length > 0
              ? searchAllMyPazientiData
              : allMyPazienti
          }
          fetchPaginationData={
            searchAllMyPazientiData.length > 0
              ? fetchSearchMyPazienti
              : fetchAllMyPazienti
          }
          continueFetching={
            searchAllMyPazientiData.length > 0
              ? searchAllMyPazientiContinueFetch
              : allMyPazientiContinueFetch
          }
          loadingItems={allMyPazientiLoading}
        />
      </div>
    </div>
  );
}

export default MyPazienti;
