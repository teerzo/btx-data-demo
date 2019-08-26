'use strict';

// Libs
import React from 'react';
import { routeNode } from 'react-router5';
import * as d3 from "d3";
import * as d3Queue from "d3-queue";
import axios from 'axios';
import qs from 'qs';
import simpleheat from 'simpleheat';

// Components
import colourGradient from '../helper/colourgradient.js';
import Nav from '../nav';
import TaskPopup from '../shared/taskPopup';
import AnatomyTab from '../shared/anatomyTab';
import AnatomyTabButton from '../shared/anatomyTabButton';
import AnatomyTabs from '../shared/anatomyTabs';


// css
import '../../styles/anatomy/desktop.scss';
import '../../styles/anatomy/mobile.scss';
import '../../styles/anatomy/anatomy-inner.scss';


// data
// import dataInjections from '../../data/injections.js';
import fileMuscles from '../../data/muscles';

// imgs
import tempImg from '../../images/temp.png';

const BASE_URL = 'https://8eiw0zieri.execute-api.us-east-1.amazonaws.com/dev';

export default class Anatomy extends React.Component {
    constructor(props) {
        super(props);

        this.child = React.createRef();

        this.initialize = this.initialize.bind(this);
        this.initMuscles = this.initMuscles.bind(this);

        this.setTaskPopup = this.setTaskPopup.bind(this);
        this.hideTaskPopup = this.hideTaskPopup.bind(this);

        this.showServerError = this.showServerError.bind(this);

        this.checkData = this.checkData.bind(this);
        this.checkDataPhysicians = this.checkDataPhysicians.bind(this);
        this.checkDataConditions = this.checkDataConditions.bind(this);
        this.checkDataMuscles = this.checkDataMuscles.bind(this);
        this.checkDataInjections = this.checkDataInjections.bind(this);
        // this.checkDataPatients = this.checkDataPatients.bind(this);


        this.update = this.update.bind(this);
        this.updateMuscles = this.updateMuscles.bind(this);
        this.updatePoints = this.updatePoints.bind(this);

        // TABS 
        this.forceUpdateTabs = this.forceUpdateTabs.bind(this);
        this.updateTabs = this.updateTabs.bind(this);
        this.addTab = this.addTab.bind(this);
        this.selectTab = this.selectTab.bind(this);
        this.closeTab = this.closeTab.bind(this);

        this.triggerUpdate = this.triggerUpdate.bind(this);
        // Dom events
        this.onPhysicianSelectChange = this.onPhysicianSelectChange.bind(this);
        this.onDataSelectChange = this.onDataSelectChange.bind(this);
        this.onConditionSelectChange = this.onConditionSelectChange.bind(this);
        this.onMuscleSelectChange = this.onMuscleSelectChange.bind(this);
        this.onVisualSelectChange = this.onVisualSelectChange.bind(this);
        this.onDrugSelectChange = this.onDrugSelectChange.bind(this);
        this.onMuscleViewClick = this.onMuscleViewClick.bind(this);
        // RESIZE
        this.initResizeListeners = this.initResizeListeners.bind(this);
        this.resizeEnd = this.resizeEnd.bind(this);

        // Data process
        this.processPhysicians = this.processPhysicians.bind(this);
        this.processConditions = this.processConditions.bind(this);
        this.processMuscles = this.processMuscles.bind(this);
        this.processInjections = this.processInjections.bind(this);
        // this.processSessions = this.processSessions.bind(this);

        // Data requests AXIOS
        this.requestPhysicians = this.requestPhysicians.bind(this);
        this.requestConditions = this.requestConditions.bind(this);
        this.requestMuscles = this.requestMuscles.bind(this);
        this.requestInjections = this.requestInjections.bind(this);
        // this.requestSessions = this.requestSessions.bind(this);

        this.state = {
            optionsChanged: false,

            showBg: true,

            debug: true,
            debugResize: true,

            // resize variables
            resizing: false,

            update: false,

            currentTask: {
                type: '',
                task: '',
                message: ''
            },


            tabIndex: 0,
            tabs: [
                {
                    // update: true,

                    tabName: 'Blank tab',
                    conditionName: 'No condition selected',
                    visualName: 'No data visualization selected',


                    
                    physicianId: null,
                    dataId: '',
                    conditionId: '',
                    muscleId: '',
                    visualId: '',
                    muscleViewId: '',
                    drugId: '',

                    dataCurrentConditionMeta: null,
                    dataCurrentMuscleMeta: null,

                    muscleMeta: {
                        muscleName: '-',
                        numOfSites: '-',
                        numOfPatients: '-',
                        numOfSessions: '-',
                        avgNumOfSitesPerSession: '-',
                        maxNumOfSitesInSession: '-',
                        avgDoseBotox: '-',
                        avgDoseDysport: '-',
                    },
                    patientMeta: {
                        patientsTotal: '-',
                        genderMalePercentage: '-',
                        genderFemalePercentage: '-',
                        averageAge: '-',
                        youngestPatient: '-',
                        oldestPatient: '-',
                        averageTimeFirstReported: '-',
                    },

                    info: {
                        title: '',
                        muscleName: '',
                    }
                },
                {
                    // update: true,

                    tabName: 'Set tab',
                    conditionName: 'No condition selected',
                    visualName: 'No data visualization selected',

                    physicianId: 24,
                    dataId: 1,
                    conditionId: 2,
                    muscleId: 18,
                    visualId: 1,
                    muscleViewId: '',
                    drugId: '',

                    dataCurrentConditionMeta: null,
                    dataCurrentMuscleMeta: null,

                    muscleMeta: {
                        muscleName: '-',
                        numOfSites: '-',
                        numOfPatients: '-',
                        numOfSessions: '-',
                        avgNumOfSitesPerSession: '-',
                        maxNumOfSitesInSession: '-',
                        avgDoseBotox: '-',
                        avgDoseDysport: '-',
                    },
                    patientMeta: {
                        patientsTotal: '-',
                        genderMalePercentage: '-',
                        genderFemalePercentage: '-',
                        averageAge: '-',
                        youngestPatient: '-',
                        oldestPatient: '-',
                        averageTimeFirstReported: '-',
                    },

                    info: {
                        title: '',
                        muscleName: '',
                    }
                }
            ],
            mapTabs: [],
            mapTabButtons: [],



            tempPhysicians: [],
            tempConditions: [],
            tempSessions: [],

            dataPoints: [],
            dataMuscles: [],
            dataPhysicians: [],

            // dataPhysicians: [
            //     {
            //         physicianId: null,
            //         conditions: [
            //             {
            //                 condition_id: null,
            //                 patients: [
            //                     {
            //                         patient_id: null,
            //                         sessions: [
            //                             {
            //                                 session_id: null,
            //                                 injections: [
            //                                     {
            //                                         injection_id: null
            //                                     }
            //                                 ]
            //                             }
            //                         ]
            //                     }
            //                 ],
            //             }
            //         ],
            //     }
            // ],






            dataCurrentInjections: [],

            // data
            dataMeta: [],
            dataInjections: [],
            dataMuscles: [],



            domSelectConditions: [],
            domSelectMuscles: [],

            domDataMeta: [],
            domMetaList: [],
            domMuscleViews: [],

            // page variables 
            domVarDataTable: false,
            domVarDataTableFull: false,
            domVarCurrentMuscle: null,

            domVarMuscleValues: {
                muscleName: '',
                numOfSites: 0,
                numOfPatients: 0,
                numOfSessions: 0,
                avgNumOfSitesPerSession: 0,
                maxNumOfSitesInSession: 0,
                avgDoseBotox: 0,
                avgDoseDysport: 0,
            },

            domVarCurrentMuscleId: null,

            panelMenu: false,
            currentMuscleId: null,
            currentViewId: null,
            currentMuscleImageBg: null,
            currentMuscleImageOverlay: null,
            totalInjectionAverage: 0,
            totalBotoxAverage: 0,
            totalDysportAverage: 0,



            mainImageSize: { x: 300, y: 400 },


        }
    }

