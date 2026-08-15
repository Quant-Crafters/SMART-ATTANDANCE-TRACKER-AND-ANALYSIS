import React from 'react';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    // We are giving control back to the router instead of hardcoding the Dashboard
    <AppRoutes />
  );
}

export default App;