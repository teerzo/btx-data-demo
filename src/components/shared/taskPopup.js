

'use strict';

// Libs
import React from 'react';

// css
import '../../styles/shared/taskPopup.scss';




export default class TaskPopup extends React.Component {
    constructor(props) {
        super(props);
        this.initialize = this.initialize.bind(this);
        this.update = this.update.bind(this);

        this.taskCloseClick = this.taskCloseClick.bind(this);
        

        // this.triggerUpdate = function (tabData) {
        //     // console.log('child trigger');
        //     if (typeof this.props.triggerUpdate === 'function') {
        //         this.props.triggerUpdate(tabData);
        //     }
        // }.bind(this)

        // this.onPhysicianChange = function (e) {
        //     // console.log('child trigger');
        //     if (typeof this.props.onPhysicianSelectChange === 'function') {
        //         this.props.onPhysicianSelectChange(e.target.value);
        //     }
        // }.bind(this)

       

        this.state = {
            active: false,
            type: '',
            task: '',
            message: '',
        }
    }
    componentWillReceiveProps(newProps) {
        this.setState({
            type: newProps.type,
            task: newProps.task,
            message: newProps.message,
        }, this.update);
    }

    componentDidMount() {
        window.setTimeout(function () {
            this.setState({
                type: this.props.type,
                task: this.props.task,
                message: this.props.message,
            }, this.initialize);
        }.bind(this), 1000);
    };

    initialize() {
        this.update();
    };

    update() {
        // console.log('update');
        if( this.state.type !== '' && this.state.task !== '' &&  this.state.message !== '' ) {
            this.setState({
                active: true
            });
        }
        else {
            this.setState({
                active: false
            });
        }
    }   

    taskCloseClick() {
        console.log('taskCloseClick');
    }

    render() {
        return (
            <div className={ this.state.active ? "component-task-popup active" : "component-task-popup inactive"}>
                <div className="">
                    <p className="task"> {this.state.task} </p> 
                    <p className="message"> {this.state.message} </p> 
                </div> 
            </div>
        )
    }
}

