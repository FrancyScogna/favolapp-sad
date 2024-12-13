import { Avatar, Button, Card, Grid, Typography } from '@mui/material';
import './Dashboard.css';
import {
  Dns,
  Logout,
  People,
  /*PermMedia,*/
  Public,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LogOutDialog from '../../components/common/LogOutDialog/LogOutDialog';
import avatarDefaultMan from '/images/avatarDefaultMan.jpg';
import avatarDefaultWoman from '/images/avatarDefaultWoman.jpg';

function Dashboard() {
  const [infoWidth, setInfoWidth] = useState(null);
  const { user, role } = useSelector((state) => state.auth);
  const [dashboardList, setDashboardList] = useState(null);
  const [openLogOutDialog, setOpenLogOutDialog] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const dashboardAdminList = [
    /*{
      name: 'Task',
      icon: <Dns className='icon' />,
      count: user.tasksCount,
      path: 'task',
    },*/
    {
      name: 'Attività',
      icon: <People className='icon' />,
      count: null,
      path: 'activity',
    },
    {
      name: 'I miei pazienti',
      icon: <Public className='icon' />,
      count: user.pazientiCount,
      path: 'pazienti',
    },
    {
      name: 'I miei report',
      icon: <Dns className='icon' />,
      count: user.reportsCount,
      path: 'reportlist',
    },
    /*{
      name: 'Le mie schede',
      icon: <PermMedia className='icon' />,
      count: user.schedeCount,
      path: 'schede',
    },
    {
      name: 'Le mie note',
      icon: <People className='icon' />,
      count: user.notesCount,
      path: 'note',
    },*/
    {
      name: 'Disconnetti',
      icon: <Logout className='icon' />,
      count: null,
      path: 'logout',
    },
  ];

  const dashboardTutorList = [
    /*{
      name: 'Le mie task',
      icon: <Dns className='icon' />,
      count: user.tasksCount,
      path: 'task',
    },*/
    {
      name: 'I miei pazienti',
      icon: <Public className='icon' />,
      count: user.pazientiCount,
      path: 'pazienti',
    },
    {
      name: 'I miei report',
      icon: <Dns className='icon' />,
      count: user.reportsCount,
      path: 'reportlist',
    },
    /* {
      name: 'Le mie schede',
      icon: <PermMedia className='icon' />,
      count: user.schedeCount,
      path: 'schede',
    },
    {
      name: 'Le mie note',
      icon: <People className='icon' />,
      count: user.notesCount,
      path: 'note',
    },*/
    {
      name: 'Disconnetti',
      icon: <Logout className='icon' />,
      count: null,
      path: 'logout',
    },
  ];

  const settingInfoWidth = () => {
    const dashboardPage = document.getElementById('dashboard-id');
    const width = dashboardPage.clientWidth;
    if (width < 620) {
      setInfoWidth('300px');
    } else {
      setInfoWidth('610px');
    }
  };

  useEffect(() => {
    settingInfoWidth();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', settingInfoWidth);
    return () => {
      window.removeEventListener('resize', settingInfoWidth);
    };
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      setDashboardList(dashboardAdminList);
    }
    if (role === 'tutor') {
      setDashboardList(dashboardTutorList);
    }
  }, []);

  const onClickOption = (path) => {
    if (path === 'logout') {
      setOpenLogOutDialog(true);
    } else {
      if (role === 'admin') {
        navigate(`/admin/${path}`);
      }
      if (role === 'tutor') {
        navigate(`/app/${path}`);
      }
    }
  };

  return (
    <div className='dashboard-page' id='dashboard-id'>
      <div className='dashboard-info-tasks'>
        <Grid container className='grid-container'>
          <Grid item className='grid-item'>
            <Card raised className='info-card' style={{ width: infoWidth }}>
              <Avatar
                className='avatar'
                src={
                  user.avatarURL && !imageError
                    ? user.avatarURL
                    : user.gender === 'M'
                      ? avatarDefaultMan
                      : avatarDefaultWoman
                }
                onError={() => setImageError(true)}
              />
              <Typography className='name-surname'>
                {`${user.name} ${user.surname}`}
              </Typography>
              <Typography className='role'>
                {role === 'admin' ? 'Supervisore' : 'Tutor'}
              </Typography>
              <Button
                onClick={() => onClickOption('profile')}
                className='info-button'
                variant='contained'
              >
                Profilo
              </Button>
            </Card>
          </Grid>
          {dashboardList &&
            dashboardList.map((item) => (
              <Grid key={item.name} item className='grid-item'>
                <Card
                  raised
                  className='reports-card'
                  onClick={() => onClickOption(item.path)}
                >
                  {item.icon && item.icon}
                  {item.name && (
                    <Typography className='title'>{item.name}</Typography>
                  )}
                  {(item.count || item.count === 0) && (
                    <Typography className='count'>{item.count}</Typography>
                  )}
                </Card>
              </Grid>
            ))}
        </Grid>
      </div>
      {openLogOutDialog && (
        <LogOutDialog open={openLogOutDialog} setOpen={setOpenLogOutDialog} />
      )}
    </div>
  );
}

export default Dashboard;
