import {
  Alert,
  Button,
  Collapse,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import './CreateTask.css';

import { Delete } from '@mui/icons-material';

import { LoadingButton } from '@mui/lab';
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
function CreateTask({ newTask, onClickClose }) {
  const [alert] = useState(null);
  const DialogContentRef = useRef(null);

  const [tutors] = useState([]);

  return (
    <DialogContent ref={DialogContentRef} className='createtask-dialog'>
      <Grid container className='grid-container'>
        <Collapse in={alert ? true : false} style={{ width: '100%' }}>
          <Grid item className='grid-item'>
            <Alert variant='filled' severity='error' className='alert'>
              {alert &&
                alert.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
            </Alert>
          </Grid>
        </Collapse>
        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>
              {'Informazioni sulla Task'}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          <TextField
            value={newTask.name}
            size='small'
            className='text-field'
            label='Titolo Task*'
          />
        </Grid>

        <Grid item className='grid-item'>
          <TextField
            className='info-task'
            value={newTask.info}
            multiline
            label='Obiettivo Task'
          />
        </Grid>

        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>
              {'Assegna ai tutor'}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          <Button variant='outlined'>Assegna tutor</Button>
        </Grid>
        <Grid item className='grid-item'>
          <div className='section'>
            <Typography className='section-text'>
              {'Assegna Paziente'}
            </Typography>
            <Divider className='section-divider' />
          </div>
        </Grid>
        <Grid item className='grid-item'>
          <Button variant='outlined'>Assegna tutor</Button>
        </Grid>
        {tutors.length > 0 && (
          <Grid item className='grid-item' flexDirection='column'>
            {tutors.map((tutor) => (
              <div key={tutor.id} className='tutor-div'>
                <Typography noWrap className='item-fold'>
                  {tutor.name}
                </Typography>
                <Typography noWrap className='item-fold'>
                  {tutor.surname}
                </Typography>
                <Typography noWrap className='item-fold'>
                  {tutor.role}
                </Typography>
                <Typography noWrap className='item-fold'>
                  {tutor.codfis}
                </Typography>
                <IconButton className='icon-button'>
                  <Delete />
                </IconButton>
              </div>
            ))}
          </Grid>
        )}
      </Grid>
      <DialogActions>
        <Button onClick={onClickClose} color='error'>
          Chiudi
        </Button>
        <LoadingButton>Avanti</LoadingButton>
      </DialogActions>
    </DialogContent>
  );
}
CreateTask.propTypes = {
  newTask: PropTypes.object,
  onClickClose: PropTypes.func,
};

export default CreateTask;
