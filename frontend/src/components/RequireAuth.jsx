import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasAuthSession } from '../lib/authSession';

export default function RequireAuth() {
  if (!hasAuthSession()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}