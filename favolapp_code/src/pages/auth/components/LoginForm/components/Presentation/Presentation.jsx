import { Button, Tooltip, Typography } from '@mui/material';
import './Presentation.css';
import { useNavigate } from 'react-router-dom';
import AboutSwiper from './components/AboutSwiper/AboutSwiper';

function Presentation() {
  const navigate = useNavigate();

  return (
    <div className='presentation-container'>
      <div className='outer-container'>
        <div className='description'>
          <Typography className='text'>
            {'FavolApp è la soluzione innovativa per monitorare e migliorare il ' +
              'percorso terapeutico dei pazienti con autismo e disturbi del ' +
              'comportamento e dell’apprendimento. Attraverso strumenti interattivi ' +
              'e report dettagliati, consente ai tutor di creare percorsi ' +
              'personalizzati e ai supervisori di tenere traccia dei progressi in ' +
              'tempo reale. FavolApp facilita la comunicazione e la collaborazione ' +
              'all’interno dell’organizzazione, promuovendo un approccio integrato ' +
              'e centrato sulla persona.'}
          </Typography>
        </div>
      </div>
      <div className='authbuttons-container'>
        <Typography className='title'>Accedi al servizio</Typography>
        <div className='buttons'>
          <Tooltip title='Accedi al servizio'>
            <Button
              onClick={() => navigate('login')}
              color='secondary'
              variant='contained'
              className='button'
            >
              Accedi
            </Button>
          </Tooltip>
        </div>
      </div>
      <AboutSwiper nSlidesDesktop={3} nSlidesMobile={3} />
    </div>
  );
}

export default Presentation;
