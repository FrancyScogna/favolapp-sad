import { Button, IconButton, InputAdornment, InputBase } from '@mui/material';
import './AllOtherPazienti.css';
import PazienteList from '../PazienteList/PazienteList';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import {
  getPazientiByUserId,
  searchPazientiByUserId,
} from '../../../../services/queries';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../slices/snackbar-slice';
import { Search } from '@mui/icons-material';
import PropTypes from 'prop-types';
const appsync = generateClient();

function AllOtherPazienti({ userId }) {
  const [allOtherPazienti, setAllOtherPazienti] = useState([]);
  const [allOtherPazientiNextToken, setAllOtherPazientiNextToken] =
    useState(null);
  const [allOtherPazientiContinueFetch, setAllOtherPazientiContinueFetch] =
    useState(true);
  const [allOtherPazientiLoading, setAllOtherPazientiLoading] = useState(false);
  const [searchAllOtherPazientiData, setSearchAllOtherPazientiData] = useState(
    []
  );
  const [searchAllOtherPazientiNextToken, setSearchAllOtherPazientiNextToken] =
    useState(null);
  const [
    searchAllOtherPazientiContinueFetch,
    setSearchAllOtherPazientiContinueFetch,
  ] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(false);
  const [searchTextChanged, setSearchTextChanged] = useState(false);
  const dispatch = useDispatch();

  const fetchAllOtherPazienti = async () => {
    setSearchAllOtherPazientiData([]);
    setAllOtherPazientiLoading(true);
    try {
      const data = await appsync.graphql({
        query: getPazientiByUserId,
        variables: {
          userId: userId,
          limit: 101,
          nextToken: allOtherPazientiNextToken
            ? allOtherPazientiNextToken
            : null,
        },
      });
      const items = data.data.getPazientiByUserId.items;
      if (items) {
        items.map((item) => {
          setAllOtherPazienti((prev) => [...prev, item]);
        });
      }
      if (data.data.getPazientiByUserId.nextToken) {
        setAllOtherPazientiNextToken(data.data.getPazientiByUserId.nextToken);
      } else {
        setAllOtherPazientiNextToken(null);
        setAllOtherPazientiContinueFetch(false);
      }
      setAllOtherPazientiLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllOtherPazientiLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOtherPazienti();
  }, []);

  const fetchSearchOtherPazienti = async () => {
    setAllOtherPazientiLoading(true);
    setAllOtherPazienti([]);
    if (searchTextChanged) {
      setSearchAllOtherPazientiData([]);
    }
    setSearchResult(true);
    try {
      const data = await appsync.graphql({
        query: searchPazientiByUserId,
        variables: {
          userId: userId,
          query: searchText,
          limit: 101,
          nextToken: searchAllOtherPazientiNextToken
            ? searchAllOtherPazientiNextToken
            : null,
        },
      });
      const items = data.data.searchPazientiByUserId.items;
      if (items) {
        items.map((item) => {
          setSearchAllOtherPazientiData((prev) => [...prev, item]);
        });
      }
      if (data.data.searchPazientiByUserId.nextToken) {
        setSearchAllOtherPazientiNextToken(
          data.data.searchPazientiByUserId.nextToken
        );
      } else {
        setSearchAllOtherPazientiNextToken(null);
        setSearchAllOtherPazientiContinueFetch(false);
      }
      setAllOtherPazientiLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllOtherPazientiLoading(false);
    }
  };

  const onClickSearch = () => {
    fetchSearchOtherPazienti();
    setSearchTextChanged(false);
  };

  const onChangeSearchField = (event) => {
    const text = event.target.value;
    setSearchTextChanged(true);
    setSearchText(text);
  };

  const onClickResetSearch = () => {
    setSearchAllOtherPazientiData([]);
    fetchAllOtherPazienti();
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
            searchAllOtherPazientiData.length > 0
              ? searchAllOtherPazientiData
              : allOtherPazienti
          }
          fetchPaginationData={
            searchAllOtherPazientiData.length > 0
              ? fetchSearchOtherPazienti
              : fetchAllOtherPazienti
          }
          continueFetching={
            searchAllOtherPazientiData.length > 0
              ? searchAllOtherPazientiContinueFetch
              : allOtherPazientiContinueFetch
          }
          loadingItems={allOtherPazientiLoading}
        />
      </div>
    </div>
  );
}

AllOtherPazienti.propTypes = {
  userId: PropTypes.string,
};

export default AllOtherPazienti;
