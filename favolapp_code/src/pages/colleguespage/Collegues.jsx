import {
  Button,
  IconButton,
  InputAdornment,
  InputBase,
  Typography,
} from '@mui/material';
import './Collegues.css';
import ColleguesList from './ColleguesList/ColleguesList';
import { Search } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../slices/snackbar-slice';
import { generateClient } from 'aws-amplify/api';
import { getMyCollegues, searchMyCollegues } from '../../services/queries';
const appsync = generateClient();

function Collegues() {
  const [allCollegues, setAllCollegues] = useState([]);
  const [allColleguesNextToken, setAllColleguesNextToken] = useState(null);
  const [allColleguesContinueFetch, setAllColleguesContinueFetch] =
    useState(true);
  const [allColleguesLoading, setAllColleguesLoading] = useState(false);
  const [searchAllColleguesData, setSearchAllColleguesData] = useState([]);
  const [searchAllColleguesNextToken, setSearchAllColleguesNextToken] =
    useState(null);
  const [searchAllColleguesContinueFetch, setSearchAllColleguesContinueFetch] =
    useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(false);
  const [searchTextChanged, setSearchTextChanged] = useState(false);
  const dispatch = useDispatch();

  const fetchAllCollegues = async () => {
    setSearchAllColleguesData([]);
    setAllColleguesLoading(true);
    try {
      const data = await appsync.graphql({
        query: getMyCollegues,
        variables: {
          limit: 101,
          nextToken: allColleguesNextToken ? allColleguesNextToken : null,
        },
      });
      const items = data.data.getMyCollegues.items;
      if (items) {
        items.map((item) => {
          setAllCollegues((prev) => [...prev, item]);
        });
      }
      if (data.data.getMyCollegues.nextToken) {
        setAllColleguesNextToken(data.data.getMyCollegues.nextToken);
      } else {
        setAllColleguesNextToken(null);
        setAllColleguesContinueFetch(false);
      }
      setAllColleguesLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllColleguesLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCollegues();
  }, []);

  const fetchSearchCollegues = async () => {
    setAllColleguesLoading(true);
    setAllCollegues([]);
    if (searchTextChanged) {
      setSearchAllColleguesData([]);
    }
    setSearchResult(true);
    try {
      const data = await appsync.graphql({
        query: searchMyCollegues,
        variables: {
          query: searchText,
          limit: 101,
          nextToken: searchAllColleguesNextToken
            ? searchAllColleguesNextToken
            : null,
        },
      });
      const items = data.data.searchMyCollegues.items;
      if (items) {
        items.map((item) => {
          setSearchAllColleguesData((prev) => [...prev, item]);
        });
      }
      if (data.data.searchMyCollegues.nextToken) {
        setSearchAllColleguesNextToken(data.data.searchMyCollegues.nextToken);
      } else {
        setSearchAllColleguesNextToken(null);
        setSearchAllColleguesContinueFetch(false);
      }
      setAllColleguesLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllColleguesLoading(false);
    }
  };

  const onClickSearch = () => {
    setSearchAllColleguesData([]);
    setSearchAllColleguesNextToken(null);
    setAllColleguesNextToken(null);
    fetchSearchCollegues();
    setSearchTextChanged(false);
  };

  const onChangeSearchField = (event) => {
    const text = event.target.value;
    setSearchTextChanged(true);
    setSearchText(text);
  };

  const onClickResetSearch = () => {
    setSearchAllColleguesData([]);
    setSearchAllColleguesNextToken(null);
    setAllColleguesNextToken(null);
    fetchAllCollegues();
    setSearchResult(false);
    setSearchTextChanged(false);
    setSearchText('');
  };

  return (
    <div className='collegues-page'>
      <div className='title-container'>
        <Typography className='title'>{'Colleghi'}</Typography>
      </div>
      <div className='search-input'>
        <InputBase
          className='search-input-field'
          placeholder='Cerca un utente...'
          value={searchText}
          onChange={onChangeSearchField}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton
                disabled={searchText ? false : true}
                onClick={onClickSearch}
              >
                <Search />
              </IconButton>
            </InputAdornment>
          }
        />
      </div>
      <div className='userlist-container'>
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
        <ColleguesList
          data={
            searchAllColleguesData.length > 0
              ? searchAllColleguesData
              : allCollegues
          }
          fetchPaginationData={
            searchAllColleguesData.length > 0
              ? fetchSearchCollegues
              : fetchAllCollegues
          }
          continueFetching={
            searchAllColleguesData.length > 0
              ? searchAllColleguesContinueFetch
              : allColleguesContinueFetch
          }
          setData={
            searchAllColleguesData.length > 0
              ? setSearchAllColleguesData
              : setAllCollegues
          }
          loadingItems={allColleguesLoading}
        />
      </div>
    </div>
  );
}

export default Collegues;
