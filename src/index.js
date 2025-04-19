import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// We don't need to import style.css here anymore, index.html in public includes it

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
