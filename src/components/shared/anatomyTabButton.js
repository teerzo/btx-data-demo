
'use strict';

// Libs
import React from 'react';

// css
import '../../styles/shared/anatomyTabButton.scss';

export default class AnatomyButtonTab extends React.Component {
    constructor(props) {
        super(props);
        this.initialize = this.initialize.bind(this);
      
        this.selectTab = function(e) {
            console.log('child trigger');
            if (typeof this.props.selectTab === 'function') {
                this.props.selectTab(e.target.value);
            }
        }.bind(this)
        this.closeTab = function(e) {
            console.log('child trigger');
            if (typeof this.props.closeTab === 'function') {
                this.props.closeTab(e.target.value);
            }
        }.bind(this)
    
        this.state = {
           
        }
    }

    componentDidMount() {
        let that = this;
        this.initialize();
    };

    initialize() {
    
    }
    
    render() {
        return (
            <div className="component-anatomy-button-tab">
                <div className={ this.props.tabIndex === this.props.index ? "tab active" : "tab"}> 
                    <div className="tab-name" onClick={this.selectTab}> 
                        {this.props.tabData.tabName}
                    </div>
                    <div className="tab-close" onClick={this.closeTab}> 
                        X
                    </div>
                </div>
            </div>
        )
    }
}