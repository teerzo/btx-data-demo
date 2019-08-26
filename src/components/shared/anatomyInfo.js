

'use strict';

// Libs
import React from 'react';

// css
import '../../styles/shared/anatomyInfo.scss';




export default class AnatomyInfo extends React.Component {
    constructor(props) {
        super(props);
        this.initialize = this.initialize.bind(this);
        this.update = this.update.bind(this);
        this.updateMuscleMeta = this.updateMuscleMeta.bind(this);
        this.updatePatientMeta = this.updatePatientMeta.bind(this);

        this.patientInfoClick = this.patientInfoClick.bind(this);
        this.muscleInfoClick = this.muscleInfoClick.bind(this);

        this.triggerUpdate = function (tabData) {
            // console.log('child trigger');
            if (typeof this.props.triggerUpdate === 'function') {
                this.props.triggerUpdate(tabData);
            }
        }.bind(this)

        this.onPhysicianChange = function (e) {
            // console.log('child trigger');
            if (typeof this.props.onPhysicianSelectChange === 'function') {
                this.props.onPhysicianSelectChange(e.target.value);
            }
        }.bind(this)

        this.onDataChange = function (e) {
            // console.log('child trigger');
            if (typeof this.props.onDataSelectChange === 'function') {
                console.log('1');
                this.props.onDataSelectChange(e.target.value);
            }
        }.bind(this)

        this.onConditionChange = function (e) {
            // console.log('child trigger');
            if (typeof this.props.onConditionSelectChange === 'function') {
                this.props.onConditionSelectChange(e.target.value);
            }
        }.bind(this)

        this.onMuscleChange = function (e) {
            // console.log('child trigger');
            if (typeof this.props.onMuscleSelectChange === 'function') {
                this.props.onMuscleSelectChange(e.target.value);
            }
        }.bind(this)

        this.onVisualChange = function (e) {
            // console.log('child trigger');
            if (typeof this.props.onVisualSelectChange === 'function') {
                this.props.onVisualSelectChange(e.target.value);
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

                info: {
                    title: null,
                }
            },

            infoIndex: 1,


            dataInfo: {
                muscleName: '',
                numOfSites: '...',
                numOfPatients: '...',
                numOfSessions: '...',
                avgNumOfSitesPerSession: '...',
                maxNumOfSitesInSession: '...',
                avgDoseBotox: '...',
                minDoseBotox: 0,
                maxDoseBotox: 0,
                avgDoseDysport: '...',
                minDoseDysport: 0,
                maxDoseDysport: 0,
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
        window.setTimeout(function () {
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
        let tab = this.state.tabData;

        // console.log(tab);
        ;

        tab = this.updateMuscleMeta(tab);
        tab = this.updatePatientMeta(tab);

        this.setState({ tabData: tab });
    }

    updateMuscleMeta(tab) {
        let meta = {};

        // if( this.state.dataPhysicians && this.state.dataPhysicians.length > 0 ) {
        //     console.log(this.state.dataPhysicians);
        //     ;
        // }

        for (let bm = 0; bm < this.state.dataMuscles.length; bm++) {
            const baseMuscle = this.state.dataMuscles[bm];

           
            // console.log('$$$ 1', tab.muscleId, baseMuscle.id);
            if (tab.muscleId === baseMuscle.id) {
               
                // console.log()
                tab.info.muscleName = baseMuscle.muscleName;
                meta.muscleName = baseMuscle.muscleName;
                meta.numOfSites = 0;
                meta.numOfPatients = 0;
                meta.numOfSessions = 0;

                meta.avgNumOfSitesPerSession = 0;
                meta.maxNumOfSitesInSession = 0;
                meta.avgDoseBotox = 0;
                meta.minDoseBotox = 0,
                meta.maxDoseBotox = 0,

                meta.totalBotox = 0;

                meta.avgDoseDysport = 0;
                meta.minDoseDysport = null;
                meta.maxDoseDysport = null;

                meta.totalDysport = 0;

                for (let ph = 0; ph < this.state.dataPhysicians.length; ph++) {
                    const physician = this.state.dataPhysicians[ph];
                    if (tab.physicianId === physician.physicianId) {
                        for (let c = 0; c < physician.conditions.length; c++) {
                            const condition = physician.conditions[c];
                            ;

                            

                            if (tab.conditionId === condition.condition_id) {
                                for (let p = 0; p < condition.patients.length; p++) {
                                    const patient = condition.patients[p];

                                    let patientCountAdd = false;

                                    if (patient.sessions) {
                                        for (let s = 0; s < patient.sessions.length; s++) {
                                            const session = patient.sessions[s];

                                            let sessionCountAdd = false;
                                            
                                            
                                            for (let i = 0; i < session.injections.length; i++) {
                                                const injection = session.injections[i];
                                                // console.log(injection);
                                                for (let m = 0; m < baseMuscle.muscles.length; m++) {
                                                    const muscle = baseMuscle.muscles[m];
                                                    console.log(muscle);
                                                    ;

                                                    // if (muscle.muscleId === injection.muscle_image_id) {
                                                    //     // console.log('test');
                                                    //     patientCountAdd = true;
                                                    //     sessionCountAdd = true;

                                                    //     ;
                                                    //     if( injection.injection_medication_id === 1 ) {
                                                    //         meta.avgDoseBotox += injection.injection_site_amount;
                                                    //         meta.totalBotox += 1;

                                                    //         if( meta.minDoseBotox === null || meta.minDoseBotox > injection.injection_site_amount ) {
                                                    //             meta.minDoseBotox = injection.injection_site_amount;
                                                    //         }
                                                    //         if( meta.maxDoseBotox === null || meta.maxDoseBotox < injection.injection_site_amount ) {
                                                    //             meta.maxDoseBotox = injection.injection_site_amount;
                                                    //         }
                                                    //     }
                                                    //     else if( injection.injection_medication_id === 2 ) {
                                                    //         meta.avgDoseDysport += injection.injection_site_amount;
                                                    //         meta.totalDysport += 1;

                                                    //         if( meta.minDoseDysport === null || meta.minDoseDysport > injection.injection_site_amount ) {
                                                    //             meta.minDoseDysport = injection.injection_site_amount;
                                                    //         }
                                                    //         if( meta.maxDoseDysport === null || meta.maxDoseDysport < injection.injection_site_amount ) {
                                                    //             meta.maxDoseDysport = injection.injection_site_amount;
                                                    //         }
                                                    //     }
                                                    // }
                                                }
                                                if( sessionCountAdd ) {
                                                    meta.numOfSessions += 1;
                                                }
                                            }
                                        }
                                    }
                                    if( patientCountAdd ) {
                                        meta.numOfPatients += 1;
                                    }
                                }
                            }
                        }
                    }
                }

                // console.log()
                // console.log(meta.avgDoseBotox, meta.totalBotox);
                // console.log(meta.avgDoseDysport, meta.totalDysport);
                
                meta.avgDoseBotox = (meta.avgDoseBotox / meta.totalBotox).toFixed(1);
                meta.avgDoseDysport = (meta.avgDoseDysport / meta.totalDysport).toFixed(1);

                ;

                if (baseMuscle.id === 18 || baseMuscle.id === '18') {
                    meta.numOfSites = '12';
                }

            }
        }

        tab.muscleMeta = meta;
        return tab;
    }
    updatePatientMeta(tab) {
        let meta = {};

        meta.patientsTotal = 0;
        meta.genderMalePercentage = 0;
        meta.genderFemalePercentage = 0;
        meta.averageAge = 0;
        meta.youngestPatient = 0;
        meta.oldestPatient = 0;
        meta.averageTimeFirstReported = 'Unavailable';

        // let dateMS = Date.now();
        // const today = new Date();
        // let dd = today.getDate();
        // let mm = today.getMonth() + 1; //January is 0!
        // let yyyy = today.getFullYear();
        // if (dd < 10) { dd = '0' + dd; } 
        // if (mm < 10) { mm = '0' + mm; } 
        // let date = yyyy+'-'+mm+'-'+dd;

        // function _calculateAge(birthday) { // birthday is a date
        //     let ageDifMs = Date.now() - birthday.getTime();
        //     let ageDate = new Date(ageDifMs); // miliseconds from epoch
        //     return Math.abs(ageDate.getUTCFullYear() - 1970);
        // }


        for (let ph = 0; ph < this.state.dataPhysicians.length; ph++) {
            const physician = this.state.dataPhysicians[ph];
            if (tab.physicianId === physician.physicianId) {
                for (let c = 0; c < physician.conditions.length; c++) {
                    const condition = physician.conditions[c];

                    if( tab.conditionId === condition.id ) {
                        console.log(condition);
                        ;

                        meta.patientsTotal = condition.totalNumberOfPatients;
                        meta.genderMalePercentage = condition.genderMale;
                        meta.genderFemalePercentage = condition.genderFemale;
                        meta.averageAge = condition.averageAge;
                        meta.youngestPatient = condition.youngestAge;
                        meta.oldestPatient = condition.oldestAge;
                        meta.averageTimeFirstReported = condition.averageTimeFromFirstReportedToTreatment;

                    }


                    // if (tab.conditionId === condition.condition_id) {
                    //     for (let p = 0; p < condition.patients.length; p++) {
                    //         const patient = condition.patients[p];
                    //         // console.log('patient', patient);
                    //         meta.patientsTotal += 1;

                    //         if( patient.gender_code.toLowerCase() === 'm' ) {
                    //             meta.genderMalePercentage += 1;
                    //         }
                    //         if( patient.gender_code.toLowerCase() === 'f' ) {
                    //             meta.genderFemalePercentage += 1;
                    //         }

                    //         let paDate =  new Date(patient.date_of_birth);
                    //         let paDateMS = new Date(patient.date_of_birth).getTime();
                    //         let age = _calculateAge(paDate);

                    //         meta.averageAge += age;

                    //         if( meta.youngestPatient === 0 || age < meta.youngestPatient ) {
                    //             meta.youngestPatient = age;
                    //         }
                    //         if( meta.oldestPatient === 0 || age > meta.oldestPatient ) {
                    //             meta.oldestPatient = age;
                    //         }
                            

                    //         // if( result.young === null || age < result.young ) {
                    //         //     result.young = age;
                    //         // }
                    //         // if( result.old === null || age > result.old ) {
                    //         //     result.old = age;
                    //         // }
                    //         // if( )
                    //     }
                    // }
                }
            }
        }

        // meta.genderMalePercentage = ((meta.genderMalePercentage/meta.patientsTotal) * 100).toFixed(1);
        // meta.genderFemalePercentage = ((meta.genderFemalePercentage/meta.patientsTotal) * 100).toFixed(1);
        // meta.averageAge = (meta.averageAge / meta.patientsTotal).toFixed(1);

        tab.patientMeta = meta;
        return tab;
    }

    patientInfoClick() {
        console.log('patientInfoClick');

        this.setState({
            infoIndex: 2
        })
    }
    muscleInfoClick() {
        console.log('muscleInfoClick');

        this.setState({
            infoIndex: 1
        })
    }

    render() {
        return (
            <div className="component-anatomy-info">
                <div className="title">
                    {
                        this.state.tabData.info.title !== '' ? this.state.tabData.info.title : 'No condition selected'
                    }
                </div>

                <div className="panel-main-top">
                    <div className={this.state.infoIndex === 1 ? 'btn active' : 'btn'} onClick={this.muscleInfoClick}> {this.state.tabData.info.muscleName ? this.state.tabData.info.muscleName : 'No muscle selected'} </div>
                    <div className={this.state.infoIndex === 2 ? 'btn active' : 'btn'} onClick={this.patientInfoClick}> Patient information </div>
                </div>
                {this.state.infoIndex === 1 ? (
                    <div className="panel-main-muscle">
                        <p> Muscle information </p>
                        <div className="muscle-table">
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <td> Muscle Name </td>
                                        <td>
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.muscleName :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Number of Sites </td>
                                        <td>
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.numOfSites :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Number of Patients </td>
                                        <td>
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.numOfPatients :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Number of Sessions </td>
                                        <td>
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.numOfSessions :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Average number of sites per session </td>
                                        <td>
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.avgNumOfSitesPerSession :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Range of number of sites in a single session </td>
                                        <td>


                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.minNumOfSitesInSession :
                                                '-'
                                            }
                                             - 
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.maxNumOfSitesInSession :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> 
                                            Average dose of BOTOX for muscle per session
                                            <br/>
                                            (min)
                                            <br/>
                                            (max)
                                        </td>
                                        <td>
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.avgDoseBotox :
                                                '-'
                                            }
                                            <br/> 
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.minDoseBotox :
                                                '-'
                                            }
                                            <br/> 
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.maxDoseBotox :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> 
                                            Average dose of DYSPORT for muscle per session 
                                            <br/>
                                            (min)
                                            <br/>
                                            (max)
                                        </td>
                                        <td>
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.avgDoseDysport :
                                                '-'
                                            }
                                            <br/>
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.minDoseDysport :
                                                '-'
                                            }
                                            <br/>
                                            {this.state.tabData.muscleMeta ?
                                                this.state.tabData.muscleMeta.maxDoseDysport :
                                                '-'
                                            }

                                            {/* <p> {this.state.tabData.muscleMeta.minDoseDysport} </p>
                                            <p> {this.state.tabData.muscleMeta.maxDoseDysport} </p> */}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>)
                    : (
                        <div > </div>
                    )}
                {this.state.infoIndex === 2 ? (
                    <div className="panel-main-patient">
                        <p> Patient information </p>

                        {this.state.tab}
                        <div className="patient-table">
                            <table className="table table-bordered">
                                <thead className="">
                                    {/*<tr>
                                            <td className="tb-col-0"> Muscle </td>
                                            <td> Average number of injection sites per muscle </td>
                                            <td> Average dose per muscle BOTOX </td>
                                            <td> Average Dose per muscle DYSPORT </td>
                                        </tr>*/}
                                </thead>
                                <tbody className="">
                                    <tr>
                                        <td> Total number of Patients </td>
                                        <td>
                                            {this.state.tabData.patientMeta ?
                                                this.state.tabData.patientMeta.patientsTotal :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Gender Male </td>
                                        <td>
                                            {this.state.tabData.patientMeta ?
                                                this.state.tabData.patientMeta.genderMalePercentage + '%' :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Gender Female </td>
                                        <td>
                                            {this.state.tabData.patientMeta ?
                                                this.state.tabData.patientMeta.genderFemalePercentage + '%' :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Average Age </td>
                                        <td>
                                            {this.state.tabData.patientMeta ?
                                                this.state.tabData.patientMeta.averageAge + ' Years' :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Youngest Patient </td>
                                        <td>
                                            {this.state.tabData.patientMeta ?
                                                this.state.tabData.patientMeta.youngestPatient + ' Years' :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Oldest Patient </td>
                                        <td>
                                            {this.state.tabData.patientMeta ?
                                                this.state.tabData.patientMeta.oldestPatient + ' Years' :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td> Average time from first reported to treatment  </td>
                                        <td>
                                            {this.state.tabData.patientMeta ?
                                                this.state.tabData.patientMeta.averageTimeFirstReported :
                                                '-'
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>)
                    : (
                        <div > </div>
                    )}
            </div>
        )
    }
}

