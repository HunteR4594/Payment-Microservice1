import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../context/currentUser';

const RequireAdmin = ({ children }) => {
  const { isAdmin } = useCurrentUser();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;
