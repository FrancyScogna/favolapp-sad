import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import {
  ContentPaste,
  Diversity3,
  /*Dns,*/
  Dvr,
  /*EventNote,*/
  Logout,
  Menu,
  /*Mouse,*/
  People,
  Person,
  Report,
  ToggleOn,
} from '@mui/icons-material';
import LogOutDialog from '../LogOutDialog/LogOutDialog';
import Logo from '/images/Logo.png';

const adminData = [
  { icon: <ToggleOn />, label: 'Dashboard', path: 'dashboard' },
  { icon: <Person />, label: 'Profilo', path: 'profile' },
  { icon: <People />, label: 'Utenti', path: 'users' },
  { icon: <Diversity3 />, label: 'Colleghi', path: 'collegues' },
  { icon: <Report />, label: 'Report', path: 'reportlist' },
  /*{ icon: <Dns />, label: 'Tasks', path: 'tasklist' },*/
  { icon: <ContentPaste />, label: 'Pazienti', path: 'pazienti' },
  { icon: <Dvr />, label: 'Attività', path: 'activity' },
  /*{ icon: <Mouse />, label: 'Schede', path: 'schede' },
  { icon: <EventNote />, label: 'Note', path: 'note' },*/
  { icon: <Logout />, label: 'Disconnetti', path: 'logout' },
];

const tutorData = [
  { icon: <ToggleOn />, label: 'Dashboard', path: 'dashboard' },
  { icon: <Person />, label: 'Profilo', path: 'profile' },
  { icon: <Diversity3 />, label: 'Colleghi', path: 'collegues' },
  { icon: <Report />, label: 'Report', path: 'reportlist' },
  /*{ icon: <Dns />, label: 'Tasks', path: 'tasklist' },*/
  { icon: <ContentPaste />, label: 'Pazienti', path: 'pazienti' },
  /* { icon: <Mouse />, label: 'Schede', path: 'schede' },
  { icon: <EventNote />, label: 'Note', path: 'note' },*/
  { icon: <Logout />, label: 'Disconnetti', path: 'logout' },
];

const FireNav = styled(List)({
  '& .MuiListItemButton-root': {
    paddingLeft: 24,
    paddingRight: 24,
    minHeight: 61,
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: 16,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
});

export default function Navigation({ role }) {
  const [data, setData] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [openLogout, setOpenLogOut] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setOpen(open);
  };
  const handleMenuItemClick = (path) => {
    if (path === 'logout') {
      setOpenLogOut(true);
    } else {
      if (location.pathname !== path) {
        navigate(path);
      }
      setOpen(false);
    }
  };

  const menu = (
    <FireNav component='nav' disablePadding>
      <ListItemButton
        component='a'
        onClick={() => {
          navigate('dashboard');
          setOpen(false);
        }}
        sx={{ display: { xs: 'flex', md: 'none' } }} // Mostra solo su schermi piccoli
      >
        <img src={Logo} style={{ width: '128px' }} />
      </ListItemButton>
      <Divider sx={{ display: { xs: 'block', md: 'none' } }} />{' '}
      {/* Mostra solo su schermi piccoli */}
      {data &&
        data.map((item) => (
          <ListItemButton
            key={item.label}
            sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }}
            onClick={() => handleMenuItemClick(item.path)}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 'medium',
              }}
            />
          </ListItemButton>
        ))}
      {!data && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            width: '100%',
            height: 'calc(100vh - 70px)',
          }}
        >
          <CircularProgress />
        </div>
      )}
    </FireNav>
  );

  useEffect(() => {
    if (location.pathname) {
      if (
        location.pathname === '/admin/' ||
        location.pathname === '/admin' ||
        location.pathname === '/app/' ||
        location.pathname === '/app'
      ) {
        navigate('dashboard');
      }
    }
    if (role) {
      if (role === 'admin') {
        setData(adminData);
      } else {
        if (role === 'tutor') {
          setData(tutorData);
        }
      }
    }
  }, []);

  return (
    <>
      <ThemeProvider
        theme={createTheme({
          components: {
            MuiListItemButton: {
              defaultProps: {
                disableTouchRipple: true,
              },
            },
          },
          palette: {
            mode: 'dark',
            primary: { main: 'rgb(102, 157, 246)' },
            background: { paper: 'rgb(5, 30, 52)' },
          },
        })}
      >
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar position='fixed'>
            <Toolbar>
              <IconButton
                color='inherit'
                aria-label='open drawer'
                onClick={toggleDrawer(true)}
                edge='start'
                sx={{ mr: 2, display: { md: 'none' } }} // Mostra solo su schermi piccoli
              >
                <Menu />
              </IconButton>
              <img
                src={Logo}
                onClick={() => {
                  navigate('dashboard');
                }}
                style={{ width: '128px', cursor: 'pointer' }}
              />
            </Toolbar>
          </AppBar>
          <Drawer
            anchor='left'
            open={open}
            onClose={toggleDrawer(false)}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 256,
              },
              display: { xs: 'block', md: 'none' },
            }}
          >
            {menu}
          </Drawer>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 64, // Altezza dell'AppBar
              bottom: 0,
            }}
          >
            <Paper
              elevation={0}
              sx={{ width: 256, height: '100%', overflow: 'auto' }}
            >
              {menu}
            </Paper>
          </Box>
        </Box>
      </ThemeProvider>
      <LogOutDialog open={openLogout} setOpen={setOpenLogOut} />
    </>
  );
}

Navigation.propTypes = {
  role: PropTypes.string,
};
