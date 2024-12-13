import './Profile.css';
import {
  Alert,
  Avatar,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import avatarDefaultMan from '/images/avatarDefaultMan.jpg';
import avatarDefaultWoman from '/images/avatarDefaultWoman.jpg';
import PropTypes from 'prop-types';
import NavButtons from './components/NavButtons/NavButtons';
import { getUrl } from 'aws-amplify/storage';
import { Error, PhotoCamera } from '@mui/icons-material';
import UploadAvatar from './components/UploadAvatar/UploadAvatar';
import { showSnackbar } from '../../slices/snackbar-slice';
import EditUserInfoDialog from '../../components/common/EditUserInfoDialog/EditUserInfoDialog';
import { generateClient } from 'aws-amplify/api';
import { getUser } from '../../services/queries';
const appsync = generateClient();

function Profile({ type = 'mine' }) {
  const dispatch = useDispatch();
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const { userId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [userAttributes, setUserAttributes] = useState(null);
  const [imageError, setImageError] = useState(false);
  const location = useLocation();
  const [openEditUser, setOpenEditUser] = useState(false);
  const [deletedAccount, setDeletedAccount] = useState(false);
  const navigate = useNavigate();

  //Upload avatar variables
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [openUploadAvatar, setOpenUploadAvatar] = useState(false);

  const fetchOtherUser = async () => {
    const data = await appsync.graphql({
      query: getUser,
      variables: { userId },
    });
    let otherUser = data.data.getUser;
    if(otherUser.active && otherUser.active === 'true'){

      setDeletedAccount(true);
      
    }else{

      try {
        const avatarUrl = await getUrl({ path: otherUser.avatarURL });
        otherUser = { ...otherUser, avatarURL: avatarUrl.url.toString() };
      } catch (error) {
        otherUser = { ...otherUser, avatarURL: null };
      }
  
      setDeletedAccount(false);
      setIsMyProfile(false);
      setUserProfile(otherUser);

    }
    
    setLoadingProfile(false);
  };

  useEffect(() => {
    setLoadingProfile(true);
    setDeletedAccount(false);
    if (userId === user.id) {
      if (user.role === 'ADMIN') {
        navigate('/admin/profile', { replace: true });
      } else {
        navigate('/app/profile', { replace: true });
      }
    }
    if (type === 'mine') {
      setUserProfile(user);
      setIsMyProfile(true);
      setLoadingProfile(false);
    } else {
      fetchOtherUser();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (userProfile) {
      const attributes = [
        { attribute: 'Email', value: userProfile.email },
        { attribute: 'Numero di telefono', value: userProfile.phone_number },
        { attribute: 'Data di nascita', value: userProfile.birthdate },
        { attribute: 'Codice Fiscale', value: userProfile.codfis },
        {
          attribute: 'Genere',
          value: userProfile.gender === 'M' ? 'Maschio' : 'Femmina',
        },
        { attribute: 'Provincia', value: userProfile.provincia },
        { attribute: 'Comune', value: userProfile.comune },
      ];
      setUserAttributes(attributes);
    }
  }, [userProfile]);

  const onImageSelected = (e) => {
    setImage(null);
    setFile(null);
    const file = e.target.files[0];
    if (
      file &&
      (file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/jpg')
    ) {
      const formData = new FormData();
      formData.append('image', file);
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
      setOpenUploadAvatar(true);
    } else {
      dispatch(
        showSnackbar({
          message:
            "Il formato dell'immagine non è valido. Formati supportati: png, jpeg, jpg.",
          severity: 'error',
        })
      );
    }
    e.target.value = null;
  };

  if(deletedAccount){
    return(
      <div style={{display: "flex", width: "100%", height: "100%", justifyContent: "center"}}>
        <div style={{display: "flex", maxWidth: "600px", maxHeight: "120px", flexDirection: "row", alignItems: "center", marginTop: "10%"}}>
            <Error style={{color: "black", fontSize: "30px", marginRight: "10px"}}/>
            <h1 style={{color: "black"}}>Utente non trovato</h1>
        </div>
      </div>
    )
  }

  return (
    <div className='profile-page'>
      {loadingProfile && (
        <div className='loading-profile-div'>
          <CircularProgress />
        </div>
      )}
      {!loadingProfile && (
        <div className='userprofile-container'>
          <div className='info-container'>
            <div className='avatar'>
              <Avatar
                className='avatar'
                src={
                  userProfile.avatarURL && !imageError
                    ? userProfile.avatarURL
                    : userProfile.gender === 'M'
                      ? avatarDefaultMan
                      : avatarDefaultWoman
                }
                onError={() => setImageError(true)}
              />
              {isMyProfile && (
                <div className='edit-avatar'>
                  <IconButton
                    className='icon-button'
                    onClick={() =>
                      document.getElementById('imageInput').click()
                    }
                  >
                    <PhotoCamera />
                  </IconButton>
                  <input
                    type='file'
                    accept='image/jpeg, image/png, image/jpg'
                    onChange={onImageSelected}
                    style={{ display: 'none' }}
                    id='imageInput'
                  />
                  {openUploadAvatar && (
                    <UploadAvatar
                      open={openUploadAvatar}
                      setOpen={setOpenUploadAvatar}
                      image={image}
                      file={file}
                      setUserProfile={setUserProfile}
                    />
                  )}
                </div>
              )}
            </div>
            <Typography className='name'>{`${userProfile.name} ${userProfile.surname}`}</Typography>
            <Typography className='role'>
              {userProfile.role === 'ADMIN' ? 'Supervisore' : 'Tutor'}
            </Typography>
            <Typography className='title'>{userProfile.title}</Typography>
          </div>
          <NavButtons
            userProfile={userProfile}
            myRole={user.role.toLowerCase()}
            isMyProfile={isMyProfile}
          />
          <div className='user-details-container'>
            <Card className='card'>
              <div className='card-title'>
                <Typography className='title'>
                  {"Informazioni sull'utente"}
                </Typography>
                {user.role === 'ADMIN' && (
                  <Button
                    onClick={() => setOpenEditUser(true)}
                    size='small'
                    className='button'
                    variant='contained'
                  >
                    Modifica
                  </Button>
                )}
                {openEditUser && (
                  <EditUserInfoDialog
                    userProfile={userProfile}
                    open={openEditUser}
                    setOpen={setOpenEditUser}
                    setUserProfile={setUserProfile}
                  />
                )}
              </div>
              <Divider className='divider' />
              <Grid container className='grid-container'>
                {userAttributes &&
                  userAttributes.map((attr) => (
                    <Grid
                      key={attr.attribute}
                      item
                      className='grid-item'
                      xs={12}
                    >
                      <Typography className='attribute'>
                        {attr.attribute}:
                      </Typography>
                      <Typography className='value'>{attr.value}</Typography>
                    </Grid>
                  ))}
              </Grid>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

Profile.propTypes = {
  type: PropTypes.string,
};

export default Profile;
