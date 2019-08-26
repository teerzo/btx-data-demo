import React from 'react';
import { Link, withRoute } from 'react-router5';
import {Button, Glyphicon} from 'react-bootstrap';

import { FaBars } from 'react-icons/fa';




// import { Link } from 'react-router-dom'
// import { HashLink as Link } from 'react-router-hash-link';

// css 
import '../styles/header/desktop.scss';
import '../styles/header/mobile.scss';

// images
import btxLogoImg from '../images/btx-logo-colour.png';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.hideHamburger = this.hideHamburger.bind(this);
    this.toggleHamburger = this.toggleHamburger.bind(this);
    this.state = {
      active: false
    }
  }
  hideHamburger() {
    this.setState({active:false});
  }
  toggleHamburger() {
    // console.log('toggle');
    const state = !this.state.active
    this.setState({active:state});
  }
  
  goTo(route) {
    this.props.history.replace(`/${route}`)
  }

  render() {
    // console.log(this.props);
    return(
      
      <div className="component-header">       
        <div className="flex-title"> 
          <div className="title"> 
            <img src={btxLogoImg} />
            {/*<h1> BTX </h1> */}
            {/*<h2> DATA </h2>*/}
          </div>
        </div>
        <div className="flex-links"> 
          <div className="login"> 
            <p className="text"> Welcome: </p>
            <p className="user"> Matt Martin </p>
          </div>
            
          <div className="navigation"> 
            <Link router={ this.props.router } routeName='anatomy' className={ this.props.route.name === 'anatomy' ? 'link active' : 'link'}> Anatomy </Link>
            <a className="link"> Assessments </a>
            <a className="link"> Scores </a>


            {/* <Link router={ this.props.router } routeName='assessments' className={ this.props.route.name === 'assessments' ? 'link active' : 'link'}> Assessments </Link> */}
            {/* <Link router={ this.props.router } routeName='scores' className={ this.props.route.name === 'scores' ? 'link active' : 'link'}> Scores </Link> */}
          </div>
            
          
        </div>


        <div className="logo"> 
          <Link router={ this.props.router } routeName='home' className="title"> BTX <span className="small"> DATA </span> </Link>
        </div>
        
        
        <div className="links">
          <Link router={ this.props.router } routeName='anatomy' className={ this.props.route.name === 'anatomy' ? 'link active' : 'link'}> Anatomy </Link>
          <Link router={ this.props.router } routeName='assessments' className="link"> Assessments </Link>
          <Link router={ this.props.router } routeName='scores' className="link"> Scores </Link>
        </div>
        <div className="login"> 
          <p> Welcome: Matt Martin </p>
        </div>
        <div className="header-mobile">
          <div className="link-hamburger" onClick={this.toggleHamburger}>
            {/* <Glyphicon glyph="menu-hamburger"></Glyphicon> */}
          </div>
        </div>
        <div className={this.state.active ? 'popout active': 'popout'}> 
          <div className="panel"> 
            <div className="close" onClick={this.toggleHamburger}>
              {/* <Glyphicon glyph="remove"></Glyphicon> */}
            </div>
            <div className="divider"> </div>
            <Link router={ this.props.router } routeName='home' className="link"> home </Link>
            <Link router={ this.props.router } routeName='anatomy' className="link"> Anatomy </Link>
            <Link router={ this.props.router } routeName='assessments' className="link"> Assessments </Link>
            <Link router={ this.props.router } routeName='scores' className="link"> Scores </Link>
            <div className="divider"> </div>
            <div className="user"> 
              <p> Welcome: <br /> Matt Martin </p>              
            </div>
          </div>    
        </div>
      </div> 
      
    )
  }
}