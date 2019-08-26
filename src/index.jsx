import ReactDOM from 'react-dom';
import React from 'react';
import App from './components/app';
import { RouterProvider } from 'react-router5';
import createRouter from './components/router';

const router = createRouter(true);
const app = <RouterProvider router={ router }><App /></RouterProvider>;

router.start(() => {
    ReactDOM.render(
        app,
        document.getElementById('root')
    );
});
