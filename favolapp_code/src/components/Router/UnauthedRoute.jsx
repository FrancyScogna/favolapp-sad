import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function UnauthedRoute({ children }) {
  const { isAuthenticated, role: userRole } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated) {
    return children;
  } else {
    if (userRole === 'admin') {
      return <Navigate to='/admin' replace />;
    }
    if (userRole === 'tutor') {
      return <Navigate to='/app' replace />;
    }
    return children;
  }
}

UnauthedRoute.propTypes = {
  children: PropTypes.object,
};

export default UnauthedRoute;
