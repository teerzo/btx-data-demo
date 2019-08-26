
import React from 'react';
import { routeNode, BaseLink, withRoute } from 'react-router5';
// components
import Nav from '../nav';
// css
import '../../styles/login.scss';
//images
import bgLoginImg from '../../images/bg-login.png';
import btxLogoImg from '../../images/btx-logo.png';

function Login(props) {
    const { router, route, contentHeight } = props;

    let loadPage = function( url ) {
        console.log('load page', url);
        props.router.navigate(url);
    } 

    let bgLogin = {
        backgroundImage: `url(${bgLoginImg})`
    };

    return (
        <div className="route-login"> 
            <aside >
                {
                    props.route.name !== 'login' ? 
                    <Nav />
                    :
                    <div> </div>
                }
                
                
            </aside>
            <div className="route-content"> 
                <div className="route-bg"> </div>
                <div className="route-bg-image" style={ bgLogin }> </div>

                <div className="route-content-inner"> 
                    <div className="title"> 
                        <img src={btxLogoImg} />
                        {/*<h1> BTX </h1> 
                        <h2> DATA </h2> */}

                    </div>
                    <div className="form"> 
                        <div className="field"> 
                            <label> Username: </label>
                            <input className="" /> 
                        </div>
                        <div className="field"> 
                            <label> Password: </label>
                            <input className="" /> 
                        </div>
                        <div className="field-login"> 
                            {/*<button id="login" onClick={loadPage('anatomy')}> Login </button>*/}

                            <button> <BaseLink router={ props.router } routeName='anatomy'> Login </BaseLink> </button>

                        </div>
                    </div>
                    <div className="disclaimer"> 
                        <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor <br/>
                            incididunt ut labore et dolore aliqua. Ut enim ad minim veniam, quis nostrud <br/>
                            exercitation ullamco laboris nisi ut aliquip.
                        </p>
                    </div>
                </div>

                
                
            </div>        
        </div>
    );
}

export default routeNode('login')(Login);
