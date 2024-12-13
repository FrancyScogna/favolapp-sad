import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import './UploadAvatar.css';
import { getUrl, uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { updateAvatarURL } from '../../../../services/mutations';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../../slices/snackbar-slice';
import { editAuthUser } from '../../../../slices/auth-slice';
const appsync = generateClient();

function UploadAvatar({ open, setOpen, image, file, setUserProfile }) {
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const dispatch = useDispatch();

  const onClickUploadAvatar = () => {
    try {
      setLoading(true);
      if (!file) {
        alert('No file selected');
        return;
      }
      const extension = file.type.replace('image/', '');
      uploadData({
        path: ({ identityId }) =>
          `public/${identityId}/profile/avatar.${extension}`,
        data: file,
        options: {
          contentType: file.type,
          async onProgress(event) {
            try {
              if (event.transferredBytes === event.totalBytes) {
                const url = await getUrl({
                  path: ({ identityId }) =>
                    `public/${identityId}/profile/avatar.${extension}`,
                });
                const path = `public/${url.url.pathname.split('/')[2].replace('%3A', ':')}/profile/avatar.${extension}`;
                await appsync.graphql({
                  query: updateAvatarURL,
                  variables: { path },
                });
                setUserProfile((prev) => ({
                  ...prev,
                  avatarURL: url.url.toString(),
                }));
                dispatch(
                  editAuthUser({ user: { avatarURL: url.url.toString() } })
                );
                dispatch(
                  showSnackbar({ message: 'Immagine caricata con successo.' })
                );
                setOpen(false);
                setLoading(false);
              }
            } catch (error) {
              setLoading(false);
              dispatch(
                showSnackbar({
                  message: "Errore nel caricamento dell'immagine",
                  severity: 'error',
                })
              );
            }
          },
        },
      });
    } catch (error) {
      setLoading(false);
      dispatch(
        showSnackbar({
          message: "Errore nel caricamento dell'immagine",
          severity: 'error',
        })
      );
    }
  };

  return (
    <Dialog open={open} className='uploadavatar-dialog'>
      <DialogTitle className='dialog-title'>
        <Typography className='title'>Carica immagine del profilo</Typography>
      </DialogTitle>
      <DialogContent className='dialog-content'>
        <div className='avatar-div'>
          <img
            src={image}
            alt='New Avatar'
            onLoad={() => setLoadingPreview(false)}
          />
          {loadingPreview && (
            <div className='loading-div'>
              <CircularProgress className='loading-progress' />
            </div>
          )}
        </div>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <LoadingButton
            loading={loading}
            onClick={onClickUploadAvatar}
            color='error'
          >
            Salva
          </LoadingButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

UploadAvatar.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  image: PropTypes.string,
  file: PropTypes.object,
  setUserProfile: PropTypes.func,
};

export default UploadAvatar;
