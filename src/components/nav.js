import React from 'react';
import { BaseLink, withRoute } from 'react-router5';

// components
import Header from './header';

// css
import '../styles/header.scss';

function Nav(props) {
    const { router, route } = props;

    return (
        <div> 
          <Header router={router} route={route}></Header>
        </div>        
    );
}


export default withRoute(Nav);


  