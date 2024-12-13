import { Button, IconButton, InputAdornment, InputBase } from '@mui/material';
import './AllPazienti.css';
import PazienteList from '../PazienteList/PazienteList';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import {
  getPazientiList,
  searchAllPazienti,
} from '../../../../services/queries';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../slices/snackbar-slice';
import { Search } from '@mui/icons-material';
const appsync = generateClient();

function AllPazienti() {
  const [allPazienti, setAllPazienti] = useState([]);
  const [allPazientiNextToken, setAllPazientiNextToken] = useState(null);
  const [allPazientiContinueFetch, setAllPazientiContinueFetch] =
    useState(true);
  const [allPazientiLoading, setAllPazientiLoading] = useState(false);
  const [searchAllPazientiData, setSearchAllPazientiData] = useState([]);
  const [searchAllPazientiNextToken, setSearchAllPazientiNextToken] =
    useState(null);
  const [searchAllPazientiContinueFetch, setSearchAllPazientiContinueFetch] =
    useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(false);
  const [searchTextChanged, setSearchTextChanged] = useState(false);
  const dispatch = useDispatch();

  const fetchAllPazienti = async () => {
    setSearchAllPazientiData([]);
    setAllPazientiLoading(true);
    try {
      const data = await appsync.graphql({
        query: getPazientiList,
        variables: {
          limit: 101,
          nextToken: allPazientiNextToken ? allPazientiNextToken : null,
        },
      });
      const items = data.data.getPazientiList.items;
      if (items) {
        items.map((item) => {
          setAllPazienti((prev) => [...prev, item]);
        });
      }
      if (data.data.getPazientiList.nextToken) {
        setAllPazientiNextToken(data.data.getPazientiList.nextToken);
      } else {
        setAllPazientiNextToken(null);
        setAllPazientiContinueFetch(false);
      }
      setAllPazientiLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllPazientiLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPazienti();
  }, []);

  const fetchSearchPazienti = async () => {
    setAllPazientiLoading(true);
    setAllPazienti([]);
    if (searchTextChanged) {
      setSearchAllPazientiData([]);
    }
    setSearchResult(true);
    try {
      const data = await appsync.graphql({
        query: searchAllPazienti,
        variables: {
          query: searchText,
          limit: 101,
          nextToken: searchAllPazientiNextToken
            ? searchAllPazientiNextToken
            : null,
        },
      });
      const items = data.data.searchAllPazienti.items;
      if (items) {
        items.map((item) => {
          setSearchAllPazientiData((prev) => [...prev, item]);
        });
      }
      if (data.data.searchAllPazienti.nextToken) {
        setSearchAllPazientiNextToken(data.data.searchAllPazienti.nextToken);
      } else {
        setSearchAllPazientiNextToken(null);
        setSearchAllPazientiContinueFetch(false);
      }
      setAllPazientiLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllPazientiLoading(false);
    }
  };

  const onClickSearch = () => {
    fetchSearchPazienti();
    setSearchTextChanged(false);
  };

  const onChangeSearchField = (event) => {
    const text = event.target.value;
    setSearchTextChanged(true);
    setSearchText(text);
  };

  const onClickResetSearch = () => {
    setSearchAllPazientiData([]);
    fetchAllPazienti();
    setSearchResult(false);
    setSearchTextChanged(false);
    setSearchText('');
  };

  return (
    <div className='allpazienti-container'>
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
            searchAllPazientiData.length > 0
              ? searchAllPazientiData
              : allPazienti
          }
          fetchPaginationData={
            searchAllPazientiData.length > 0
              ? fetchSearchPazienti
              : fetchAllPazienti
          }
          continueFetching={
            searchAllPazientiData.length > 0
              ? searchAllPazientiContinueFetch
              : allPazientiContinueFetch
          }
          loadingItems={allPazientiLoading}
        />
      </div>
    </div>
  );
}

export default AllPazienti;
