import React from 'react';
import { Navigate } from 'react-router';
import useAuth from '../hooks/useAuth';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0E17',
        color: '#A855F7',
        fontFamily: 'Inter, sans-serif'
      }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;