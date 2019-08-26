

'use strict';

// Libs
import React from 'react';

// css
import '../../styles/shared/anatomyOptions.scss';




export default class AnatomyOptions extends React.Component {
    constructor(props) {
        super(props);
        this.initialize = this.initialize.bind(this);
        this.update = this.update.bind(this);
        this.updateMuscles = this.updateMuscles.bind(this);
        this.updateDom = this.updateDom.bind(this);

        this.triggerUpdate = function(tabData) {
            // console.log('child trigger');
            if (typeof this.props.triggerUpdate === 'function') {
                this.props.triggerUpdate(tabData);
            }
        }.bind(this)

        this.onPhysicianChange = function(e) {
            // console.log('child trigger');
            if (typeof this.props.onPhysicianSelectChange === 'function') {

                let domDataSelect = document.getElementById('data-select');
                domDataSelect ? domDataSelect.value = '' : null;

                let domConditionSelect = document.getElementById('condition-select');
                domConditionSelect ? domConditionSelect.value = '' : null;

                let domMuscleSelect = document.getElementById('muscle-select');
                domMuscleSelect ? domMuscleSelect.value = '' : null;
                
                let domVisualSelect = document.getElementById('visual-select');
                domVisualSelect ? domVisualSelect.value = '' : null;

                this.props.onPhysicianSelectChange(e.target.value);
            }
        }.bind(this)
        this.onDataChange = function(e) {
            // console.log('child trigger');
            if (typeof this.props.onDataSelectChange === 'function') {

                let domConditionSelect = document.getElementById('condition-select');
                domConditionSelect ? domConditionSelect.value = '' : null;

                let domMuscleSelect = document.getElementById('muscle-select');
                domMuscleSelect ? domMuscleSelect.value = '' : null;
                
                let domVisualSelect = document.getElementById('visual-select');
                domVisualSelect ? domVisualSelect.value = '' : null;


                this.props.onDataSelectChange(e.target.value);
            }
        }.bind(this)
        this.onConditionChange = function(e) {
            // console.log('child trigger');
            if (typeof this.props.onConditionSelectChange === 'function') {

                let value = e.target.value;
                let text = '';

                for( let i = 0; i < e.target.children.length; i++) {
                    if( e.target.children[i].value === value ) {
                        text = e.target.children[i].text;
                    }
                }



                let domMuscleSelect = document.getElementById('muscle-select');
                domMuscleSelect ? domMuscleSelect.value = '' : null;
                
                let domVisualSelect = document.getElementById('visual-select');
                domVisualSelect ? domVisualSelect.value = '' : null;

                this.props.onConditionSelectChange(value, text);
            }
        }.bind(this)
        this.onMuscleChange = function(e) {
            // console.log('child trigger');
            if (typeof this.props.onMuscleSelectChange === 'function') {
                this.props.onMuscleSelectChange(e.target.value);
            }
        }.bind(this)
        this.onVisualChange = function(e) {
            // console.log('child trigger');
            if (typeof this.props.onVisualSelectChange === 'function') {
                this.props.onVisualSelectChange(e.target.value);
            }
        }.bind(this)
        this.onDrugChange = function(e) {
            // console.log('child trigger');
            if (typeof this.props.onDrugSelectChange === 'function') {
                this.props.onDrugSelectChange(e.target.value);
            }
        }.bind(this)
        this.onMuscleViewClick = function(e, item) {
            if (typeof this.props.onMuscleViewClick === 'function') {
                this.props.onMuscleViewClick(e, item);
            }
        }.bind(this)
       
        this.state = {
            tabIndex: null,
            tabData: {
                physicianId: null,
                dataId: null,
                conditionId: null,
                muscleId: null,
                visualId: null,
                muscleViewId: null,
            },
           

            dataPhysicians: [],

            mapSelectPhysicians: [],
            mapSelectConditions: [],
            mapSelectMuscles: [],
            mapMuscleViews: [],
        }
    }
    componentWillReceiveProps(newProps) {
        this.setState({
            dataMuscles: newProps.dataMuscles,
            dataPhysicians: newProps.dataPhysicians,
            tabData: newProps.tabData,
            tabIndex: newProps.tabIndex,
            index: newProps.index,
        }, this.update);
    }

    componentDidMount() {
        window.setTimeout(function(){
            this.setState({
                dataMuscles: this.props.dataMuscles,
                dataPhysicians: this.props.dataPhysicians,
                tabData: this.props.tabData,
                tabIndex: this.props.tabIndex,
                index: this.props.index,
            }, this.initialize);
        }.bind(this), 1000); 
    };

    initialize() {
        this.update();
    };

