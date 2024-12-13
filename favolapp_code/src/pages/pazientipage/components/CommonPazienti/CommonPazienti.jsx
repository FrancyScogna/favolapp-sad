import { Button, IconButton, InputAdornment, InputBase } from '@mui/material';
import './CommonPazienti.css';
import PazienteList from '../PazienteList/PazienteList';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import {
  getCommonPazienti,
  searchCommonPazienti,
} from '../../../../services/queries';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../slices/snackbar-slice';
import { Search } from '@mui/icons-material';
import PropTypes from 'prop-types';
const appsync = generateClient();

function CommonPazienti({ userId }) {
  const [allCommonPazienti, setAllCommonPazienti] = useState([]);
  const [allCommonPazientiNextToken, setAllCommonPazientiNextToken] =
    useState(null);
  const [allCommonPazientiContinueFetch, setAllCommonPazientiContinueFetch] =
    useState(true);
  const [allCommonPazientiLoading, setAllCommonPazientiLoading] =
    useState(false);
  const [searchAllCommonPazientiData, setSearchAllCommonPazientiData] =
    useState([]);
  const [
    searchAllCommonPazientiNextToken,
    setSearchAllCommonPazientiNextToken,
  ] = useState(null);
  const [
    searchAllCommonPazientiContinueFetch,
    setSearchAllCommonPazientiContinueFetch,
  ] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(false);
  const [searchTextChanged, setSearchTextChanged] = useState(false);
  const dispatch = useDispatch();

  const fetchAllCommonPazienti = async () => {
    setSearchAllCommonPazientiData([]);
    setAllCommonPazientiLoading(true);
    try {
      const data = await appsync.graphql({
        query: getCommonPazienti,
        variables: {
          userId: userId,
          limit: 101,
          nextToken: allCommonPazientiNextToken
            ? allCommonPazientiNextToken
            : null,
        },
      });
      const items = data.data.getCommonPazienti.items;
      if (items) {
        items.map((item) => {
          setAllCommonPazienti((prev) => [...prev, item]);
        });
      }
      if (data.data.getCommonPazienti.nextToken) {
        setAllCommonPazientiNextToken(data.data.getCommonPazienti.nextToken);
      } else {
        setAllCommonPazientiNextToken(null);
        setAllCommonPazientiContinueFetch(false);
      }
      setAllCommonPazientiLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllCommonPazientiLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCommonPazienti();
  }, []);

  const fetchSearchCommonPazienti = async () => {
    setAllCommonPazientiLoading(true);
    setAllCommonPazienti([]);
    if (searchTextChanged) {
      setSearchAllCommonPazientiData([]);
    }
    setSearchResult(true);
    try {
      const data = await appsync.graphql({
        query: searchCommonPazienti,
        variables: {
          userId,
          query: searchText,
          limit: 101,
          nextToken: searchAllCommonPazientiNextToken
            ? searchAllCommonPazientiNextToken
            : null,
        },
      });
      const items = data.data.searchCommonPazienti.items;
      if (items) {
        items.map((item) => {
          setSearchAllCommonPazientiData((prev) => [...prev, item]);
        });
      }
      if (data.data.searchCommonPazienti.nextToken) {
        setSearchAllCommonPazientiNextToken(
          data.data.searchCommonPazienti.nextToken
        );
      } else {
        setSearchAllCommonPazientiNextToken(null);
        setSearchAllCommonPazientiContinueFetch(false);
      }
      setAllCommonPazientiLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllCommonPazientiLoading(false);
    }
  };

  const onClickSearch = () => {
    fetchSearchCommonPazienti();
    setSearchTextChanged(false);
  };

  const onChangeSearchField = (event) => {
    const text = event.target.value;
    setSearchTextChanged(true);
    setSearchText(text);
  };

  const onClickResetSearch = () => {
    setSearchAllCommonPazientiData([]);
    fetchAllCommonPazienti();
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
            searchAllCommonPazientiData.length > 0
              ? searchAllCommonPazientiData
              : allCommonPazienti
          }
          fetchPaginationData={
            searchAllCommonPazientiData.length > 0
              ? fetchSearchCommonPazienti
              : fetchAllCommonPazienti
          }
          continueFetching={
            searchAllCommonPazientiData.length > 0
              ? searchAllCommonPazientiContinueFetch
              : allCommonPazientiContinueFetch
          }
          loadingItems={allCommonPazientiLoading}
        />
      </div>
    </div>
  );
}

CommonPazienti.propTypes = {
  userId: PropTypes.string,
};

export default CommonPazienti;
