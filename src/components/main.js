import React, { createElement } from 'react';
import { routeNode } from 'react-router5';

// Routes
import Home from './routes/home';

import Login from './routes/login';



import Anatomy from './routes/anatomy';
import Assessments from './routes/assessments';
import Scores from './routes/scores';

const components = {
    'home': Home,
    'login': Login,
    'anatomy': Anatomy,
    'assessments': Assessments,
    'scores': Scores,

    // Old 
    // 'twinks': Twinks,
    // 'twinksCharacterList': TwinksCharacterList,
};



function Main(props) {
    console.log(props);
    const { route } = props;
    const segment = route.name.split('.')[0];

    return createElement(components[segment] || NotFound);
}

export default routeNode('')(Main);
