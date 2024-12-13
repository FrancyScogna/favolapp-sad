import ReactDOM from 'react-dom/client';
import './main.css';
import { Provider } from 'react-redux';
import store from './configurations/store.js';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { Amplify } from 'aws-amplify';
import { config } from './configurations/amplify.js';
import SnackbarGlobal from './components/common/SnackbarGlobal';
import AuthedUserProvider from './components/common/AuthedUserProvider/AuthedUserProvider.jsx';

Amplify.configure(config);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthedUserProvider>
      <RouterProvider router={router} />
      <SnackbarGlobal />
    </AuthedUserProvider>
  </Provider>
);