    componentDidMount() {
        this.initialize();
    };



    initialize() {
        this.initMuscles();
        this.updateTabs();
        this.resizeEnd(null);

        this.requestServerStatus();
    };

    initMuscles() {

        let dataMuscles = [];
        if (fileMuscles && fileMuscles.data) {
            let sortedList = fileMuscles.data.sort(function (a, b) {
                let aa = a.muscleName;
                let bb = b.muscleName;
                if (aa < bb) { return -1 }
                if (aa > bb) { return 1 }
                return 0;
            });
            for (var i = 0; i < sortedList.length; i++) {
                var baseMuscle = sortedList[i];
                var match = false;


                for (var m = 0; m < dataMuscles.length; m++) {
                    var muscle = dataMuscles[m];
                    if (baseMuscle.muscleName === muscle.muscleName) {
                        match = true;
                    }
                }
                if (!match) {
                    var item = {
                        // muscleId: sortedList[m].muscleId,
                        id: dataMuscles.length,
                        muscleName: baseMuscle.muscleName,
                        
                        muscles: [],
                        

                        points: [],
                        injectionCount: 0,
                        // injectionCount: 0,
                        // injectionAverage: 0,
                        // botoxAverage: 0,
                        // dysportAverage: 0,

                        // sessions: [],
                    };
                    dataMuscles.push(item);
                }
            }
            for (var i = 0; i < sortedList.length; i++) {
                var baseMuscle = sortedList[i];
                for (var m = 0; m < dataMuscles.length; m++) {
                    var muscle = dataMuscles[m];

                    if (baseMuscle.muscleName === muscle.muscleName) {
                        var newChildMuscleName = muscle.muscleName;
                        if (baseMuscle.lateralPositionSet[0].lateralPositionCode === 'L' || baseMuscle.lateralPositionSet[0].lateralPositionCode === 'R') {
                            newChildMuscleName += ' ' + baseMuscle.lateralPositionSet[0].lateralPositionCode;
                        }

                        var newChildMuscle = {
                            muscleName: newChildMuscleName,
                            muscleId: baseMuscle.muscleId,
                            // muscleType: baseMuscle.lateralPositionSet[0].muscleImageData[0].type ? baseMuscle.lateralPositionSet[0].muscleImageData[0].type : '',
                            muscleImgBg: baseMuscle.lateralPositionSet[0].muscleImageData[0].backgroundImageFile,
                            muscleImgOverlay: baseMuscle.lateralPositionSet[0].muscleImageData[0].overlayImageFile,
                            muscleImgZones: baseMuscle.lateralPositionSet[0].muscleImageData[0].zonesImageFile ? baseMuscle.lateralPositionSet[0].muscleImageData[0].zonesImageFile : '',

                            zones: [
                                {   
                                    id: 0,
                                    text: 'Zone 1',
                                    vertices: [
                                        { x: 0.25, y: 0.25 },
                                        { x: 0.75, y: 0.25 },
                                        { x: 0.25, y: 0.75 },
                                        { x: 0.75, y: 0.75 },
                                    ]
                                }
                            ],

                            sessions: [],
                        }

                        muscle.muscles.push(newChildMuscle);

                    }
                }
            }
        }
        this.setState({
            dataMuscles: dataMuscles
        });
    }

    setTaskPopup(type, task, message) {
        let currentTask = {
            type: type,
            task: task,
            message: message
        };

        this.setState({
            currentTask: currentTask,
        });
    }
    hideTaskPopup(type) {
        let currentTask = this.state.currentTask;
        if( currentTask.type === type ) {
            // hide popup
            currentTask.type = '',
            currentTask.task = '',
            currentTask.message = '',

            this.setState({
                currentTask: currentTask
            });
        }
    }

    showServerError() {

    };

    checkData() {
        let tabs = this.state.tabs;
        const tab = tabs[this.state.tabIndex];

        // console.log('tab', tab);
        if (tab) {
            const physicians = this.state.dataPhysicians;
            let update = this.checkDataPhysicians(tab, physicians);
            if (update) {
                this.update();
            }
        }
        else {
            console.log('tab error');
        }
    }

    checkDataPhysicians(tab, physicians) {
        // console.log('checkDataPhysicians', tab, physicians);
        if (physicians && physicians.length > 0) {
            let update = true;
            // console.log('physician id', tab.physicianId);
            // console.log('data id', tab.dataId);

            if (tab.physicianId !== null && tab.physicianId !== '') {
                if (tab.dataId === 1) { // only selected physician 
                    for (let phys = 0; phys < physicians.length; phys++) {
                        // console.log(tab.physicianId, physicians[phys].physicianId);

                        // console.log(typeof tab.physicianId, typeof physicians[phys].physicianId);

                        if (tab.physicianId === physicians[phys].physicianId) {
                            // console.log('physician match', tab.physicianId, physicians[phys].physicianId);
                            // update = false;
                            const physician = physicians[phys];
                            if (!this.checkDataConditions(tab, physician)) {
                                return false;
                            }
                        }
                    }
                }
                else if (tab.dataId === 2) { // all physicians
                    for (let phys = 0; phys < physicians.length; phys++) {
                        // update = false;
                        const physician = physicians[phys];
                        if (!this.checkDataConditions(tab, physician)) {
                            return false;
                        }
                    }
                }
                else if (tab.dataId === 3) { // all physicians minus selected physician
                    for (let phys = 0; phys < physicians.length; phys++) {
                        if (tab.physicianId !== physicians[phys].physicianId) {
                            // update = false;
                            const physician = physicians[phys];
                            if (!this.checkDataConditions(tab, physician)) {
                                return false;
                            }
                        }
                    }
                }
            }
            else {
                // console.log('no physician selected continuing with page update');
            }
            return update;
        }
        else {
            // console.log('no physicians, trying to download physician data now');
            this.requestPhysicians();
            return false;
        }
    }

