import { Navigate, Route, Routes, createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/Router/ProtectedRoute';
import UnauthedRoute from './components/Router/UnauthedRoute';
import Auth from './pages/auth/Auth';
import LoginForm from './pages/auth/components/LoginForm/LoginForm';
import Presentation from './pages/auth/components/LoginForm/components/Presentation/Presentation';
import ChangePasswordForm from './pages/auth/components/ChangePasswordForm/ChangePasswordForm';
import App from './App';
import Profile from './pages/profilepage/Profile';
import Dashboard from './pages/dashboardpage/Dashboard';
import Pazienti from './pages/pazientipage/Pazienti';
import Report from './pages/reportpage/Report';
/*import TaskList from './pages/taskpage/TaskPage';*/
import Users from './pages/userspage/Users';
import Paziente from './pages/pazientepage/Paziente';
import Collegues from './pages/colleguespage/Collegues';
import Activity from './pages/activitypage/Activity';

const router = createBrowserRouter([
  {
    path: '/*',
    element: (
      <UnauthedRoute>
        <Routes>
          <Route path='auth/*' element={<Auth role='tutor' />}>
            <Route index element={<Presentation />} />
            <Route path={'login'} element={<LoginForm />} />
            <Route path={'change-password'} element={<ChangePasswordForm />} />
          </Route>
          <Route path='*' element={<Navigate to='/auth' replace />} />
        </Routes>
      </UnauthedRoute>
    ),
  },
  {
    path: 'admin/*',
    element: (
      <ProtectedRoute role='admin'>
        <Routes>
          <Route
            path='*'
            element={<Navigate to='/admin/dashboard' replace />}
          />
          <Route path='/' element={<App role='admin' />}>
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='profile' element={<Profile />} />
            <Route
              path='profile/:userId'
              element={<Profile type={'other'} />}
            />
            <Route path='users' element={<Users />} />
            <Route path='collegues' element={<Collegues />} />
            <Route path='reportlist' element={<Report />} />
            {/*<Route path='tasklist' element={<TaskList />} />*/}
            <Route
              path='reportlist/:userId'
              element={<Report type={'other'} />}
            />
            <Route path='pazienti' element={<Pazienti />} />
            <Route
              path='pazienti/:userId'
              element={<Pazienti type={'other'} />}
            />
            <Route path='paziente/:pazienteId' element={<Paziente />} />
            <Route path='activity' element={<Activity />} />
          </Route>
        </Routes>
      </ProtectedRoute>
    ),
  },
  {
    path: 'app/*',
    element: (
      <ProtectedRoute role='tutor'>
        <Routes>
          <Route path='*' element={<Navigate to='/app/dashboard' replace />} />
          <Route path='/' element={<App role='tutor' />}>
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='profile' element={<Profile />} />
            <Route
              path='profile/:userId'
              element={<Profile type={'other'} />}
            />
            <Route path='collegues' element={<Collegues />} />
            <Route path='reportlist' element={<Report />} />
            {/*<Route path='tasklist' element={<TaskList />} />*/}
            <Route
              path='reportlist/:userId'
              element={<Report type={'other'} />}
            />
            <Route path='pazienti' element={<Pazienti />} />
            <Route
              path='pazienti/:userId'
              element={<Pazienti type={'other'} />}
            />
            <Route path='paziente/:pazienteId' element={<Paziente />} />
          </Route>
        </Routes>
      </ProtectedRoute>
    ),
  },
]);

export default router;
