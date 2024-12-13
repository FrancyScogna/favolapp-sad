import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: userRole } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated || userRole !== role) {
    return <Navigate to='/' replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.object,
  role: PropTypes.string,
};

export default ProtectedRoute;
