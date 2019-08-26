import React from 'react';
import Main from './Main';

import '../styles/main.scss';

export default function App(props) {
    return (
        <div className="wrapper">
            <main id="content" className="content">
                <Main/>
            </main>
        </div>
    );
}
