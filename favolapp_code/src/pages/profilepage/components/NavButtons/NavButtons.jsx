import { Button } from '@mui/material';
import './NavButtons.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

function NavButtons({ userProfile, myRole, isMyProfile }) {
  const [list, setList] = useState([]);
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  const buttonsOptions = [
    { key: 0, name: 'Tasks', path: 'list' },
    { key: 1, name: 'Pazienti', path: `/pazienti/${userProfile.id}` },
    { key: 2, name: 'Attività', path: 'list' },
    { key: 3, name: 'Report', path: `/reportlist/${userProfile.id}` },
    { key: 4, name: 'Pazienti', path: `/pazienti/${userProfile.id}` },
    { key: 5, name: 'Report', path: `/reportlist/${userProfile.id}` },
    { key: 6, name: 'Tasks', path: 'list_common' },
  ];

  useEffect(() => {
    if (isMyProfile) {
      setList([]);
    } else {
      let tempList = [];
      if (myRole === 'admin') {
        if (userProfile.role.toLowerCase() === 'admin') {
          tempList.push(buttonsOptions[1]);
          //tempList.push(buttonsOptions[2]);
          tempList.push(buttonsOptions[3]);
        } else {
          //tempList.push(buttonsOptions[0]);
          tempList.push(buttonsOptions[1]);
          //tempList.push(buttonsOptions[2]);
          tempList.push(buttonsOptions[3]);
        }
      } else {
        if (userProfile.role.toLowerCase() === 'admin') {
          tempList.push(buttonsOptions[4]);
          tempList.push(buttonsOptions[5]);
        } else {
          tempList.push(buttonsOptions[4]);
          tempList.push(buttonsOptions[5]);
          //tempList.push(buttonsOptions[6]);
        }
      }
      setList(tempList);
    }
  }, [isMyProfile]);

  const onClickNavigate = (path) => {
    if (role === 'admin') {
      const redirect = '/admin' + path;
      navigate(redirect);
    } else {
      const redirect = '/app' + path;
      navigate(redirect);
    }
  };

  return (
    <div className='navbuttons'>
      {list &&
        list.map((button) => (
          <Button
            key={button.key}
            onClick={() => onClickNavigate(button.path)}
            variant='contained'
            className='button'
          >
            {button.name}
          </Button>
        ))}
    </div>
  );
}

NavButtons.propTypes = {
  userProfile: PropTypes.object,
  myRole: PropTypes.string,
  isMyProfile: PropTypes.bool,
};

export default NavButtons;
