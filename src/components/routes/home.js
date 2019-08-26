
import React from 'react';
import { routeNode } from 'react-router5';

// components
import Nav from '../nav';
// css
import '../../styles/home/desktop.scss';
import '../../styles/home/mobile.scss';

// import DataAbout from '../../data/about';

function Home(props) {
    const { router, route, contentHeight } = props;

    let loadPage = function( url ) {
        console.log('load page', url);
        props.router.navigate(url);
    } 

    window.setTimeout(function() {
        loadPage('anatomy');
    }, 1000);

    

    return (
        <div className="route-home"> 
            <aside >
                <Nav />
            </aside>
            <div className="route-content"> 
                <h1> Home </h1>
            </div>
        </div>
    );
}

export default routeNode('home')(Home);
