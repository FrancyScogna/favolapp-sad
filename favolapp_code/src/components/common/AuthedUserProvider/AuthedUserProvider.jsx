import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyUser } from '../../../services/queries';
import { login, logout } from '../../../slices/auth-slice';
import PropTypes from 'prop-types';
import './AuthedUserProvider.css';
import { getUrl } from 'aws-amplify/storage';

function AuthedUserProvider({ children }) {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.auth);
  const client = generateClient();
  const [loading, setLoading] = useState(true);

  const fetchAuthedUser = async () => {
    setLoading(true);
    const localUser = false;
    if (!localUser) {
      try {
        const user = await getCurrentUser();
        if (user) {
          const userData = await client.graphql({
            query: getMyUser,
          });
          let user = userData.data.getMyUser;
          if (user.avatarURL) {
            try {
              const avatarURL = await getUrl({ path: user.avatarURL });
              user = { ...user, avatarURL: avatarURL.url.toString() };
            } catch (error) {
              user = { ...user, avatarURL: null };
            }
          }
          const role = user.role.toLowerCase();
          dispatch(login({ role, user }));
          setLoading(false);
        }
      } catch (error) {
        dispatch(logout());
        setLoading(false);
      }
    } else {
      const user = {
        avatarURL: null,
        bio: null,
        birthdate: '1997-09-06',
        codfis: 'SCGFNC97P06F839U',
        comune: 'Napoli',
        createdAt: '2024-06-03T12:57:21.343Z',
        email: 'francosco@hotmail.it',
        gender: 'M',
        id: '1265d464-7021-7072-b7b0-aded12e09785',
        name: 'Francesco',
        phone_number: '+39 3291879855',
        provincia: 'NA',
        role: 'TUTOR',
        surname: 'Scognamiglio',
        title: 'Ingegnere',
        updatedAt: '2024-06-03T12:57:21.343Z',
        tasksCount: 20,
        reportsCount: 50,
        pazientiCount: 40,
        schedeCount: 60,
        notesCount: 70,
        website: null,
      };
      dispatch(login({ role: user.role.toLowerCase(), user }));
      setTimeout(() => setLoading(false), 2000);
    }
  };

  useEffect(() => {
    fetchAuthedUser();
  }, []);

  useEffect(() => {
    fetchAuthedUser();
  }, [state.refresh]);

  if (loading) {
    return (
      <div className='loading-screen'>
        <img
          src={'/images/Logo_Motto.png'}
          alt='Logo'
          className='loading-logo'
        />
      </div>
    );
  }

  return children;
}

AuthedUserProvider.propTypes = {
  children: PropTypes.arrayOf(PropTypes.object),
};

export default AuthedUserProvider;
