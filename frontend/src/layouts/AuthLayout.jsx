import React from 'react';
import { Outlet } from 'react-router-dom';

// Auth pages manage their own full-page layout (dark Three.js split design)
export default function AuthLayout() {
  return <Outlet />;
}
