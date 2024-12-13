import './Auth.css';
import LogoMotto from '/images/Logo_Motto.png';
import { Outlet, useNavigate } from 'react-router-dom';

function Auth() {
  const navigate = useNavigate();

  return (
    <div className='authpage-container'>
      <div className='logo-container'>
        <img src={LogoMotto} alt='Logo' onClick={() => navigate('/')} />
      </div>
      <Outlet />
    </div>
  );
}

export default Auth;