    checkDataConditions(tab, physician) {
        // console.log('checkDataConditions', physician.conditions);
        if (physician.conditions && physician.conditions.length > 0) {

            if (tab.conditionId !== null && tab.conditionId !== '') {
                for (let c = 0; c < physician.conditions.length; c++) {
                    if (tab.conditionId === physician.conditions[c].conditionId) {
                        // if (!this.checkDataMuscles(tab, physician.conditions[c])) {
                        if (!this.checkDataMuscles(tab, physician)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        else {
            console.log('no conditions, trying to download physician data now');
            this.requestConditions(tab);
            return false;
        }
    }


    // for( let p = 0; p < physicians.length; p++ ) {
    //     if( physicians[p].physicianId === temp.physicianId ) {
    //         for( let c = 0; c < physicians[p].conditions.length; c++ ) {
    //             if( physicians[p].conditions[c].condition_id === temp.conditionId ) {
    //                 for( let pa = 0; pa < physicians[p].conditions[c].patients.length; pa++ ) {
    //                     if( physicians[p].conditions[c].patients[pa].patient_id === temp.patientId ) {
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

    // checkDataMuscles(tab, condition) {
    //     if (condition.muscles && condition.muscles.length > 0) {
    //         for (let p = 0; p < condition.muscles.length; p++) {
    //             if (condition.muscles[p].injections === null) {
    //                 // no sessions in database
    //             }
    //             else if (condition.muscles[p].injections && condition.muscles[p].injections.length > 0) {
    //                 // sessions in database
    //             }
    //             else {
    //                 // havent checked yet, attempt to download
    //                 console.log('download injections', p, condition.muscles.length);
    //                 this.setTaskPopup('request injections', 'Requesting data', 'Downloading injection data please wait');
    //                 this.requestInjections(tab, condition.muscles[p]);
    //                 return false;
    //             }
    //         }
    //         return true;
    //     }
    //     else {
    //         console.log('no muscles, trying to download muscle data now');
    //         this.requestMuscles(tab);
    //         return false;
    //     }
    // }

    checkDataMuscles(tab, physician) {
        ;

        let match = false;
        if (physician.injections === null ) {
            return true;
        }  
        else if( physician.injections && physician.injections.length > 0 ) {
            if( physician.injections.length === physician.injectionsCount) {
                return true;
            }
            else {
                this.setTaskPopup('request injections', 'Requesting data', 'Downloading injection data please wait');
                this.requestInjections(tab, physician.injections.length, 10000);
                return false;
            }
        }
        else {
            // havent checked yet, attempt to download
            // console.log('download injections', p, condition.muscles.length);
            this.setTaskPopup('request injections', 'Requesting data', 'Downloading injection data please wait');
            this.requestInjections(tab, 0, 10000);
            return false;
        }
        

        // if (condition.muscles && condition.muscles.length > 0) {
        //     for (let p = 0; p < condition.muscles.length; p++) {
        //         if (condition.muscles[p].injections === null) {
        //             // no sessions in database
        //         }
        //         else if (condition.muscles[p].injections && condition.muscles[p].injections.length > 0) {
        //             // sessions in database
        //         }
        //         else {
        //             // havent checked yet, attempt to download
        //             console.log('download injections', p, condition.muscles.length);
        //             this.setTaskPopup('request injections', 'Requesting data', 'Downloading injection data please wait');
        //             this.requestInjections(tab, condition.muscles[p]);
        //             return false;
        //         }
        //     }
        //     return true;
        // }
        // else {
        //     console.log('no muscles, trying to download muscle data now');
        //     this.requestMuscles(tab);
        //     return false;
        // }
    }
    

    checkDataInjections(tab, muscle) {

    }

    // checkDataPatients(tab, condition) {
    //     if (condition.patients && condition.patients.length > 0) {
    //         for (let p = 0; p < condition.patients.length; p++) {
    //             if (condition.patients[p].sessions === null) {
    //                 // no sessions in database
    //             }
    //             else if (condition.patients[p].sessions && condition.patients[p].sessions.length > 0) {
    //                 // sessions in database
    //             }
    //             else {
    //                 // havent checked yet, attempt to download
    //                 console.log('download patients', p, condition.patients.length);
    //                 this.setTaskPopup('request session', 'Requesting data', 'Downloading patient data ' + (p+1) + '/'+condition.patients.length + ' please wait');
    //                 this.requestSessions(tab, condition.patients[p]);
    //                 return false;
    //             }
    //         }
    //         return true;
    //     }
    //     return true;
    // }



    // Resize Functions 
    initResizeListeners() {
        let that = this;

        var resizeTimer;
        window.addEventListener('resize', function (event) {
            that.setState({ resizing: true });
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                that.resizeEnd(event);
            }, 250);
        });
    }
    resizeEnd(event) {
        var that = this;
        window.setTimeout(function () {
            that.resizeWindow(event);
        }, 200);
    }
    resizeWindow(event) {
        var that = this;
        var DOMcontent = document.getElementById('route-content');




        var contentHeight = DOMcontent.offsetHeight;
        var contentWidth = DOMcontent.offsetWidth;
        // console.log('container size', contentHeight);

        var domPanels = document.getElementsByClassName('anatomy-panel');
        // console.log('DOMpanels', domPanels);
        for (var i = 0; i < domPanels.length; i++) {
            // console.log(domPanels[i]);
            if (contentWidth < 1000) {
                domPanels[i].style.height = 'auto';
                // domPanels[i].style.height = contentHeight + 'px';
            }
            else {
                domPanels[i].style.height = contentHeight + 'px';

            }

            // var domPanelTop = null;
            var domPanelMain = null;
            var domPanelBottom = null;

            var children = domPanels[i].childNodes;
            for (var c = 0; c < children.length; c++) {
                if (children[c].className.indexOf('panel-main') !== -1) {
                    domPanelMain = children[c];
                }
                if (children[c].className.indexOf('panel-bottom') !== -1) {
                    domPanelBottom = children[c];
                }
            }
            if (domPanelMain !== null && domPanelBottom !== null) {

                var mainHeight = 100;
                if (domPanelMain.id === 'panel-menu-main') {
                    // mainHeight = contentHeight - (domPanelTop.offsetHeight + domPanelBottom.offsetHeight) + 100 + 'px';
                    mainHeight = contentHeight - (domPanelBottom.offsetHeight) - 20 + 'px';
                }
                else if (contentWidth < 1000) {
                    mainHeight = 'auto';
                }
                else {
                    mainHeight = contentHeight - (domPanelBottom.offsetHeight) - 20 + 'px';
                    // mainHeight = 411 + 'px';

                }
                domPanelMain.style.height = mainHeight;

            }
            else {
                // console.log('dont update thingy', domPanelTop, domPanelMain, domPanelBottom );
            }



            // console.log(children);
        }

        // var domPanelViewTop =  document.getElementById('panel-view-top');
        var domPanelViewMain = document.getElementById('panel-view-main');
        var domPanelMenuMain = document.getElementById('panel-menu-main');
        var domPanelViewMainLoading = document.getElementById('panel-view-main-loading');



        var domImageOverlay = document.getElementById('panel-view-main-img-overlay');
        var domImageBg = document.getElementById('panel-view-main-img-bg');
        var domScatterPlot = document.getElementById('scatterContainer');
        var domHeatmap = document.getElementById('heatchartContainer');


        var domImgSize = document.getElementById('panel-view-main-img-size');


        if (domPanelViewMain) {
            var mainWidth = domPanelViewMain.offsetWidth;
            var mainHeight = domPanelViewMain.offsetHeight;

            if (mainWidth < mainHeight && mainWidth < 460) {
                if (domImgSize) {
                    domImgSize.children[0].className = 'w';
                }
            }
            else {
                if (domImgSize) {
                    domImgSize.children[0].className = 'h';
                }
            }


            var mainImageSize = {
                x: domImgSize ? domImgSize.children[0].offsetWidth : 200,
                y: domImgSize ? domImgSize.children[0].offsetHeight : 200
            };


            if (domPanelViewMainLoading) {
                domPanelViewMainLoading.style.width = mainWidth - 2;
                domPanelViewMainLoading.style.height = mainHeight - 2;
            }

            if (domImageOverlay) {
                domImageOverlay.style.width = mainWidth - 2;
                domImageOverlay.style.height = mainHeight - 2;
                // domImageOverlay.style.top = domPanelViewTop.offsetHeight + 'px';
                domImageOverlay.style.top = '0px';
                // console.log('size', mainWidth, mainHeight, contentWidth);
                if (mainWidth < mainHeight && mainWidth < 380) {
                    domImageOverlay.children[0].className = 'w';
                }
                else {
                    domImageOverlay.children[0].className = 'h';
                }
            }
            if (domImageBg) {
                domImageBg.style.width = mainWidth - 2;
                domImageBg.style.height = mainHeight - 2;
                // domImageBg.style.top = domPanelViewTop.offsetHeight + 'px';
                domImageBg.style.top = '0px';
                // console.log('size', mainWidth, mainHeight, contentWidth);
                if (mainWidth < mainHeight && mainWidth < 380) {
                    domImageBg.children[0].className = 'w';
                }
                else {
                    domImageBg.children[0].className = 'h';
                }

            }
            if (domScatterPlot) {
                domScatterPlot.style.width = mainWidth - 2;
                domScatterPlot.style.height = mainHeight - 2;
                // domScatterPlot.style.top = domPanelViewTop.offsetHeight + 'px';
            }
            if (domHeatmap) {
                // domHeatmap.style.width = mainWidth - 2;
                // domHeatmap.style.height = mainHeight - 2;
                // domHeatmap.style.top = domPanelViewTop.offsetHeight + 'px';
                domHeatmap.style.top = '0px';
                domHeatmap.style.width = mainWidth - 2;
                domHeatmap.style.height = mainHeight - 2;
            }
        }
        if (domPanelMenuMain) {
            // domPanelMenuMain.style.height = contentHeight + 'px';
        }
        // console.log('resize', JSON.stringify(mainImageSize));
        // that.setState({ resizing: false, mainImageSize: { x: mainImageSize.x, y: mainImageSize.y } }, that.processStateChange);
        that.setState({ resizing: false, mainImageSize: { x: mainWidth, y: mainHeight } }, that.processStateChange);
    }


    // dataPhysicians: [
    //     {
    //         physicianId: null,
    //         conditions: [
    //             {
    //                 condition_id: null,
    //                 patients: [
    //                     {
    //                         patient_id: null,
    //                         sessions: [
    //                             {
    //                                 session_id: null,
    //                                 injections: [
    //                                     {
    //                                         injection_id: null
    //                                     }
    //                                 ]
    //                             }
    //                         ]
    //                     }
    //                 ],
    //             }
    //         ],
    //     }
    // ],

    update() {
        console.log('update');

        this.updateMuscles();
        this.updatePoints();
        // this.updateTabs();


        this.hideTaskPopup('loading tab');
    }

    updateMuscles() {
        // console.log('updateMuscles');
        let tab = this.state.tabs[this.state.tabIndex];
        // if (tab.physicianId && tab.dataId && tab.conditionId && tab.muscleId && tab.visualId) {
        if (tab.physicianId) {

            let dataMuscles = this.state.dataMuscles;

            if (dataMuscles && dataMuscles.length > 0) {
                for (let bm = 0; bm < dataMuscles.length; bm++) {
                    for (let m = 0; m < dataMuscles[bm].muscles.length; m++) {
                        let muscle = dataMuscles[bm].muscles[m];
                        // console.log('muscle', muscle);
                        dataMuscles[bm].muscles[m].injectionCount = 0;
                    }
                }

        
                for (let ph = 0; ph < this.state.dataPhysicians.length; ph++) {
                    if (tab.physicianId === this.state.dataPhysicians[ph].physicianId) {
                        const physician = this.state.dataPhysicians[ph];

                        for (let c = 0; c < physician.conditions.length; c++) {
                            if (tab.conditionId === physician.conditions[c].condition_id) {
                                const condition = physician.conditions[c];

                                // $$$
                                // for (let pa = 0; pa < condition.patients.length; pa++) {
                                //     const patient = condition.patients[pa];


                                    // $$$
                                    // if (patient.sessions && patient.sessions.length > 0) {
                                    //     for (let s = 0; s < patient.sessions.length; s++) {
                                    //         const session = patient.sessions[s];

                                    //         // console.log('injections', session.injections.length);
                                    //         if (session.injections && session.injections.length > 0) {
                                    //             for (let i = 0; i < session.injections.length; i++) {
                                    //                 const injection = session.injections[i];

                                    //                 for (let bm = 0; bm < dataMuscles.length; bm++) {
                                    //                     for (let m = 0; m < dataMuscles[bm].muscles.length; m++) {
                                    //                         let muscle = dataMuscles[bm].muscles[m];

                                    //                         // if (muscle.muscleId === tab.muscleViewId) {

                                    //                         // console.log('muscle', muscle);
                                    //                         if (injection.muscle_image_id === muscle.muscleId) {
                                    //                             // dataMuscles[bm].injectionCount += 1;
                                    //                             muscle.injectionCount += 1;
                                    //                         }
                                    //                         dataMuscles[bm].muscles[m] = muscle;
                                    //                     }
                                    //                 }
                                    //             }
                                    //         }
                                    //     }
                                    // }
                                // }
                            }
                        }
                    }
                }

                this.setState({
                    dataMuscles: dataMuscles,
                })
            }
        }

        
    }
    updatePoints() {
        this.updateTabs();

        // console.log('updatePoints');
        // let tab = this.state.tabs[this.state.tabIndex];
        // // if (tab.physicianId && tab.dataId && tab.conditionId && tab.muscleId && tab.visualId) {
        // if (tab.physicianId) {
        //     if (this.state.dataMuscles && this.state.dataMuscles.length > 0) {


        //         let muscleIds = [];

        //         for (let i = 0; i < this.state.dataMuscles.length; i++) {
        //             // console.log(tab.muscleId, typeof tab.muscleId, this.state.dataMuscles[i].id, typeof this.state.dataMuscles[i].id);
        //             if (tab.muscleId !== '' && tab.muscleId === this.state.dataMuscles[i].id) {
        //                 if( this.state.dataMuscles[i].muscles && this.state.dataMuscles[i].muscles.length > 0 ) {
        //                     for (let m = 0; m < this.state.dataMuscles[i].muscles.length; m++) {
        //                         let muscle = this.state.dataMuscles[i].muscles[m];

        //                         if( tab.muscleViewId === muscle.muscleId ) {
        //                             const firstMuscle = this.state.dataMuscles[i].muscles[m];
        //                             muscleIds.push(firstMuscle.muscleId);

        //                              if (firstMuscle.muscleType === 'anterior-superficial') {
        //                                 for (let mm = 0; mm < this.state.dataMuscles[i].muscles.length; mm++) {
        //                                     const secondMuscle = this.state.dataMuscles[i].muscles[mm];
        //                                     if (firstMuscle.muscleId !== secondMuscle.muscleId) {
        //                                         if (firstMuscle.muscleType === secondMuscle.muscleType) {
        //                                             muscleIds.push(secondMuscle.muscleId);
        //                                         }
        //                                     }
        //                                 }
        //                             }
                                    
        //                             // const firstMuscle = this.state.dataMuscles[i].muscles[m];
    
        //                             // imgBg = firstMuscle.muscleImgBg;
        //                             // imgOver = firstMuscle.muscleImgOverlay;
    
        //                             // imgs.push(imgOver);
        //                             // if (firstMuscle.muscleType === 'anterior-superficial') {
        //                             //     for (let mm = 0; mm < this.state.dataMuscles[i].muscles.length; mm++) {
        //                             //         const secondMuscle = this.state.dataMuscles[i].muscles[mm];
        //                             //         if (firstMuscle.muscleId !== secondMuscle.muscleId) {
        //                             //             if (firstMuscle.muscleType === secondMuscle.muscleType) {
        //                             //                 imgs.push(secondMuscle.muscleImgOverlay);
        //                             //             }
        //                             //         }
        //                             //     }
        //                             // }
                                    
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //         console.log('muscleIds', muscleIds);

        //         let layers = [];
        //         let points = [];



        //         for (let ph = 0; ph < this.state.dataPhysicians.length; ph++) {
        //             if (tab.physicianId === this.state.dataPhysicians[ph].physicianId) {
        //                 const physician = this.state.dataPhysicians[ph];

        //                 for (let c = 0; c < physician.conditions.length; c++) {
        //                     if (tab.conditionId === physician.conditions[c].condition_id) {
        //                         const condition = physician.conditions[c];

        //                         for (let pa = 0; pa < condition.patients.length; pa++) {
        //                             const patient = condition.patients[pa];

        //                             if (patient.sessions && patient.sessions.length > 0) {
        //                                 for (let s = 0; s < patient.sessions.length; s++) {
        //                                     const session = patient.sessions[s];

        //                                     console.log('injections', session.injections.length);
        //                                     if (session.injections && session.injections.length > 0) {
        //                                         for (let i = 0; i < session.injections.length; i++) {
        //                                             const injection = session.injections[i];

        //                                             for (let mi = 0; mi < muscleIds.length; mi++) {
        //                                                 const muscleId = muscleIds[mi];
                                                        
        //                                                 // if (muscle.muscleId === tab.muscleViewId) {
        //                                                     if (injection.muscle_image_id === muscleId) {
        //                                                         let point = {
        //                                                             x: injection.injection_x_point,
        //                                                             y: injection.injection_y_point,
        //                                                             z: 1,
        //                                                         }
        //                                                         points.push(point);
        //                                                     }
        //                                                 // }
        //                                             }
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //         ///////////////////////// $$$$ SESSIONS/POINTS CALCULATION
                
        //         let data = points;
        //         let dataRadius = [];
        //         let dataFull = data.slice(0);
        //         let dataTotal = data.length;
    
        //         // radius check 
        //         let tempRadius = [];
        //         for (let i = 0; i < data.length; i++) {
        //             let point1 = data[i];
        //             let add = false;
        //             for (let j = 0; j < data.length; j++) {
        //                 if (i !== j) {
        //                     let point2 = data[j];
        //                     let a = point1[0] - point2[0];
        //                     let b = point1[1] - point2[1];
    
        //                     let distance = Math.sqrt(a * a + b * b);
        //                     if (distance <= this.state.pointsRadius) {
        //                         add = true;
    
        //                     }
        //                 }
        //             }
        //             if (add) {
        //                 tempRadius.push(point1);
        //             }
        //         }
        //         dataRadius = tempRadius.slice(0);
    
        //         let groups = [];
        //         let newPoints = data.slice(0);
        //         // ;
        //         while (newPoints.length > 0) {
        //             let point1 = newPoints[0];
        //             let add = false;
        //             // console.log('point1', point1);
    
    
        //             ///
        //             let lowDist = null;
        //             let lowGroupI = null;
    
    
        //             for (let i = 0; i < groups.length; i++) {
        //                 for (let j = 0; j < groups[i].length; j++) {
        //                     let point2 = groups[i][j];
        //                     // console.log('point2', point2);
        //                     let a = point1[0] - point2[0];
        //                     let b = point1[1] - point2[1];
        //                     let distance = Math.sqrt(a * a + b * b);
        //                     if (distance <= this.state.pointsRadius) {
        //                         add = true;
        //                         if (distance < lowDist || lowDist === null) {
        //                             lowDist = distance;
        //                             // console.log('lowGroupI before', i);
        //                             lowGroupI = i;
        //                         }
        //                     }
        //                 }
        //             }
        //             if (add) {
        //                 // console.log('lowGroupI after', lowGroupI);
        //                 groups[lowGroupI].push(point1);
        //                 newPoints = newPoints.slice(1, newPoints.length);
        //             }
        //             else {
        //                 let temp = [];
        //                 temp.push(point1);
        //                 groups.push(temp);
        //                 newPoints = newPoints.slice(1, newPoints.length);
        //             }
        //         }
    
    
    
        //         // console.log('groups', groups);
    
        //         let finalGroups = [];
        //         for (let i = 0; i < groups.length; i++) {
        //             let dataPercentage = (groups[i].length / points.length) * 100;
        //             finalGroups.push({
        //                 points: groups[i],
        //                 gradient: null,
        //                 percentage: dataPercentage,
        //             });
        //         }
        //         // console.log('final group before', finalGroups);
        //         finalGroups = finalGroups.sort(function (a, b) {
        //             let ap = a.percentage;
        //             let bp = b.percentage;
    
        //             if (ap < bp) {
        //                 return 1;
        //             }
        //             if (ap > bp) {
        //                 return -1;
        //             }
        //             // names must be equal
        //             return 0;
        //         });
        //         // console.log('final group after', finalGroups);
    
        //         if (finalGroups.length > 0) {
    
        //             let finalMin = finalGroups[0].percentage;
        //             let finalMax = finalGroups[finalGroups.length - 1].percentage;
    
    
        //             let colours = [];
        //             let colourRange = [
        //                 '0000FF',
        //                 '61e139',
        //                 'eeee33',
        //                 'fe1612'
        //             ];
        //             // #fe1612,#eeee33,#61e139,#0000FF 
    
        //             let colorMax = (finalGroups.length + 3) * 3;
        //             if (colorMax > 10) {
        //                 colorMax = 10;
        //             }
        //             else if (colorMax < 10) {
        //                 colorMax = 10;
        //             }
        //             // console.log(colorMax);
    
        //             let colours3 = colourGradient.generateColor('#' + colourRange[3], '#' + colourRange[2], colorMax);
        //             let colours2 = colourGradient.generateColor('#' + colourRange[2], '#' + colourRange[1], colorMax);
        //             let colours1 = colourGradient.generateColor('#' + colourRange[1], '#' + colourRange[0], colorMax);
    
    
        //             colours.push(colourRange[0]);
        //             colours = colours.concat(colours1);
        //             colours.push(colourRange[1]);
        //             colours = colours.concat(colours2);
        //             colours.push(colourRange[2]);
        //             colours = colours.concat(colours3);
        //             colours.push(colourRange[3]);
    
        //             // console.log(colours);
        //             // ;
        //             // generateColor('#000000','#ff0ff0',10);
    
        //             let domRange = document.getElementById('color-range');
        //             domRange.innerHTML = '';
        //             // ;
        //             for (let i = 0; i < colours.length; i++) {
        //                 let colorDiv = document.createElement('div');
        //                 colorDiv.classList.add('color-div');
        //                 colorDiv.style.backgroundColor = '#' + colours[i];
        //                 colorDiv.innerHTML = i + "° - #" + colours[i];
        //                 // domRange.appendChild(colorDiv);
        //                 // $('#result_show').append("<div style='padding:8px;color:#FFF;background-color:#"+tmp[cor]+"'>COLOR "+cor+"° - #"+tmp[cor]+"</div>")
        //             }
    
    
        //             // console.log('finalGroups.length', finalGroups.length);
        //             // console.log('colours.length', colours.length);
        //             // ;
    
        //             // if( ) {
    
        //             // }
    
        //             for (let i = 0; i < finalGroups.length; i++) {
        //                 let colourI = 0
    
        //                 //((input - min) * 100) / (max - min)
        //                 // colourI = ((finalGroups[i].percentage - finalMin) * 100) / (finalMax - finalMin)
        //                 // console.log('colourI percentage', colourI);
        //                 // console.log('finalGroups[i].percentage', finalGroups[i].percentage);
        //                 // console.log('finalMin', finalMin);
        //                 // console.log('finalMax', finalMax);
    
    
        //                 colourI = Math.round((finalGroups[i].percentage / 100) * colours.length);
        //                 // console.log('colourI before', colourI);
        //                 // // max-(min-input);
    
        //                 // colourI = colours.length - ( 0 - colourI);
    
        //                 // console.log('colourI after', colourI);
        //                 colourI = Math.round(colourI);
        //                 let colourILess = colourI - 5;
    
        //                 if (colourI < 0) {
        //                     colourI = 0;
        //                 }
        //                 else if (colourI > colours.length - 1) {
        //                     colourI = colours.length - 1;
        //                 }
        //                 if (colourILess < 0) {
        //                     colourILess = 0;
        //                 }
        //                 else if (colourILess > colours.length - 1) {
        //                     colourILess = colours.length - 1;
        //                 }
    
        //                 finalGroups[i].gradient = { 0: '#000000', 0.5: '#' + colours[colourILess], 1: '#' + colours[colourI] };
        //                 // finalGroups[i].gradient = { 0:'#'+colours[colourILess], 1: '#'+colours[colourI] };
    
        //                 if (finalGroups[i].points.length > 0) {
        //                     // layers.push({
        //                     //     id: 1,
        //                     //     points: points,
        //                     //     gradient: gradient,                                   
        //                     //     // gradient: { 0: '#330000', 0.5: '#990000', 1: '#ff0000' }                                    
        //                     // });

        //                     // that.createHeatmap(finalGroups[i].points, finalGroups[i].gradient);
        //                 }
        //             }
        //         }
                


        //         /////////////////////////
               
        //         // layers.push({
        //         //     id: 1,
        //         //     points: points,
        //         //     gradient: { 0: '#330000', 0.5: '#990000', 1: '#ff0000' }
        //         // });
              

        //         this.setState({
        //             dataPoints: finalGroups,
        //             // dataPoints: layers,
        //         }, this.updateTabs)
        //     }
        // }
        // else {
        //     this.setState({
        //         dataPoints: [],
        //     }, this.updateTabs)
        // }
    }

    forceUpdateTabs() {
        this.updateTabs();
        this.checkData();
    }

    updateTabs() {
        // console.log('updateTabs');


        let selectTab = function (index) {
            console.log('selectTab');
            this.selectTab(index);
        }.bind(this);
        let closeTab = function (index) {
            console.log('closeTab');
            this.closeTab(index);
        }.bind(this);

        let mapTabButtons = this.state.tabs.map(function (item, key) {
            return (
                <AnatomyTabButton
                    key={key}
                    tabData={item}
                    tabIndex={this.state.tabIndex}
                    index={key}
                    selectTab={() => selectTab(key)}
                    closeTab={() => closeTab(key)}
                />)
        }.bind(this));

        let mapTabs = this.state.tabs.map(function (item, key) {
            return (
                this.state.tabIndex === key ?
                    <AnatomyTab
                        key={key}
                        ref={this.child}

                        optionsChanged={this.state.optionsChanged}

                        dataPoints={this.state.dataPoints}
                        dataMuscles={this.state.dataMuscles}
                        dataPhysicians={this.state.dataPhysicians}
                        tabData={item}
                        tabIndex={this.state.tabIndex}
                        index={key}

                        triggerUpdate={this.triggerUpdate}
                        onPhysicianSelectChange={this.onPhysicianSelectChange}
                        onDataSelectChange={this.onDataSelectChange}
                        onConditionSelectChange={this.onConditionSelectChange}
                        onMuscleSelectChange={this.onMuscleSelectChange}
                        onVisualSelectChange={this.onVisualSelectChange}
                        onDrugSelectChange={this.onDrugSelectChange}
                        onMuscleViewClick={this.onMuscleViewClick}

                    />
                    :
                    <div key={key}> </div>
            )
        }.bind(this));


        this.setState({
            update: true,
            mapTabs: mapTabs,
            mapTabButtons: mapTabButtons,
        });
    }
    addTab() {
        console.log('selectTab');

        let tabs = this.state.tabs;
        let newTab = {
            tabName: 'Added tab',

            conditionName: 'No condition selected',
            visualName: 'No data visualization selected',

            physicianId: null,
            dataId: '',
            conditionId: '',
            muscleId: '',
            visualId: '',
            muscleViewId: '',
            drugId: '',

            dataCurrentConditionMeta: null,
            dataCurrentMuscleMeta: null,

            muscleMeta: {
                muscleName: '-',
                numOfSites: '-',
                numOfPatients: '-',
                numOfSessions: '-',
                avgNumOfSitesPerSession: '-',
                maxNumOfSitesInSession: '-',
                avgDoseBotox: '-',
                avgDoseDysport: '-',
            },
            patientMeta: {
                patientsTotal: '-',
                genderMalePercentage: '-',
                genderFemalePercentage: '-',
                averageAge: '-',
                youngestPatient: '-',
                oldestPatient: '-',
                averageTimeFirstReported: '-',
            },

            info: {
                title: ''
            }
        };
        tabs.push(newTab);
        let tabIndex = tabs.length - 1;

        this.setState({
            tabs: tabs,
            tabIndex: tabIndex
        }, this.update);
    }
    selectTab(index) {
        console.log('selectTab', index);

        // $$$
        this.setTaskPopup('loading tab', 'Loading tab data', 'Loading tab data please wait');

        let tabIndex = index;

        this.setState({
            tabIndex: tabIndex

        }, this.forceUpdateTabs);
    }
    closeTab(index) {
        let tabs = this.state.tabs;
        if (tabs && tabs.length > 1) {
            tabs.splice(index, 1);
            let tabIndex = tabs.length - 1;
            this.setState({
                tabs: tabs,
                tabIndex: tabIndex
            }, this.update);
        }
    }

    triggerUpdate(tabData) {
        console.log('triggerUpdate');
        // console.log('anatomy.onPhysicianSelectChange', event);

        let tabs = this.state.tabs;
        // tabs[this.state.tabIndex].physicianId = Number(event);

        this.setState({
            optionsChanged: true,
            tabs: tabs,
        }, this.checkData);
    }
    onPhysicianSelectChange(event) {
        // console.log('anatomy.onPhysicianSelectChange', event);

        let tabs = this.state.tabs;
        tabs[this.state.tabIndex].physicianId = Number(event);
        tabs[this.state.tabIndex].dataId = '';
        tabs[this.state.tabIndex].conditionId = '';
        tabs[this.state.tabIndex].muscleId = '';
        tabs[this.state.tabIndex].visualId = '';

        // tabs[this.state.tabIndex].tabName = 'Ask Matt';

        this.setState({
            optionsChanged: true,
            tabs: tabs,
        }, this.checkData);
    }
    onDataSelectChange(event) {
        // console.log('anatomy.onDataSelectChange', event);

        let tabs = this.state.tabs;
        tabs[this.state.tabIndex].dataId = Number(event);
        tabs[this.state.tabIndex].conditionId = '';
        tabs[this.state.tabIndex].muscleId = '';
        tabs[this.state.tabIndex].visualId = '';

        this.setState({
            optionsChanged: true,
            tabs: tabs,
        }, this.checkData);
    }
    onConditionSelectChange(value, text) {
        // console.log('anatomy.onConditionSelectChange', event);

        let tabs = this.state.tabs;
        tabs[this.state.tabIndex].conditionId = Number(value);
        tabs[this.state.tabIndex].muscleId = '';
        tabs[this.state.tabIndex].visualId = '';
        tabs[this.state.tabIndex].tabName = text;

        
        tabs[this.state.tabIndex].info.title = text;

        this.setState({
            optionsChanged: true,
            tabs: tabs,
        }, this.checkData);
    }
    onMuscleSelectChange(event) {
        // console.log('anatomy.onMuscleSelectChange', event);

        let tabs = this.state.tabs;
        tabs[this.state.tabIndex].muscleId = Number(event);

        this.setState({
            optionsChanged: true,
            tabs: tabs,
        }, this.checkData);
    }
    onVisualSelectChange(event) {
        // console.log('anatomy.onVisualSelectChange', event);

        let tabs = this.state.tabs;
        tabs[this.state.tabIndex].visualId = Number(event);

        this.setState({
            optionsChanged: true,
            tabs: tabs,
        }, this.checkData);
    }
    onDrugSelectChange(event) {
        // console.log('anatomy.onDrugSelectChange', event);

        let tabs = this.state.tabs;
        tabs[this.state.tabIndex].drugId = Number(event);

        this.setState({
            optionsChanged: true,
            tabs: tabs,
        }, this.checkData);
    }
    onMuscleViewClick(event, item) {
        let tabs = this.state.tabs;
        tabs[this.state.tabIndex].muscleViewId = Number(item.muscleId);

        this.setState({
            optionsChanged: true,
            tabs: tabs,
        }, this.checkData);
    }


    processPhysicians() {
        // console.log('processPhysicians');
        let temp = this.state.tempPhysicians;

        let physicians = [];

        physicians = temp;
        
    


        this.setState({
            tempPhysicians: [],
            dataPhysicians: physicians,

        }, this.checkData);
    }
    processConditions() {
        // console.log('processConditions');
        let temp = this.state.tempConditions;
        let physicians = this.state.dataPhysicians;

        // let data = {
        //     physicianId: body.physicianId,
        //     conditions: conditions,
        // }

        // res.json({
        //     // "body": JSON.stringify({ injections: injections.length }),
        //     "body": JSON.stringify({ 
        //         physician: data
        //     }),
        //     "message": "success",
        //     "isBase64Encoded": false
        // });

        console.log(temp);

        for (let i = 0; i < physicians.length; i++) {
            physicians[i].conditions = [];
            for( let c = 0; c < this.state.tempConditions.length; c++ ) {
                const condition = this.state.tempConditions[c];
                if (physicians[i].physicianId === condition.physicianId) {
                    physicians[i].conditions.push(condition);
                }
            }
        }

        this.setState({
            tempConditions: [],
            dataPhysicians: physicians,
        }, this.checkData);
    }

    processMuscles() {
        // console.log('processConditions');
        let temp = this.state.tempMuscles;
        let physicians = this.state.dataPhysicians;

        // ;
        // let data = {
        //     physicianId: body.physicianId,
        //     conditions: conditions,
        // }

        // res.json({
        //     // "body": JSON.stringify({ injections: injections.length }),
        //     "body": JSON.stringify({ 
        //         physician: data
        //     }),
        //     "message": "success",
        //     "isBase64Encoded": false
        // });

        console.log(temp);
        for (let i = 0; i < physicians.length; i++) {
    

            for (let c = 0; c < physicians[i].conditions.length; c++) {
                

                physicians[i].conditions[c].muscles = [];
                
                for (let m = 0; m < this.state.tempMuscles.length; m++) {
                    const muscle = this.state.tempMuscles[m];
                    if (physicians[i].physicianId === muscle.physicianId && physicians[i].conditions[c].conditionId === muscle.conditionId ) {
                        physicians[i].conditions[c].muscles.push(muscle);
                    }
                }
            }

            // for( let c = 0; c < this.state.tempConditions.length; c++ ) {

            //     const condition = this.state.tempConditions[c];
            //     if (physicians[i].physicianId === condition.physicianId) {
            //         physicians[i].conditions.push(condition);
            //     }
            // }
        }

        this.setState({
            tempMuscles: [],
            dataPhysicians: physicians,
        }, this.checkData);
    }

    processInjections() {
        console.log('processInjections');
        let temp = this.state.tempInjections;
        let physicians = this.state.dataPhysicians; 


        console.log(temp);


        for (let i = 0; i < physicians.length; i++) {
            if( this.state.tabs[this.state.tabIndex].physicianId === physicians[i].physicianId ) {
                console.log(physicians[i].physicianId );
                if( temp && temp.length > 0 ) {
                    if( physicians[i].injections && physicians[i].injections.length > 0 ) {
                        physicians[i].injections = physicians[i].injections.concat(temp);
                    }   
                    else {
                        physicians[i].injections = [];    
                        physicians[i].injections = physicians[i].injections.concat(temp);
                    }   
                }                
            }
        }

        this.setState({
            tempMuscles: [],
            dataPhysicians: physicians,
        }, this.checkData);
    }
    // processSessions() {
    //     // console.log('processSessions');
    //     let temp = this.state.tempSessions.patient;
    //     let physicians = this.state.dataPhysicians;

    //     // console.log('processSessions', temp);

    //     // let data = {
    //     //     physicianId: body.physicianId,
    //     //     conditionId: body.conditionId,
    //     //     patientid: body.patientId,
    //     //     sessions: sessions,
    //     // }
    //     // res.json({
    //     //     // "body": JSON.stringify({ injections: injections.length }),
    //     //     "body": JSON.stringify({ 
    //     //         patient: data
    //     //         // patients: patients
    //     //     }),
    //     //     "message": "success",
    //     //     "isBase64Encoded": false
    //     // });
    //     if (temp && temp.physicianId) {
    //         for (let p = 0; p < physicians.length; p++) {
    //             if (physicians[p].physicianId === temp.physicianId) {
    //                 for (let c = 0; c < physicians[p].conditions.length; c++) {
    //                     if (physicians[p].conditions[c].condition_id === temp.conditionId) {
    //                         for (let pa = 0; pa < physicians[p].conditions[c].patients.length; pa++) {
    //                             if (Number(physicians[p].conditions[c].patients[pa].patient_id) === Number(temp.patientId)) {
    //                                 if (temp.sessions && temp.sessions.length > 0) {
    //                                     physicians[p].conditions[c].patients[pa].sessions = temp.sessions;

                                    
    //                                     for (let s = 0; s < temp.sessions.length; s++) {

    //                                         if (temp.sessions[s].injections && temp.sessions[s].injections.length > 0) {
    //                                             console.log('injections', temp.sessions[s].injections.length);
    //                                         }

    //                                     }
                                        


    //                                 }
    //                                 else {
    //                                     physicians[p].conditions[c].patients[pa].sessions = null;
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     else {
    //         console.log('processSessions error invalid object', temp);
    //     }   


    //     this.setState({
    //         tempSessions: [],
    //         dataPhysicians: physicians,
    //     }, this.checkData);
    // }



    requestServerStatus() {
        console.log('requestServerStatus');
        let config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
        }
        axios.get(BASE_URL + '/status', config).then(function (response) {
            console.log('status', response);
            if (response.data.body) {
                let parsed = JSON.parse(response.data.body);

                if (parsed.server && parsed.database) {
                    console.log('server currently running, database currently running');
                    this.setState({ serverActive: true }, this.checkData);
                }
                else {
                    this.setState({ serverActive: false }, this.showServerError);
                }

            }
        }.bind(this)).catch(function (error) {
            console.log('Show error notification!')
            window.alert('Failed to download meta data', error);
            return Promise.reject(error)
        });
    }

    requestPhysicians() {
        this.setTaskPopup('request physician', 'Requesting data', 'Downloading Physician data please wait');
        
        let params = {};
        // console.log('requestPhysicians', params);
        let config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            params: params,
        }
        axios.get(BASE_URL + '/physicians', config).then(function (response) {
            console.log('$$$ physician', response);
            if (response.data.body) {
                let parsed = JSON.parse(response.data.body);
                let physicians = [];
                for (var i = 0; i < parsed.length; i++) {
                    // console.log(parsed.physicians[i]);
                    physicians.push({
                        physicianName: parsed[i].physicianName ? parsed[i].physicianName : 'No name provided by server',
                        physicianId: parsed[i].physicianId ? parsed[i].physicianId : 'No id provided by server',
                        injectionsCount: parsed[i].injectionsCount ? parsed[i].injectionsCount : 0,
                        conditions: [],
                    });
                }
                this.hideTaskPopup('request physician');
                this.setState({ tempPhysicians: physicians }, this.processPhysicians);
            }
        }.bind(this)).catch(function (error) {
            console.log('Show error notification!')
            this.hideTaskPopup('request physician');

            window.alert('Failed to download physician data', error);
            return Promise.reject(error)
        }.bind(this));
    }
    requestConditions(tab) {
        this.setTaskPopup('request condition', 'Requesting data', 'Downloading condition data please wait');

        let params = {
            physicianId: tab.physicianId
        };
        // console.log('requestConditions', params);
        let config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            params: params,
        }
        axios.get(BASE_URL + '/conditions', config).then(function (response) {
            // console.log('condition', response);
            if (response.data.body) {
                let parsed = JSON.parse(response.data.body);
                let conditions = parsed;
                for( var i = 0; i < conditions.length; i++ ) {
                    // console.log(parsed.physicians[i]);
                    conditions[i].muscles = [];
                    // physicians.push({
                    //     physicianName: parsed.physicians[i].physicianName ? parsed.physicians[i].physicianName : 'No name provided by server',
                    //     physicianId: parsed.physicians[i].physicianId ? parsed.physicians[i].physicianId : 'No id provided by server',
                    //     conditions: [],
                    // });
                }
                this.hideTaskPopup('request condition');
                this.setState({ tempConditions: conditions }, this.processConditions);
            }
        }.bind(this)).catch(function (error) {
            console.log('Show error notification!')
            this.hideTaskPopup('request condition');

            window.alert('Failed to download condition data', error);
            // return Promise.reject(error)
        });
    }
    requestMuscles(tab, condition) {
        let params = {
            physicianId: tab.physicianId,
            conditionId: tab.conditionId,
            // muscle: patient.patient_id,
        };
        // console.log('requestSessions', params);
        let config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            params: params,
        }
        axios.get(BASE_URL + '/muscles', config).then(function (response) {
            console.log('session', response);
            if (response.data.body) {
                let parsed = JSON.parse(response.data.body);
                let muscles = parsed;
           
                this.hideTaskPopup('request muscles');
                this.setState({ tempMuscles: muscles }, this.processMuscles);
            }
        }.bind(this)).catch(function (error) {
            console.log('Show error notification!')
            this.hideTaskPopup('request muscles');
            window.alert('Failed to download muscles data', error);
            // return Promise.reject(error)
        });
    }
    requestInjections(tab, start, limit) {
        let params = {
            start: start,
            limit: limit,
            physicianId: tab.physicianId,
            // conditionId: tab.conditionId,
            // muscleId: tab.muscleId,
        };
        console.log('requestSessions', params);
        let config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            params: params,
        }
        axios.get(BASE_URL + '/injections', config).then(function (response) {
            console.log('session', response);
            if (response.data.body) {
                let parsed = JSON.parse(response.data.body);
                let injections = parsed;
                // for( var i = 0; i < parsed.physicians.length; i++ ) {
                //     console.log(parsed.physicians[i]);
                //     physicians.push({
                //         physicianName: parsed.physicians[i].physicianName ? parsed.physicians[i].physicianName : 'No name provided by server',
                //         physicianId: parsed.physicians[i].physicianId ? parsed.physicians[i].physicianId : 'No id provided by server',
                //         conditions: [],
                //     });
                // }
                this.hideTaskPopup('request injections');
                this.setState({ tempInjections: injections }, this.processInjections);
            }
        }.bind(this)).catch(function (error) {
            console.log('Show error notification!')
            this.hideTaskPopup('request injections');
            window.alert('Failed to download injections data', error);
            // return Promise.reject(error)
        }.bind(this));
    }


    // requestSessions(tab, patient) {
    //     // this.setTaskPopup('request condition', 'Requesting data', 'Downloading condition data please wait');
    //     // let test = {
    //     //     patient: {
    //     //         physicianId: tab.physicianId,
    //     //         conditionId: tab.conditionId,
    //     //         patientId: patient.patient_id,
    //     //         sessions: [],
    //     //     }
    //     // }

    //     // this.setState({ tempSessions: test }, this.processSessions);

    //     let params = {
    //         physicianId: tab.physicianId,
    //         conditionId: tab.conditionId,
    //         patientId: patient.patient_id,
    //     };
    //     // console.log('requestSessions', params);
    //     let config = {
    //         headers: { 'Access-Control-Allow-Origin': '*' },
    //         params: params,
    //     }
    //     axios.get(BASE_URL + '/session', config).then(function (response) {
    //         // console.log('session', response);
    //         if (response.data.body) {
    //             let parsed = JSON.parse(response.data.body);
    //             let sessions = parsed;
    //             // for( var i = 0; i < parsed.physicians.length; i++ ) {
    //             //     console.log(parsed.physicians[i]);
    //             //     physicians.push({
    //             //         physicianName: parsed.physicians[i].physicianName ? parsed.physicians[i].physicianName : 'No name provided by server',
    //             //         physicianId: parsed.physicians[i].physicianId ? parsed.physicians[i].physicianId : 'No id provided by server',
    //             //         conditions: [],
    //             //     });
    //             // }
    //             this.hideTaskPopup('request session');
    //             this.setState({ tempSessions: sessions }, this.processSessions);
    //         }
    //     }.bind(this)).catch(function (error) {
    //         console.log('Show error notification!')
    //         this.hideTaskPopup('request session');
    //         window.alert('Failed to download condition data', error);
    //         // return Promise.reject(error)
    //     });
    // }

    render() {
        return (
            <div className="route-anatomy">
                <div className="route-nav">
                    <Nav />
                </div>
                <div className="route-tabs">
                    {this.state.mapTabButtons}
                    <div className="tab-add" onClick={this.addTab}>
                        +
                    </div>
                    <div className="tab-add" onClick={this.compareTabs}>
                        compare
                    </div>

                </div>
                <div id="route-content" className="route-content">
                    {this.state.mapTabs}
                </div>
                <TaskPopup type={this.state.currentTask.type} task={this.state.currentTask.task} message={this.state.currentTask.message}/>
            </div>
        )
    }
}