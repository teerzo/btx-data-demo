import createRouter from 'router5'

import loggerPlugin from 'router5-plugin-logger';
import browserPlugin from 'router5-plugin-browser'
import listenersPlugin from 'router5-plugin-listeners'


import transitionPath from 'router5-transition-path';

export default function configureRouter(useListenersPlugin = false) {
    
    const routes = [

        { name: 'home',           path: '/' },
        { name: 'login', path: '/login' },
        
        // local
        { name: 'anatomy',       path: '/anatomy' },
        // { name: 'twinksCharacterList',       path: '/twinks/characterlist' },
        // { name: 'article', path: '/articles/:id' },
        { name: 'assessments',       path: '/assessments' },
        { name: 'scores',       path: '/scores' },
        // { name: 'project', path: '/projects/:id' },
    ]

    // const router = createRouter(routes);

    const router = createRouter(routes, {
        defaultRoute: ''
    });

    router.usePlugin(loggerPlugin);
    router.usePlugin(listenersPlugin())


    router.usePlugin(
        browserPlugin({
            useHash: true
        })
    )
        // Plugins
        // .usePlugin(loggerPlugin)
        // .usePlugin(browserPlugin({
        //     useHash: true
        // }));

    // if (useListenersPlugin) {
    //     router.usePlugin(listenersPlugin());
    // }

    router.addRouteListener( 'home', ( toState, fromState ) => { 
        // console.log('home transition') 
    });

    return router;
}