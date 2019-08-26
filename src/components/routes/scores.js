
import React from 'react';
import { routeNode } from 'react-router5';

import '../../styles/scores.scss';

// import DataAbout from '../../data/about';

function Scores(props) {
    const { router, route, contentHeight } = props;

    let loadPage = function( url ) {
        console.log('load page', url);
        props.router.navigate(url);
    } 

    return (
        <div className="route-scores"> 
           <h1> Scores </h1>
            <div className="list"> 
                {/*{twinkList}*/}
            </div>
        </div>
    );
}

export default routeNode('scores')(Scores);
