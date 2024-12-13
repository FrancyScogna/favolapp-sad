import {
  Button,
  IconButton,
  InputAdornment,
  InputBase,
  Typography,
} from '@mui/material';
import './Users.css';
import UserList from './UserList/UserList';
import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import AddUserDialog from '../../components/common/AddUserDialog/AddUserDialog';
import { getUsersList } from '../../services/queries';
import { searchAllUsers } from '../../services/queries';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../slices/snackbar-slice';
import { Search } from '@mui/icons-material';
const appsync = generateClient();

function Users() {
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersNextToken, setAllUsersNextToken] = useState(null);
  const [allUsersContinueFetch, setAllUsersContinueFetch] = useState(true);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [searchAllUsersData, setSearchAllUsersData] = useState([]);
  const [searchAllUsersNextToken, setSearchAllUsersNextToken] = useState(null);
  const [searchAllUsersContinueFetch, setSearchAllUsersContinueFetch] =
    useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(false);
  const [searchTextChanged, setSearchTextChanged] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const dispatch = useDispatch();

  const fetchAllUsers = async () => {
    setSearchAllUsersData([]);
    setAllUsersLoading(true);
    try {
      const data = await appsync.graphql({
        query: getUsersList,
        variables: {
          limit: 101,
          nextToken: allUsersNextToken ? allUsersNextToken : null,
        },
      });
      const items = data.data.getUsersList.items;
      if (items) {
        items.map((item) => {
          if(item && item.active === "false"){
            setAllUsers((prev) => [...prev, item]);
          }
        });
      }
      if (data.data.getUsersList.nextToken) {
        setAllUsersNextToken(data.data.getUsersList.nextToken);
      } else {
        setAllUsersNextToken(null);
        setAllUsersContinueFetch(false);
      }
      setAllUsersLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchSearchUsers = async () => {
    setAllUsersLoading(true);
    setAllUsers([]);
    if (searchTextChanged) {
      setSearchAllUsersData([]);
    }
    setSearchResult(true);
    try {
      const data = await appsync.graphql({
        query: searchAllUsers,
        variables: {
          query: searchText,
          limit: 101,
          nextToken: searchAllUsersNextToken ? searchAllUsersNextToken : null,
        },
      });
      const items = data.data.searchAllUsers.items;
      if (items) {
        items.map((item) => {
          setSearchAllUsersData((prev) => [...prev, item]);
        });
      }
      if (data.data.searchAllUsers.nextToken) {
        setSearchAllUsersNextToken(data.data.searchAllUsers.nextToken);
      } else {
        setSearchAllUsersNextToken(null);
        setSearchAllUsersContinueFetch(false);
      }
      setAllUsersLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setAllUsersLoading(false);
    }
  };

  const onClickSearch = () => {
    fetchSearchUsers();
    setSearchTextChanged(false);
  };

  const onChangeSearchField = (event) => {
    const text = event.target.value;
    setSearchTextChanged(true);
    setSearchText(text);
  };

  const onClickResetSearch = () => {
    setSearchAllUsersData([]);
    fetchAllUsers();
    setSearchResult(false);
    setSearchTextChanged(false);
    setSearchText('');
  };

  return (
    <div className='users-page'>
      <div className='title-container'>
        <Typography className='title'>Utenti</Typography>
      </div>
      <Button
        variant='contained'
        className='add-user-button'
        onClick={() => setOpenAddUser(true)}
      >
        Aggiungi utente
      </Button>
      {openAddUser && (
        <AddUserDialog open={openAddUser} setOpen={setOpenAddUser} />
      )}
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
        <UserList
          data={searchAllUsersData.length > 0 ? searchAllUsersData : allUsers}
          fetchPaginationData={
            searchAllUsersData.length > 0 ? fetchSearchUsers : fetchAllUsers
          }
          continueFetching={
            searchAllUsersData.length > 0
              ? searchAllUsersContinueFetch
              : allUsersContinueFetch
          }
          setData={
            searchAllUsersData.length > 0 ? setSearchAllUsersData : setAllUsers
          }
          loadingItems={allUsersLoading}
        />
      </div>
    </div>
  );
}

export default Users;
