import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import {persistor, store } from './app/store'
import { Provider } from 'react-redux'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import '@fortawesome/fontawesome-free/css/all.min.css';
//import 'bootstrap/dist/css/bootstrap.min.css'
//import '../node_modules/bootstrap-css-only/css/bootstrap.min.css';
//import 'mdbreact/dist/css/mdb.css';
import 'mdb-ui-kit/js/mdb.min.js';
import 'mdb-ui-kit/css/mdb.min.css';
import { PersistGate } from "redux-persist/integration/react";



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
      </PersistGate>
    </Provider>
    
  </React.StrictMode>
);