    update() {
        // console.log('update');
        if (this.state.dataPhysicians && this.state.dataPhysicians.length > 0) {

            let physicians = this.state.dataPhysicians;

            let mapSelectPhysicians = physicians.map(function (item, key) {
                return (<option key={key} value={item.physicianId}> {item.physicianName} </option>)
            }.bind(this));

            this.setState({
                mapSelectPhysicians: mapSelectPhysicians,
            }, this.updateMuscles);
        }
    }
    updateMuscles() {
        // console.log('anatomyOptions.updateMuscles');

        const tabData = this.state.tabData;
        const physicians = this.state.dataPhysicians;



        if( this.state.dataMuscles && this.state.dataMuscles.length > 0 ) {

            let dataMuscles = this.state.dataMuscles;
            let filtered = [];
            for (let bm = 0; bm < dataMuscles.length; bm++) {
                dataMuscles[bm].injectionCount = 0;

                for (let m = 0; m < dataMuscles[bm].muscles.length; m++) {
                    if( physicians ) {
                        for( let p = 0; p < physicians.length; p++ ) {
                            if( tabData.physicianId === physicians[p].physicianId ) {
                                if( physicians[p].injections && physicians[p].injections.length > 0 ) {
                                    for( let i = 0; i < physicians[p].injections.length; i++ ) {
                                        if( dataMuscles[bm].muscles[m].muscleId === physicians[p].injections[i].muscleId ) {
                                            dataMuscles[bm].injectionCount += 1;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // if( dataMuscles[bm].muscles[m].injectionCount > 0 ) {
                    //     dataMuscles[bm].injectionCount += dataMuscles[bm].muscles[m].injectionCount;
                       
                    // }
                }
                
                if( dataMuscles[bm].injectionCount > 0 ) {
                    filtered.push(this.state.dataMuscles[bm]);
                }   
            }

            var mapSelectMuscles = filtered.map(function (item, key) {
                return (<option key={key} value={item.id} > {item.muscleName} {item.muscleId} {item.id} </option>)
            });


            // var mapMuscleViews = this.state.dataMuscles.map(function (item, key) {
            //     return (<option key={key} value={item.id} > {item.muscleName} {item.injectionCount} </option>)
            // });

            var mapMuscleViews = [];
            for( let bm = 0; bm < this.state.dataMuscles.length; bm++ ) {
                const baseMuscle = this.state.dataMuscles[bm];

                if( this.state.tabData.muscleId !== '' && this.state.tabData.muscleId === baseMuscle.id ) {
                    if( baseMuscle.muscles && baseMuscle.muscles.length > 0 ) {
                        const firstMuscle = baseMuscle.muscles[0];
                        // if( )
                        
                        firstMuscle.extraViews = [];
                        let concatViews = [];
                        if( firstMuscle.injectionCount > 0 ) {
                            concatViews.push(firstMuscle);
                        }   
                        

                        for( let m = 1; m < baseMuscle.muscles.length; m++ ) {
                            const secondMuscle = baseMuscle.muscles[m];
                            concatViews.push(secondMuscle);

                            // if( firstMuscle.muscleType === secondMuscle.muscleType ) {
                            //     if( firstMuscle.injectionCount > 0 ) {
                            //         concatViews[0].extraViews.push(secondMuscle);
                            //     }
                            //     else if( secondMuscle.injectionCount > 0 ) {
                            //         concatViews.push(secondMuscle);  
                            //     }
                                
                            // }
                            // else {
                            //     if( secondMuscle.injectionCount > 0 ) {
                            //         concatViews.push(secondMuscle);
                            //     }
                            // }

                        }
                        mapMuscleViews = mapMuscleViews.concat(concatViews);
                    }
                }                
            }

            // for (let m = 0; m < this.state.dataMuscles[i].muscles.length; m++) {
            //     if (this.state.dataMuscles[i].muscles[m].muscleId === this.state.tabData.muscleViewId) {
            //         const firstMuscle = this.state.dataMuscles[i].muscles[m];

            //         imgBg = firstMuscle.muscleImgBg;
            //         imgOver = firstMuscle.muscleImgOverlay;

            //         imgs.push(imgOver);
            //         if (firstMuscle.muscleType === 'anterior-superficial') {
            //             for (let mm = 0; mm < this.state.dataMuscles[i].muscles.length; mm++) {
            //                 const secondMuscle = this.state.dataMuscles[i].muscles[mm];
            //                 if (firstMuscle.muscleId !== secondMuscle.muscleId) {
            //                     if (firstMuscle.muscleType === secondMuscle.muscleType) {
            //                         imgs.push(secondMuscle.muscleImgOverlay);
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }

            /////////////////////////////////////////////////
     
            // for (let i = 0; i < this.state.dataMuscles.length; i++) {
            //     // console.log(tab.muscleId, typeof tab.muscleId, this.state.dataMuscles[i].id, typeof this.state.dataMuscles[i].id);
            //     if (this.state.tabData.muscleId !== '' && this.state.tabData.muscleId === this.state.dataMuscles[i].id) {
            //         if( this.state.dataMuscles[i].muscles && this.state.dataMuscles[i].muscles.length > 0 ) {
            //             console.log('muscle', this.state.dataMuscles[i].muscles[0] );
            //             const firstMuscle = this.state.dataMuscles[i].muscles[0];

            //             imgBg = firstMuscle.muscleImgBg;
            //             imgOver = firstMuscle.muscleImgOverlay;

            //             imgs.push(imgOver);
            //             if( firstMuscle.muscleType === 'anterior-superficial' ) {
            //                 for( let m = 1; m < this.state.dataMuscles[i].muscles.length; m++ ) {
            //                     const secondMuscle = this.state.dataMuscles[i].muscles[m];
            //                     if( firstMuscle.muscleType === secondMuscle.muscleType ) {
            //                         imgs.push(secondMuscle.muscleImgOverlay);
            //                     }
            //                 }
            //             }
            //         }

            //         // for( let m = 0; m < this.state.dataMuscles[i].muscles.length; m++ ) {
            //         //     muscleIds += this.state.dataMuscles[i].muscles[m].muscleId;
            //         // }
            //         // console.log('muscle', tab.muscleId, this.state.dataMuscles[i]);
            //     }
            // }

            /////////////////////////////////////////////////
            
            // // console.log('process id ', this.state.currentMuscleId);
            // var newMuscleViews = this.state.domDataMuscles[this.state.currentMuscleId].muscles;
            // // console.log()
            // var mapMuscleViews = [];
            // for (var i = 0; i < this.state.domDataMuscles[this.state.currentMuscleId].muscles.length; i++) {
            //     if (this.state.domDataMuscles[this.state.currentMuscleId].muscles[i].injectionCount !== 0) {
            //         mapMuscleViews.push(this.state.domDataMuscles[this.state.currentMuscleId].muscles[i]);
            //     }
            // }

            // if( this.state.currentViewId === null ) {
            //     console.log(mapMuscleViews[0].muscleId);
            //     this.setState({currentViewId: mapMuscleViews[0].muscleId});
            // }

            mapMuscleViews = mapMuscleViews.map(function (item, key) {
                var onClick = function (event) {
                    console.log('muscle view click');
                    this.onMuscleViewClick(event, item);
                }.bind(this);
                return (
                    // <div key={key} onClick={onClick} className={that.state. === item.muscleId ? 'view active' : 'view'}>
                    //     <div className="inner">

                    //         {/*<img src={item.muscleImgBg} className="img" style={ { backgroundImage: `url("images/img.svg")` } } />*/}
                    //         <img src={item.muscleImgOverlay} className="img" style={{ backgroundImage: 'url(' + item.muscleImgBg + ')' }} />
                    //         {/*{item.muscleId} - {item.injectionCount}*/}
                    //     </div>
                    // </div>
                    <div key={key} onClick={onClick} className={ this.state.tabData.muscleViewId === item.muscleId ? 'view active' : 'view' }>
                        <div className="inner">
                            <img src={item.muscleImgOverlay} className="img" style={{ backgroundImage: 'url(' + item.muscleImgBg + ')' }} />
                        </div>
                    </div>
                )
            }.bind(this));








            this.setState({
                mapSelectMuscles: mapSelectMuscles,
                mapMuscleViews: mapMuscleViews,
            }, this.updateDom);
        }

        // for( let p = 0; p < physicians.length; p++ ) {
        //     if( physicians[p].physicianId === temp.physicianId ) {
        //         for( let c = 0; c < physicians[p].conditions.length; c++ ) {
        //             if( physicians[p].conditions[c].condition_id === temp.conditionId ) {
        //                 for( let pa = 0; pa < physicians[p].conditions[c].patients.length; pa++ ) {
        //                     if( Number(physicians[p].conditions[c].patients[pa].patient_id) === Number(temp.patientId) ) {
        //                         if( temp.sessions && temp.sessions > 0 ) {
        //                             physicians[p].conditions[c].patients[pa].sessions = temp.sessions;
        //                         }
        //                         else {
        //                             physicians[p].conditions[c].patients[pa].sessions = null;
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

    }

    updateDom() {   

        if( this.state.tabData.dataId !== '' ) {
            let domDataSelect = document.getElementById('data-select');
            domDataSelect.value = this.state.tabData.dataId;
        }
        if( this.state.tabData.conditionId !== '' ) {
            let domConditionSelect = document.getElementById('condition-select');
            domConditionSelect.value = this.state.tabData.conditionId;
        }
        if( this.state.tabData.muscleId !== '' ) {
            let domMuscleSelect = document.getElementById('muscle-select');
            domMuscleSelect.value = this.state.tabData.muscleId;
        }
        if( this.state.tabData.visualId !== '' ) {
            let domVisualSelect = document.getElementById('visual-select');
            domVisualSelect.value = this.state.tabData.visualId;
        }

    }



    render() {
        return (
            <div className="component-anatomy-options">
                <div className={ this.state.dataPhysicians.length > 0 ? "option-group active" : "option-group" }>
                    <div className="title">
                        <p> Physician selection </p>
                    </div>
                    <div className="option-selector">
                        <select className="select" onChange={this.onPhysicianChange} value={this.state.tabData.physicianId ? this.state.tabData.physicianId: ''}>
                            <option value="" disabled={true}> Please select.. </option>
                            {this.state.mapSelectPhysicians}
                        </select>
                    </div>
                </div>
                <div className={ this.state.tabData.physicianId ? "option-group active" : "option-group" }>
                    <div className="title">
                        <p> Data selection </p>
                    </div>
                    <div className="option-selector">
                        <select id="data-select" className="select" onChange={this.onDataChange} value={this.state.tabData.dataId ? this.state.tabData.dataId: ''}>
                            <option value="" disabled={true}> Please select.. </option>
                            <option value="1"> My data </option>
                            <option value="2"> All data </option>
                            <option value="3"> All data (excluding mine) </option>
                        </select>
                    </div>
                </div>
                <div className={ this.state.tabData.dataId !== '' ? "option-group active" : "option-group" }>
                    <div className="title">
                        <p> Condition </p>
                    </div>
                    <div className="option-selector">
                        <select id="condition-select" className="select" onChange={this.onConditionChange} defaultValue={''}>
                            <option value="" disabled={true}> Please select.. </option>
                            {/* {this.state.mapSelectConditions} */}

                            <option value="2"> Hemifacial spasm </option>
                            <option value="1" disabled={false}> Belphrospasm </option>
                            <option value="3" disabled={false}> Cervical Dystonia </option>
                            <option value="4" disabled={false}> Chronic Migraine </option>

                            <option value="0" disabled={true}> Anterocollis </option>
                            <option value="0" disabled={true}> Laterolcollis </option>
                            <option value="0" disabled={true}> Retrocollis </option>
                            <option value="0" disabled={true}> Torocollis </option>
                            <option value="5" disabled={false}> Other </option>

                        </select>
                    </div>
                </div>
                <div className={ this.state.tabData.conditionId !== '' ? "option-group active" : "option-group" }>
                    <div className="title">
                        <p> Muscle </p>
                    </div>
                    <div className="option-selector">
                        <select id="muscle-select" className="select" onChange={this.onMuscleChange} defaultValue={''}>
                            <option value="" disabled={true}> Please select.. </option>
                            {this.state.mapSelectMuscles}
                        </select>
                    </div>
                </div>
                <div className={ this.state.tabData.muscleId !== '' ? "option-group active" : "option-group" }>
                    <div className="title">
                        <p> Data visualization </p>
                    </div>
                    <div className="option-selector">
                        <select id="visual-select" className="select" onChange={this.onVisualChange} defaultValue={''}>
                            <option value="" disabled={true}> Please select.. </option>
                            <option value="1"> Injection frequency </option>
                            <option value="2"> Average dose per site </option>
                            <option value="3"> Dosage range </option>
                        </select>
                    </div>
                </div>
                <div className={ this.state.tabData.visualId === 2 || this.state.tabData.visualId === 3? "option-group active" : "option-group hidden" }>
                    <div className="title">
                        <p> Drug selection </p>
                    </div>
                    <div className="option-selector">
                        <select id="drug-select" className="select" onChange={this.onDrugChange} defaultValue={''}>
                            <option value="" disabled={true}> Please select.. </option>
                            <option value="1"> Botox  </option>
                            <option value="2"> Dysport </option>
                        </select>
                    </div>
                </div>
                <div className={ this.state.tabData.visualId !== '' ? "option-group active" : "option-group" }>
                    <div className="title">
                        <p> Additional Views </p>
                    </div>
                    <div className="views">
                        {this.state.mapMuscleViews}
                    </div>
                </div>
            </div>
        )
    }
}

