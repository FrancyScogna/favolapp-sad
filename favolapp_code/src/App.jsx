import { Outlet } from 'react-router-dom';
import Navigation from './components/common/Navigation/Navigation';
import './App.css';
import { useSelector } from 'react-redux';

function App() {
  const { role } = useSelector((state) => state.auth);
  return (
    <>
      <Navigation role={role} />
      <div className='page-container'>
        <div className='inner-container'>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default App;
