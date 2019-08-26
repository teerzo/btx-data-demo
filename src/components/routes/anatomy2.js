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
import Nav from '../nav';
import AnatomyTabs from '../shared/anatomyTabs';
import Heatmap from '../heatmap';

// css
import '../../styles/anatomy/desktop.scss';
import '../../styles/anatomy/mobile.scss';
import '../../styles/anatomy/anatomy-inner.scss';


// data
// import dataInjections from '../../data/injections.js';
import dataMuscles from '../../data/muscles';

// imgs
import tempImg from '../../images/temp.png';

export default class Anatomy extends React.Component {
    constructor(props) {
        super(props);

        /// TO DELETE 
        this.toggleShowBg = this.toggleShowBg.bind(this);


        this.initialize = this.initialize.bind(this);

        // resize functions
        this.initResizeListeners = this.initResizeListeners.bind(this);
        this.resizeEnd = this.resizeEnd.bind(this);

        // helper
        this.openMuscleById = this.openMuscleById.bind(this);




        // main functions 
        this.initMuscleData = this.initMuscleData.bind(this);
        this.initMuscleHtmlData = this.initMuscleHtmlData.bind(this);


        this.selectCondition = this.selectCondition.bind(this);

        // meta data?

        this.getConditionMetadata = this.getConditionMetadata.bind(this);
        this.getMuscleMetadata = this.getMuscleMetadata.bind(this);
        // this.getMetaData = this.getMetaData.bind(this);
        // this.processMetaData = this.processMetaData.bind(this);

        // injection data
        this.getInjectionData = this.getInjectionData.bind(this);
        this.processStateChange = this.processStateChange.bind(this);
        this.processInjectionData = this.processInjectionData.bind(this);

        this.checkMuscleInjections = this.checkMuscleInjections.bind(this);

        this.clearHeatmap = this.clearHeatmap.bind(this);
        this.processHeatmapData = this.processHeatmapData.bind(this);

        this.setHeatmapDefaults = this.setHeatmapDefaults.bind(this);
        this.updateHeatmapValues = this.updateHeatmapValues.bind(this);


        // Updating dom content 
        this.updateDataTable = this.updateDataTable.bind(this);

        this.toggleDataTableView = this.toggleDataTableView.bind(this);
        this.toggleDataTableFull = this.toggleDataTableFull.bind(this);


        // this.processHtmlData = this.processHtmlData.bind(this);


        this.getMuscleItemById = this.getMuscleItemById.bind(this);
        this.onMuscleViewClick = this.onMuscleViewClick.bind(this);
        this.onDataSelectorChange = this.onDataSelectorChange.bind(this);
        this.onConditionSelectorChange = this.onConditionSelectorChange.bind(this);
        this.onMuscleSelectorChange = this.onMuscleSelectorChange.bind(this);
        this.toggleMobilePanelMenu = this.toggleMobilePanelMenu.bind(this);
        this.hideMobilePanelMenu = this.hideMobilePanelMenu.bind(this);

        this.state = {

            showBg: true,

            debug: true,
            debugResize: true,

            // resize variables
            resizing: false,

            // dom variables
            heatmapMaximum: 2,
            heatmapRadius: 10,
            heatmapBlur: 2,


            

            tabIndex: 0,
            tabObject: {
                tabName: '',
                conditionName: '',
                visualName: '',

                currentPhysicianId: null,
                dataValue: null,
                conditionValue: null,
                muscleValue: null,
                visualValue: null,
                drugValue: null,
            },
            tabs: [
                {
                    tabName: 'Blank tab',
                    conditionName: 'No condition selected',
                    visualName: 'No data visualization selected',

                    currentPhysicianId: null,
                    dataValue: '',
                    conditionValue: '',
                    muscleValue: '',
                    visualValue: '',
                    drugValue: '',

                    dataCurrentConditionMeta: null,
                    dataCurrentMuscleMeta: null,

                }
            ],
            dataPhysicians: [
                {
                    physicianId: null,
                    conditions: [
                        {
                            conditionId: null,
                            muscles: [
                                {
                                    muscleId: null,
                                    sessions: [
                                        {
                                            sessionId: null,
                                            injections: [
                                                {
                                                    injectionId: null
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                        }
                    ],
                }
            ],




            dataCurrentInjections: [],

            // data
            dataMeta: [],
            dataInjections: [],
            dataMuscles: [],

            // domData
            domDataMuscles: [],

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

    toggleShowBg() {

        let value = this.state.showBg ? false : true;

        console.log(value);

        this.setState({ showBg: value });
    }

    componentDidMount() {
        let that = this;
        this.initialize();
    };

    initialize() {
        var that = this;
        this.setHeatmapDefaults();
        this.initResizeListeners();
        this.initTabs();
        // trigger resize 
        this.resizeEnd(null);
    };


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

        if (contentWidth >= 1000) {
            that.hideMobilePanelMenu();
        }

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
        console.log('resize', JSON.stringify(mainImageSize));
        // that.setState({ resizing: false, mainImageSize: { x: mainImageSize.x, y: mainImageSize.y } }, that.processStateChange);
        that.setState({ resizing: false, mainImageSize: { x: mainWidth, y: mainHeight } }, that.processStateChange);
    }

    initTabs() {
        var tabs = [];
        var tab = this.state.tabObject;

        tab.tabName = 'Blank tab';
        tab.conditionName = 'No condition selected';
        tab.visualName = 'No data visualization selected';
        tab.dataValue = '';
        tab.conditionValue = '';
        tab.muscleValue = '';
        tab.visualValue = '';
        tab.drugValue = '';

        tabs.push(tab);
        this.setState({ tabs: tabs, tabIndex: 0 });
    }

    openMuscleById(muscleId, viewId) {

        this.setState({ processingData: true });

        var muscle = null;
        var muscleView = null;

        if (muscleId !== undefined && muscleId !== null) {
            muscle = this.getMuscleItemById(muscleId);
            muscleView = muscle.muscles[0];
        }
        else if (viewId !== undefined && viewId !== null) {
            muscle = this.getMuscleByViewId(Number(viewId));
            muscleView = this.getMuscleViewItemById(Number(viewId));
            console.log('muscles', muscle, muscleView);

        }
        if (viewId === null) {
            muscleView = {
                muscleId: null,
            };
        }

        console.log('openMuscleById', muscleId, viewId);
        console.log('muscles', muscle, muscleView);

        if (muscle !== undefined && muscle !== null) {
            // console.log('selected muscled', muscle);
            if (muscleView === undefined || muscleView === null) {
                // console.log('currentViewId', muscle.muscles[0].muscleId);
                // muscleView = muscle.muscles[0];
            }
            //  console.log('openMuscleById new ids', muscle.id, muscleView.id );

            var muscleImgOverlay = null;
            var muscleImgBg = null;
            if (muscle && muscleView) {
                muscleImgOverlay = muscleView.muscleImgOverlay;
                muscleImgBg = muscleView.muscleImgBg;
            }
            else {
                muscleImgOverlay = tempImg;
                muscleImgBg = tempImg;
            }

            this.setState({ domVarCurrentMuscle: muscle, currentMuscleId: muscle.id, currentViewId: muscleView.muscleId, currentMuscleImageBg: muscleImgBg, currentMuscleImageOverlay: muscleImgOverlay }, this.processStateChange);
            // this.setState({ currentMuscleId:muscleId, currentViewId: viewId, currentMuscleImageBg: muscleImgBg, currentMuscleImageOverlay: muscleImgOverlay }, this.getInjectionData);
        }
        else {
            // console.log('cannot select muscle, filtered list not yet loaded');
            this.setState({ processingData: false });
        }
    }




    changeMuscleView() {
        // console.log('changeMuscleView');


    };




    // resize functions


    getMuscleItemById(id) {
        // console.log('getMuscleItemById, ' + id);
        if (this.state.domDataMuscles && this.state.domDataMuscles.length > 0) {
            // initial values for start, middle and end
            let start = 0
            let stop = this.state.domDataMuscles.length - 1
            let middle = Math.floor((start + stop) / 2)

            // While the middle is not what we're looking for and the list does not have a single item
            while (this.state.domDataMuscles[middle].id !== Number(id) && start < stop) {
                if (id < this.state.domDataMuscles[middle].id) {
                    // console.log('binary down');
                    stop = middle - 1
                } else {
                    // console.log('binary up');

                    start = middle + 1
                }

                // recalculate middle on every iteration
                middle = Math.floor((start + stop) / 2)
            }
            // console.log('end?', dataMuscles.data[middle].muscleId);
            return this.state.domDataMuscles[middle];

            // if the current middle item is what we're looking for return it's index, else return -1
            // return (dataMuscles.data[middle].muscleId !== id) ? -1 : middle
        }
    }
    getMuscleByViewId(id) {
        // console.log('getMuscleByViewId, ' + id);
        console.log(this.state.domDataMuscles);
        ;
        if (this.state.domDataMuscles && this.state.domDataMuscles.length > 0) {
            var muscle = null;
            for (var m = 0; m < this.state.domDataMuscles.length; m++) {
                if (this.state.domDataMuscles[m].muscles && this.state.domDataMuscles[m].muscles.length > 0) {
                    for (var mv = 0; mv < this.state.domDataMuscles[m].muscles.length; mv++) {
                        // console.log( 'check me please', this.state.domDataMuscles[m].muscles[mv].muscleId , id);
                        if (this.state.domDataMuscles[m].muscles[mv].muscleId === id) {
                            // console.log('found it ');
                            muscle = this.state.domDataMuscles[m];
                        }
                    }
                }
            }
            return muscle;
        }
    }

    getMuscleViewItemById(id) {
        // console.log('getMuscleViewItemById, ' + id);
        if (this.state.domDataMuscles && this.state.domDataMuscles.length > 0) {
            var muscleView = null;
            for (var m = 0; m < this.state.domDataMuscles.length; m++) {
                if (this.state.domDataMuscles[m].muscles && this.state.domDataMuscles[m].muscles.length > 0) {
                    for (var mv = 0; mv < this.state.domDataMuscles[m].muscles.length; mv++) {
                        // console.log( 'check me please', this.state.domDataMuscles[m].muscles[mv].muscleId , id);
                        if (this.state.domDataMuscles[m].muscles[mv].muscleId === id) {
                            // console.log('found it ');
                            muscleView = this.state.domDataMuscles[m].muscles[mv];
                        }
                    }
                }
            }
            return muscleView;
        }
    }







    onMuscleViewClick(event, item) {
        // console.log('onMuscleViewClick', event.target.value, item);

        this.openMuscleById(null, item.muscleId);

        // var muscleImgOverlay = null;
        // var muscleImgBg = null;
        // if (item) {
        //     muscleImgOverlay = item.muscleImgOverlay;
        //     muscleImgBg = item.muscleImgBg;
        // }
        // else {
        //     muscleImgOverlay = tempImg;
        //     muscleImgBg = tempImg;
        // }

        // this.setState({ currentViewId: item.muscleId, currentMuscleImageBg: muscleImgBg, currentMuscleImageOverlay: muscleImgOverlay }, this.changeMuscleView);
    }
    onDataSelectorChange(event, item) {
        // console.log(event.target);
        var data = '';
        if (event.target.value === '1') {
            data = 'My data';
        }
        else if (event.target.value === '2') {
            data = 'All data';
        }

        var tabs = this.state.tabs;
        tabs[this.state.tabIndex].dataValue = event.target.value;

        this.setState({ tabs: tabs });
    }

    onConditionSelectorChange(event, item) {
        console.log(event.target);
        var conditionName = '';
        if (event.target.value === '2') {
            conditionName = 'Hemifacial spasm';
        }
        else if (event.target.value === '1') {
            conditionName = 'Belphrospasm';
        }
        else if (event.target.value === '5') {
            conditionName = 'Other';
        }

        var tabs = this.state.tabs;
        tabs[this.state.tabIndex].conditionValue = event.target.value;
        tabs[this.state.tabIndex].conditionName = conditionName;

        this.setState({ tabs: tabs }, this.selectCondition);
    }

    onMuscleSelectorChange(event, item) {
        var that = this;
        // console.log('onMuscleSelectorChange', event.target.value, item);

        // // BASE MUSCLE SELECTOR
        // var tabs = this.state.tabs;
        // tabs[this.state.tabIndex].muscleValue = event.target.value;
        // tabs[this.state.tabIndex].muscleName = event.nativeEvent.target[event.nativeEvent.target.selectedIndex].text
        // var callback = function() {
        //     that.openMuscleById(tabs[that.state.tabIndex].muscleValue, null)
        // }   
        // this.setState({tabs: tabs}, callback); 


        // CHILD MUSCLE SELECTOR
        var tabs = this.state.tabs;
        tabs[this.state.tabIndex].muscleValue = event.target.value;
        tabs[this.state.tabIndex].muscleName = event.nativeEvent.target[event.nativeEvent.target.selectedIndex].text
        var callback = function () {
            that.openMuscleById(null, tabs[that.state.tabIndex].muscleValue)
        }
        this.setState({ tabs: tabs }, callback);
    }

    toggleMobilePanelMenu() {
        // console.log('toggleMobilePanelMenu', !this.state.panelMenu);
        const state = !this.state.panelMenu;
        this.setState({ panelMenu: state });
    }
    hideMobilePanelMenu() {
        // console.log('hideMobilePanelMenu');
        const state = false;
        this.setState({ panelMenu: state });
    }

    selectCondition() {
        var that = this;
        var params = {
            treating_physician_id: 24,
            dataId: this.state.tabs[this.state.tabIndex].dataValue,
            conditionId: this.state.tabs[this.state.tabIndex].conditionValue,
        };
        if (params.conditionId !== null) {
            // this.setState({ processingData: true });
            this.getConditionMetadata(params, function (dataMeta) {
                console.log('getMetaData success', dataMeta);
                that.initMuscleData(dataMeta, function () {
                    // console.log('initMuscleData callback');
                    that.initMuscleHtmlData(function () {
                        // console.log('initMuscleHtmlData callback -- setting default muscle ', defaultMuscleId, defaultViewId);
                        that.resizeEnd(event);
                        // that.openMuscleById(defaultMuscleId, defaultViewId);
                    });
                });
            });
        }
    };

    getConditionMetadata(params, callback) {
        console.log('getConditionMetadata', params);
        var that = this;
        var base = 'https://dlwca3zy2e.execute-api.us-east-1.amazonaws.com/dev'
        var config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            params: params,
        }
        axios.get(base + '/condition/metadata', config).then(function (response) {
            console.log('metadata', response);
            if (response.data.body) {
                var parsed = JSON.parse(response.data.body);
                // console.log(parsed);
                var tabs = that.state.tabs;
                tabs[that.state.tabIndex].dataCurrentConditionMeta = parsed;

                that.setState({ tabs: tabs });
                if (callback) {
                    callback(parsed);
                }
            }
        }).catch(function (error) {
            console.log('Show error notification!')
            window.alert('Failed to download meta data', error);
            return Promise.reject(error)
        });
    }
    getMuscleMetadata(params, callback) {
        console.log('getMuscleMetadata', params);
        var that = this;
        var base = 'https://dlwca3zy2e.execute-api.us-east-1.amazonaws.com/dev'
        var config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            params: params,
        }
        axios.get(base + '/muscle/metadata', config).then(function (response) {
            console.log('metadata', response);
            if (response.data.body) {
                var parsed = JSON.parse(response.data.body);
                // console.log(parsed);
                var tabs = that.state.tabs;
                tabs[that.state.tabIndex].dataCurrentConditionMeta = parsed;

                that.setState({ tabs: tabs });
                if (callback) {
                    callback(parsed);
                }
            }
        }).catch(function (error) {
            console.log('Show error notification!')
            window.alert('Failed to download injection data', error);
            return Promise.reject(error)
        });
    }

    getMetaData(params, callback) {
        console.log('getMetaData', params);
        var that = this;
        var base = 'https://dlwca3zy2e.execute-api.us-east-1.amazonaws.com/dev'
        var config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            params: params,
        }
        axios.get(base + '/metadata', config).then(function (response) {
            console.log('metadata', response);

            if (response.data.body) {
                var parsed = JSON.parse(response.data.body);
                // console.log(parsed);
                that.setState({ dataMeta: parsed.meta });
                if (callback) {
                    callback(parsed.meta);
                }
            }
        }).catch(function (error) {
            console.log('Show error notification!')
            window.alert('Failed to download meta data', error);
            return Promise.reject(error)
        });
    }

    getInjectionData(params, callback) {
        // console.log('getInjectionData', params);


        var that = this;
        var base = 'https://dlwca3zy2e.execute-api.us-east-1.amazonaws.com/dev'
        var config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            params: params,
            paramsSerializer: params => {
                return qs.stringify(params)
            }
        }
        axios.get(base + '/injection', config).then(function (response) {
            console.log('injection', response);

            if (response.data.body) {
                var parsed = JSON.parse(response.data.body);
                var getOther = false;

                // $$$
                console.log('$$$', domVarMuscleValues);

                var domVarMuscleValues = that.state.domVarMuscleValues;
                domVarMuscleValues.numOfPatients = parsed.meta.numberOfPatients;
                domVarMuscleValues.numOfSessions = parsed.meta.numberOfSessions;
                console.log('$$$ after', domVarMuscleValues);


                that.setState({ domVarMuscleValues: domVarMuscleValues, dataCurrentInjections: parsed.injections });
                if (callback) {
                    callback(response.data.body);
                }

                // // parsed.injections;
                // if( parsed.injections && parsed.injections.length > 0 ) {
                //     console.log('muscles ', params.muscleId, parsed.injections.length);                    
                // }

                // if( Number(params.muscleId) === 16 && getOther === false) {
                //     getOther = true;
                //     params.muscleId = 17;
                //     that.getInjectionData(params, function (success) {
                //         var parsed2 = JSON.parse(success);
                //         parsed.injections = parsed.injections.concat(parsed2.injections);
                //         console.log('muscles 2', parsed.injections.length);
                //         var stringy = JSON.stringify(parsed);

                //         that.setState({ dataCurrentInjections: parsed.injections });
                //         if (callback) {
                //             callback(stringy);
                //         }
                //     });
                // }
                // else if( Number(params.muscleId) === 17 && getOther === false) {
                //     if (callback) {
                //         callback(response.data.body);
                //     }
                // //     getOther = true;
                // //     var newParsed = [];
                // //     newParsed = parsed.injections.concat();
                // //     params.muscleId = 16;
                // //     that.getInjectionData(params, function (success) {
                // //         that.setState({ dataInjections: newParsed });
                // //         if (callback) {
                // //             callback(response.data.body);
                // //         }
                // //     });
                // }
                // else {
                //     that.setState({ dataCurrentInjections: parsed.injections });
                //     if (callback) {
                //         callback(response.data.body);
                //     }
                // }
            }

            //  var injections = response.data.map(function(item, key){
            //     console.log(item);
            // });
            // that.setState({articles:articles});
        }).catch(function (error) {
            console.log('Show error notification!')
            window.alert('Failed to download injection data', error);
            return Promise.reject(error)
        });
    }

    processStateChange() {
        var that = this;
        this.updateDataTable();
        this.clearHeatmap();

        var tab = this.state.tabs[this.state.tabIndex];
        var params = {
            treating_physician_id: 24,
            dataId: tab.dataValue ? tab.dataValue : null,
            conditionId: tab.conditionValue ? tab.conditionValue : null,
            muscleId: tab.muscleValue ? Number(tab.muscleValue) : null,
            visualId: tab.visualValue ? tab.visualValue : null,
            muscles: [],
        };

        // if( params.muscleId ) {
        //     for( var i = 0; i < this.state.domDataMuscles.length; i++ ) {
        //         console.log(this.state.domDataMuscles[i].id, params.muscleId);
        //         if( this.state.domDataMuscles[i].id === params.muscleId ) {
        //             for( var m = 0; m < this.state.domDataMuscles[i].muscles.length; m++ ) {
        //                 params.muscles.push(this.state.domDataMuscles[i].muscles[m].muscleId.toString());
        //             } 
        //         }
        //     }            
        // }

        if (params.muscleId) {
            for (var i = 0; i < this.state.domDataMuscles.length; i++) {
                for (var m = 0; m < this.state.domDataMuscles[i].muscles.length; m++) {
                    console.log(this.state.domDataMuscles[i].id, params.muscleId);
                    if (this.state.domDataMuscles[i].muscles[m].muscleId === params.muscleId) {
                        params.muscles.push(this.state.domDataMuscles[i].muscles[m].muscleId.toString());
                    }
                }
            }
        }


        ;

        return new Promise(function (resolve, reject) {
            // check if condition meta available 
            // else download 
            if (tab.dataCurrentConditionMeta) {
                console.log('processStateChange - condition meta already downloaded');
                resolve();
            }
            else {
                if (params.dataId && params.conditionId) {
                    console.log('processStateChange - condition meta downloading');
                    that.getConditionMetadata(params, function (result) {
                        console.log('getConditionMetadata success', result);
                        tab.dataCurrentConditionMeta = result;
                        resolve();
                    });
                }
            }
        })
            // .then(function(result) {
            //     // check if muscle meta available 
            //     // else download 
            //     if( tab.dataCurrentMuscleMeta ) {
            //         console.log('processStateChange - muscle meta already downloaded');
            //         resolve();
            //     }
            //     else {
            //         if( params.dataId && params.conditionId && params.muscles.length > 0 ) {
            //             console.log('processStateChange - muscle meta downloading');

            //             that.getMuscleMetadata(params, function (result) {
            //                 console.log('getMuscleMetadata success', result);
            //                 tab.dataCurrentMuscleMeta = result;
            //                 resolve();
            //             });
            //         }
            //     }
            // })
            .then(function (result) {
                // check if injection data available 
                // else download
                console.log('1');
                if (tab.dataCurrentConditionMeta) { //&& tab.dataCurrentMuscleMeta ) {
                    console.log('2');
                    if (tab.dataCurrentInjections) {
                        console.log('3');
                        console.log('processStateChange - injections already downloaded');
                    }
                    else {
                        console.log('4');
                        console.log('processStateChange - injections downloading');
                        if (params.muscles && params.muscles.length > 0) {

                            console.log(params.muscles);
                            ;



                            that.getInjectionData(params, function (result) {
                                // that.processInjectionData(result.injections);
                                // that.initMuscleHtmlData();
                            });
                        }
                    }
                }
                else {
                    console.log('processStateChange - meta data missing skipping injections check');
                }

                window.setTimeout(function () {
                    that.setState({ processingData: false });
                }, 500);
            })
            .catch(function (err) {
                console.log(err)
            });
    }


    initMuscleData(metadata, callback) {
        // console.log('loadDataMuscles');

        var data = metadata.muscles;

        var newList = [];
        var newInjectedList = [];
        if (dataMuscles && dataMuscles.data) {
            let sortedList = dataMuscles.data.sort(function (a, b) {
                let aa = a.muscleName;
                let bb = b.muscleName;
                if (aa < bb) { return -1 }
                if (aa > bb) { return 1 }
                return 0;
            });

            var domDataMuscles = [];

            // Setup base muscle
            for (var i = 0; i < sortedList.length; i++) {
                var baseMuscle = sortedList[i];
                var match = false;


                for (var m = 0; m < domDataMuscles.length; m++) {
                    var muscle = domDataMuscles[m];
                    if (baseMuscle.muscleName === muscle.muscleName) {
                        match = true;
                    }
                }
                if (!match) {
                    var item = {
                        // muscleId: sortedList[m].muscleId,
                        id: domDataMuscles.length,
                        muscleName: baseMuscle.muscleName,
                        muscles: [],

                        injectionCount: 0,
                        injectionAverage: 0,
                        botoxAverage: 0,
                        dysportAverage: 0,

                        // sessions: [],
                    };
                    domDataMuscles.push(item);
                }
            }

            // Setup children muscles
            for (var i = 0; i < sortedList.length; i++) {
                var baseMuscle = sortedList[i];
                for (var m = 0; m < domDataMuscles.length; m++) {
                    var muscle = domDataMuscles[m];

                    if (baseMuscle.muscleName === muscle.muscleName) {
                        var newChildMuscleName = muscle.muscleName;
                        if (baseMuscle.lateralPositionSet[0].lateralPositionCode === 'L' || baseMuscle.lateralPositionSet[0].lateralPositionCode === 'R') {
                            newChildMuscleName += ' ' + baseMuscle.lateralPositionSet[0].lateralPositionCode;
                        }

                        var newChildMuscle = {
                            muscleName: newChildMuscleName,
                            muscleId: baseMuscle.muscleId,
                            muscleImgBg: baseMuscle.lateralPositionSet[0].muscleImageData[0].backgroundImageFile,
                            muscleImgOverlay: baseMuscle.lateralPositionSet[0].muscleImageData[0].overlayImageFile,

                            sessions: [],
                        }
                        muscle.muscles.push(newChildMuscle);

                    }
                }
            }

            // match meta data to muscles
            // console.log('START', domDataMuscles.length, data.length);


            for (var bm = 0; bm < domDataMuscles.length; bm++) {
                var baseMuscle = domDataMuscles[bm];
                for (var dm = 0; dm < data.length; dm++) {

                    // console.log(baseMuscle, data[dm]);
                    for (var m = 0; m < baseMuscle.muscles.length; m++) {
                        var muscle = baseMuscle.muscles[m];

                        if (muscle.muscleId === data[dm].muscleId) {
                            muscle.injectionCount = data[dm].injectionCount;
                            baseMuscle.injectionCount += data[dm].injectionCount;
                        }
                    }
                }
            }


            // // BASE MUSCLE SELECT
            // var domSelectMuscles = [];
            // // setup dom select muscles 
            // for (var i = 0; i < domDataMuscles.length; i++) {

            //     // console.log(domDataMuscles[i]);
            //     if (domDataMuscles[i].injectionCount !== 0) {
            //         domSelectMuscles.push(domDataMuscles[i]);
            //     }
            // }

            // // console.log('muscles',domSelectMuscles.length);
            // var domSelectMuscles = domSelectMuscles.map(function (item, key) {
            //     return (<option key={key} value={item.id} > {item.muscleName} {item.injectionCount} </option>)
            // });

            // CHILD MUSCLE SELECT
            var domSelectMuscles = [];
            // setup dom select muscles 
            for (var i = 0; i < domDataMuscles.length; i++) {
                for (var m = 0; m < domDataMuscles[i].muscles.length; m++) {
                    // console.log(domDataMuscles[i]);
                    if (domDataMuscles[i].muscles[m].injectionCount !== 0) {
                        domSelectMuscles.push(domDataMuscles[i].muscles[m]);
                    }
                }
            }

            // console.log('muscles',domSelectMuscles.length);
            var domSelectMuscles = domSelectMuscles.map(function (item, key) {
                return (<option key={key} value={item.muscleId} > {item.muscleName} {item.injectionCount} </option>)
            });
        }

        this.setState({
            // currentViewId: domDataMuscles[0].muscles[0].muscleId,
            domSelectMuscles: domSelectMuscles,
            domDataMuscles: domDataMuscles
        }, callback);
    };

    initMuscleHtmlData(callback) {
        var that = this;

        var domMuscleViews = [];

        if (this.state.domDataMuscles[this.state.currentMuscleId] && this.state.domDataMuscles[this.state.currentMuscleId].muscles.length > 0) {
            // console.log('process id ', this.state.currentMuscleId);
            var newMuscleViews = this.state.domDataMuscles[this.state.currentMuscleId].muscles;
            // console.log()
            var domMuscleViews = [];
            for (var i = 0; i < this.state.domDataMuscles[this.state.currentMuscleId].muscles.length; i++) {
                if (this.state.domDataMuscles[this.state.currentMuscleId].muscles[i].injectionCount !== 0) {
                    domMuscleViews.push(this.state.domDataMuscles[this.state.currentMuscleId].muscles[i]);
                }
            }

            // if( this.state.currentViewId === null ) {
            //     console.log(domMuscleViews[0].muscleId);
            //     this.setState({currentViewId: domMuscleViews[0].muscleId});
            // }

            domMuscleViews = domMuscleViews.map(function (item, key) {
                var onClick = function (event) {
                    that.onMuscleViewClick(event, item);
                    // that.props.router.navigate('adminArticle', {id: item.articleId});
                }
                return (
                    <div key={key} onClick={onClick} className={that.state.currentViewId === item.muscleId ? 'view active' : 'view'}>
                        <div className="inner">

                            {/*<img src={item.muscleImgBg} className="img" style={ { backgroundImage: `url("images/img.svg")` } } />*/}
                            <img src={item.muscleImgOverlay} className="img" style={{ backgroundImage: 'url(' + item.muscleImgBg + ')' }} />
                            {/*{item.muscleId} - {item.injectionCount}*/}
                        </div>
                    </div>
                )
            });

            // console.log('muscles views', newMuscleViews);
            // if( this.state.currentMuscleId ) {
            console.log('item', this.state.domDataMuscles[0]);
        }
        var newInjectedList = []; // this.state.domDataMuscles[this.state.currentMuscleId].dataCurrentConditionMeta.map(function (item, key) {

        //     var onClick = function (event) {
        //         // that.onMuscleViewClick(event, item)
        //         that.openMuscleById(item.id, null)
        //         // that.props.router.navigate('adminArticle', {id: item.articleId});
        //     }


        //     return ((
        //         item.injectionCount !== 0 ?
        //             <tr key={key} className="vis">
        //                 <td className="table-link" onClick={onClick}> {item.muscleName} </td>
        //                 <td> {item.injectionAverage} </td>
        //                 <td> {item.botoxAverage} </td>
        //                 <td> {item.dysportAverage} </td>
        //             </tr>
        //             : null
        //             /*<tr key={key} className="hide">
        //                 <td className="table-link"> {item.muscleName} </td>
        //                 <td> {item.injectionAverage} </td>
        //                 <td> {item.botoxAverage} </td>
        //                 <td> {item.dysportAverage} </td>
        //             </tr>*/
        //     ))
        // });
        this.setState({ domMuscleViews: domMuscleViews, domMetaList: newInjectedList }, callback);
    };


    processInjectionData(data) {
        // console.log('processInjectionData', data);

        var domDataMuscles = this.state.domDataMuscles;
        if (domDataMuscles && domDataMuscles.length > 0) {
            // Setup sessions 
            if (data !== null) {

                for (var bm = 0; bm < domDataMuscles.length; bm++) {
                    var baseMuscle = domDataMuscles[bm];
                    for (var m = 0; m < baseMuscle.muscles.length; m++) {
                        var muscle = baseMuscle.muscles[m];
                        for (var i = 0; i < data.length; i++) {
                            var injection = data[i];
                            if (muscle.muscleId === Number(injection.muscle_image_id)) {

                                var sessionMatch = false;
                                for (var s = 0; s < muscle.sessions.length; s++) {
                                    var session = muscle.sessions[s];
                                    if (session.session_id && injection.session_id) {
                                        sessionMatch = true;
                                    }
                                }
                                if (!sessionMatch) {
                                    var newSession = {
                                        session_id: injection.session_id,
                                        injections: [],
                                    };
                                    muscle.sessions.push(newSession);
                                }
                            }

                        }
                    }
                    // domDataMuscles[m] = baseMuscle;
                }

                // Setup injections
                for (var bm = 0; bm < domDataMuscles.length; bm++) {
                    var baseMuscle = domDataMuscles[bm];
                    for (var m = 0; m < baseMuscle.muscles.length; m++) {
                        var muscle = baseMuscle.muscles[m];
                        for (var i = 0; i < data.length; i++) {
                            var injection = data[i];
                            if (muscle.muscleId === Number(injection.muscle_image_id)) {
                                for (var s = 0; s < muscle.sessions.length; s++) {
                                    var session = muscle.sessions[s];

                                    if (session.injections && session.injections.length > 0) {
                                        var iiMatch = false;
                                        for (var ii = 0; ii < session.injections.length; ii++) {
                                            console.log('adding new injection');

                                            if (session.session_id === injection.session_id) {
                                                if (session.injections[ii].injection_id === injection.injection_id) {
                                                    iiMatch = true;
                                                }
                                            }
                                        }
                                        if (!iiMatch) {
                                            var newInjection = {
                                                injection_id: injection.injection_id,
                                                injection_medication_name: injection.injection_medication_name,
                                                injection_medication_id: injection.injection_medication_id,
                                                injection_medication_amount: injection.injection_medication_amount,
                                                injection_medication_amount_unit_code: injection.injection_medication_amount_unit_code,
                                                injection_x_point: injection.injection_x_point,
                                                injection_y_point: injection.injection_y_point,
                                            };
                                            session.injections.push(newInjection);
                                        }
                                    }
                                    else {
                                        if (session.session_id === injection.session_id) {
                                            var newInjection = {
                                                injection_id: injection.injection_id,
                                                injection_medication_name: injection.injection_medication_name,
                                                injection_medication_id: injection.injection_medication_id,
                                                injection_medication_amount: injection.injection_medication_amount,
                                                injection_medication_amount_unit_code: injection.injection_medication_amount_unit_code,
                                                injection_x_point: injection.injection_x_point,
                                                injection_y_point: injection.injection_y_point,
                                            };
                                            session.injections.push(newInjection);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {

            }

            this.setState({
                domDataMuscles: domDataMuscles,
                dataInjections: data,
                // }, this.processHtmlData);
            }, this.processHeatmapData);
        }
    }

    checkMuscleInjections(id, viewId) {
        var currentMuscle = this.getMuscleViewItemById(viewId);
        if (currentMuscle && currentMuscle.sessions && currentMuscle.sessions.length > 0) {
            return true;
        }
        return false;
        // }
    }

    clearHeatmap() {
        var scatterplot = d3.select("div#scatterplot").html("");
        var heatchart = d3.select("div#heatchart").html("");
    }

    processHeatmapData() {
        console.log('processHeatmapData');
        this.clearHeatmap();
        var that = this;


        if (this.state.mainImageSize.x <= 0 || this.state.mainImageSize.y <= 0) {
            // if window hasn't resized yet skip
            return;
        }

        // current muscle id, view id,
        var id = this.state.currentMuscleId;
        var viewId = this.state.currentViewId;

        var currentMuscle = this.getMuscleViewItemById(viewId);
        if (currentMuscle && currentMuscle.sessions && currentMuscle.sessions.length > 0) {
            const width = this.state.mainImageSize.x;
            const height = this.state.mainImageSize.y;
            var data = [];

            for (var s = 0; s < currentMuscle.sessions.length; s++) {
                var session = currentMuscle.sessions[s];
                console.log(session);
                for (var i = 0; i < session.injections.length; i++) {
                    var injection = session.injections[i];
                    var arr = [
                        injection.injection_x_point * this.state.mainImageSize.x,
                        injection.injection_y_point * this.state.mainImageSize.y,
                        1,
                    ];
                    data.push(arr);
                }
            }
            console.log('adding ', data.length, 'points to heatmap');

            var div = d3.select('#heatchart');
            // var mapLayer = div.append('svg').attr('id', 'map').attr('width', width).attr('height', height);
            var canvasLayer = div.append('canvas').attr('id', 'heatmap').attr('width', width).attr('height', height);

            var canvas = canvasLayer.node();
            var context = canvas.getContext("2d");


            // canvasLayer.attr("width", sizeX).attr("height", sizeY);
            // context.globalAlpha = 0.5;

            var projection = d3.geoMercator().translate([width / 2, height / 2]),
                path = d3.geoPath(projection),
                airportMap;

            d3Queue.queue()
                // .defer(d3.json, 'world-50m.json')
                // .defer(d3.json, 'airports.json')
                //    .defer(d3.csv, 'dests.csv')
                // .defer(d3.csv, 'flexwatch.csv')
                .await(main);


            function main(error, world, airports, dests) {
                var heat = simpleheat(canvas);

                // set data of [[x, y, value], ...] format
                // heat.data(dests.map(d => { a = airportMap.get(d.destination); return [a.coords[0], a.coords[1], +d.watches] }));



                heat.data(data);
                // set point radius and blur radius (25 and 15 by default)
                heat.radius(that.state.heatmapRadius, that.state.heatmapBlur);

                // optionally customize gradient colors, e.g. below
                // (would be nicer if d3 color scale worked here)
                // heat.gradient({0: '#0000ff', 0.5: '#00ff00', 1: '#ff0000'});

                // set maximum for domain
                // heat.max(d3.max(dests, d => +d.watches));
                heat.max(that.state.heatmapMaximum);

                // draw into canvas, with minimum opacity threshold
                heat.draw(0.05);

            }

            this.processScatterplotData();

        }
        else {
            console.log('no injections available to process');
        }
    };

    processScatterplotData() {
        if (this.state.dataInjections && this.state.dataInjections.length > 0) {
            var that = this;
            console.log('processScatterplotData');
            var numPoints = 10000,
                size = 300,
                sizeX = this.state.mainImageSize.x,
                sizeY = this.state.mainImageSize.y,

                numRows = 30,
                numCols = 30,
                showingScatter = true,
                scatterDirty = false,
                data = null,
                cells = null,
                color = d3.interpolateRgb("rgba(255, 255, 255, 0)", "#c09");

            var getEmptyCells = function () {
                var emptyCells = [];
                for (var rowNum = 0; rowNum < numRows; rowNum++) {
                    emptyCells.push([]);
                    var row = emptyCells[emptyCells.length - 1];
                    for (var colNum = 0; colNum < numCols; colNum++) {
                        row.push({
                            row: rowNum,
                            col: colNum,
                            density: 0,
                            points: []
                        });
                    }
                }
                return emptyCells;
            };

            var clearCells = function () {
                for (var rowNum = 0; rowNum < numRows; rowNum++) {
                    for (var colNum = 0; colNum < numCols; colNum++) {
                        cells[rowNum][colNum].density = 0;
                        cells[rowNum][colNum].points = [];
                    }
                }
            };

            var randomizeData = function () {
                data = [];

                if (cells === null) {
                    cells = getEmptyCells();
                }
                else {
                    clearCells();
                }

                var x, y, col, row;
                // for (var i = 0; i < numPoints; i++) {
                //     x = Math.random() * sizeX;
                //     y = Math.random() * sizeY;
                //     col = Math.min(Math.floor(x / sizeX * numCols), numCols - 1);
                //     row = Math.min(Math.floor(y / sizeY * numRows), numRows - 1);

                //     data.push({
                //         x: x,
                //         y: y,
                //         col: col,
                //         row: row,
                //         cell: cells[row][col],
                //         ind: i
                //     });
                //     console.log(cells, row, col);
                //     cells[row][col].points.push(data[data.length - 1]);
                // }
                // console.log('muscles', that.state.domMuscleViews);
                // console.log('muscles2', that.state.domDataMuscles);
                // console.log('current muscle id', that.state.currentMuscleId);

                for (var i = 0; i < that.state.dataInjections.length; i++) {
                    var injection = that.state.dataInjections[i];

                    // console.log(injection);
                    x = Math.random() * sizeX;
                    y = Math.random() * sizeY;
                    // console.log('random', x, y);

                    x = injection.injection_x_point * sizeX;
                    y = injection.injection_y_point * sizeY;
                    // console.log('not random', x, y);

                    col = Math.min(Math.floor(x / sizeX * numCols), numCols - 1);
                    row = Math.min(Math.floor(y / sizeY * numRows), numRows - 1);

                    data.push({
                        x: x,
                        y: y,
                        col: col,
                        row: row,
                        cell: cells[row][col],
                        ind: i
                    });
                    // console.log(cells, row, col);
                    cells[row][col].points.push(data[data.length - 1]);
                }
            };


            var selectPoints = function (points) {
                d3.selectAll(points).attr("r", 4).attr("stroke", "#f00").attr("stroke-width", 3);

                for (var i = 0; i < points.length; i++) {
                    points[i].parentNode.appendChild(points[i]);
                }
            };

            var deselectPoints = function (points) {
                d3.selectAll(points).attr("r", 2).attr("stroke", "none");
            };

            var selectCell = function (cell) {
                d3.select(cell).attr("stroke", "#f00").attr("stroke-width", 3);

                cell.parentNode.parentNode.appendChild(cell.parentNode);
                cell.parentNode.appendChild(cell);
            };

            var deselectCell = function (cell) {
                d3.select(cell).attr("stroke", "#fff").attr("stroke-width", 0);
            };

            var onPointOver = function (point, data) {
                selectPoints([point]);
                var cell = d3.select("div#heatchart").select('[cell="r' + data.row + 'c' + data.col + '"]');
                selectCell(cell.node());
            };

            var onPointOut = function (point, data) {
                deselectPoints([point]);
                var cell = d3.select("div#heatchart").select('[cell="r' + data.row + 'c' + data.col + '"]');
                deselectCell(cell.node());
            };

            var createScatterplot = function () {
                if (data && data.length > 0) {
                    var scatterplot = d3.select("div#scatterplot").html('').append("svg:svg").attr("width", sizeX).attr("height", sizeY);

                    scatterplot.selectAll("circle").data(data).enter().append("svg:circle").attr("cx", function (d, i) {
                        return d.x;
                    }).attr("cy", function (d, i) {
                        return d.y;
                    }).attr("r", 2).attr("ind", function (d) {
                        return d.ind;
                    }).on("mouseover", function (d) {
                        onPointOver(this, d);
                    }).on("mouseout", function (d) {
                        onPointOut(this, d);
                    });
                }
                else {
                    console.log('no scatterplot data');
                }
            };

            var onCellOver = function (cell, data) {
                selectCell(cell);

                if (showingScatter) {
                    var pointEls = [];

                    for (var i = 0; i < data.points.length; i++) {
                        pointEls.push(d3.select("div#scatterplot").select('[ind="' + data.points[i].ind + '"]').node());
                    }

                    selectPoints(pointEls);
                }
            };

            var onCellOut = function (cell, data) {
                deselectCell(cell);

                if (showingScatter) {
                    var pointEls = [];

                    for (var i = 0; i < data.points.length; i++) {
                        pointEls.push(d3.select("div#scatterplot").select('[ind="' + data.points[i].ind + '"]').node());
                    }

                    deselectPoints(pointEls);
                }
            };

            var updateScatterplot = function () {
                // select
                var dots = d3.select("div#scatterplot").select("svg").selectAll("circle").data(data);

                // enter
                dots.enter().append("svg:circle").attr("cx", function (d, i) {
                    return d.x;
                }).attr("cy", function (d, i) {
                    return d.y;
                }).attr("r", 2).attr("ind", function (d) {
                    return d.ind;
                }).on("mouseover", function (d) {
                    onPointOver(this, d);
                }).on("mouseout", function (d) {
                    onPointOut(this, d);
                });

                // update
                dots.attr("cx", function (d, i) {
                    return d.x;
                }).attr("cy", function (d, i) {
                    return d.y;
                }).attr("ind", function (d) {
                    return d.ind;
                }).on("mouseover", function (d) {
                    onPointOver(this, d);
                }).on("mouseout", function (d) {
                    onPointOut(this, d);
                });

                // exit
                dots.exit().remove();
            };

            var createHeatchart = function () {
                var min = 999;
                var max = -999;
                var l;

                for (var rowNum = 0; rowNum < cells.length; rowNum++) {
                    for (var colNum = 0; colNum < numCols; colNum++) {
                        l = cells[rowNum][colNum].points.length;

                        if (l > max) {
                            max = l;
                        }
                        if (l < min) {
                            min = l;
                        }
                    }
                }

                var heatchart = d3.select("div#heatchart").html("").append("svg:svg").attr("width", sizeX).attr("height", sizeY);

                heatchart.selectAll("g").data(cells).enter().append("svg:g").selectAll("rect").data(function (d) {
                    return d;
                }).enter().append("svg:rect").attr("x", function (d, i) {
                    return d.col * (sizeX / numCols);
                }).attr("y", function (d, i) {
                    return d.row * (sizeY / numRows);
                }).attr("width", sizeX / numCols).attr("height", sizeY / numRows).attr("fill", function (d, i) {
                    // console.log('1', d.points.length, min, max, color((d.points.length - min) / (max - min)));
                    if (d.points.length > 0) {
                        return color((d.points.length - min) / (max - min));
                    }
                    else {
                        return "rgba(255, 255, 255, 0)";
                    }
                    // return color((d.points.length - min) / (max - min));
                    // .attr("stroke", "#fff").attr("stroke-width", 0);
                }).attr("stroke", "#fff").attr("stroke-width", 0).attr("cell", function (d) {
                    return "r" + d.row + "c" + d.col;
                }).on("mouseover", function (d) {
                    onCellOver(this, d);
                }).on("mouseout", function (d) {
                    onCellOut(this, d);
                });
            };

            var updateHeatchart = function () {
                var min = 999;
                var max = -999;
                var l;

                for (var rowNum = 0; rowNum < cells.length; rowNum++) {
                    for (var colNum = 0; colNum < numCols; colNum++) {
                        l = cells[rowNum][colNum].points.length;

                        if (l > max) {
                            max = l;
                        }
                        if (l < min) {
                            min = l;
                        }
                    }
                }

                d3.select("div#heatchart").select("svg").selectAll("g").data(cells).selectAll("rect").data(function (d) {
                    return d;
                }).attr("x", function (d, i) {
                    return d.col * (sizeX / numCols);
                }).attr("y", function (d, i) {
                    return d.row * (sizeY / numRows);
                }).attr("fill", function (d, i) {
                    // console.log('2', color((d.points.length - min) / (max - min)));
                    return color((d.points.length - min) / (max - min));
                }).attr("cell", function (d) {
                    return "r" + d.row + "c" + d.col;
                }).on("mouseover", function (d) {
                    onCellOver(this, d);
                }).on("mouseout", function (d) {
                    onCellOut(this, d);
                });
            };

            var onRandomizeClick = function () {
                randomizeData();

                if (showingScatter) {
                    updateScatterplot();
                }
                else {
                    scatterDirty = true;
                }

                updateHeatchart();
            };

            var onNumPointsChange = function (event) {
                numPoints = event.target.options[event.target.selectedIndex].value;
                randomizeData();

                if (showingScatter) {
                    updateScatterplot();
                }
                else {
                    scatterDirty = true;
                }

                updateHeatchart();
            };

            var onShowScatterplotChange = function (event) {
                showingScatter = event.target.checked;

                if (showingScatter) {
                    if (scatterDirty) {
                        updateScatterplot();
                        scatterDirty = false;
                    }

                    d3.select("div#scatterplot").select("svg").attr("visibility", "visible");
                }
                else {
                    d3.select("div#scatterplot").select("svg").attr("visibility", "hidden");
                }
            };

            var init = function () {
                // randomizeData();
                createScatterplot();
                // createHeatchart();
            };

            init();
        }
    };

    setHeatmapDefaults() {
        // let domHMMax = document.getElementById('heatmap-maximum');
        // let domHMRadius = document.getElementById('heatmap-radius');
        // let domHMBlur = document.getElementById('heatmap-blur');

        // if (domHMMax) {
        //     domHMMax.value = this.state.heatmapMaximum;
        // }
        // if (domHMRadius) {
        //     domHMRadius.value = this.state.heatmapRadius;
        // }
        // if (domHMBlur) {
        //     domHMBlur.value = this.state.heatmapBlur;
        // }
    }

    updateHeatmapValues() {


        // var max = document.getElementById('heatmap-maximum').value;
        // var radius = document.getElementById('heatmap-radius').value;
        // var blur = document.getElementById('heatmap-blur').value;

        // console.log('radius', radius);

        // this.setState({ heatmapMaximum: max, heatmapRadius: radius, heatmapBlur: blur }, this.processHeatmapData);
    };

    updateDataTable() {

        var data = this.state.domVarMuscleValues;
        console.log('CHECK',  this.state.domVarCurrentMuscle);
        if (this.state.domVarCurrentMuscle === null) {
            return;
        }

        data.muscleName = this.state.domVarCurrentMuscle.muscleName;
        // data.numOfSessions = 

        this.setState({ domVarMuscleValues: data })
    }


    // DOM USER EVENTS

    toggleDataTableView(event) {

        if (this.state.domVarCurrentMuscle === null) {
            return;
        }

        var value = !this.state.domVarDataTable;
        this.setState({ domVarDataTable: value });
    }

    toggleDataTableFull(event) {


        var value = !this.state.domVarDataTableFull;
        this.setState({ domVarDataTableFull: value });
    }


    goTo(route) {
        this.props.history.replace(`/${route}`);
    }

    // componentDidMount() {
    //     let that = this;

    //     that.initialize();


    //     that.loadDataMuscles();
    //     that.changeMuscleView();

    //     // this.getInjectionData();



    //     this.setState({ currentMuscleImageBg: tempImg });
    //     this.setState({ currentMuscleImageOverlay: tempImg });




    render() {

        return (
            <div className="route-anatomy">
                <div className="route-nav">
                    <Nav />
                </div>
                <div className="route-tabs">
                    <AnatomyTabs tabs={this.state.tabs} />

                </div>
                <div id="route-content" className="route-content">

                    <div className={this.state.resizing ? 'route-cover active' : 'route-cover'}>
                        <div className={this.state.resizing ? 'panel-resize active' : 'panel-resize'}>

                        </div>
                        <div className="resize-text">
                            <p> Resizing window please wait... </p>
                        </div>
                    </div>
                    <div className={this.state.panelMenu ? 'anatomy-panel panel-menu active' : 'anatomy-panel panel-menu'}>
                        <div id="panel-menu-main" className="panel-main">
                            <div className="heatmap-variables">
                                {/* <input id="heatmap-maximum" className="input" type="number" min="1" onChange={this.updateHeatmapValues} />
                                <input id="heatmap-radius" className="input" type="number" min="1" onChange={this.updateHeatmapValues} />
                                <input id="heatmap-blur" className="input" type="number" min="1" onChange={this.updateHeatmapValues} /> */}
                            </div>
                            <div className="data-menu">
                                <div className="title">
                                    <p> Data selection </p>
                                </div>
                                <div className="data-selector">
                                    <select className="select" onChange={this.onDataSelectorChange} defaultValue={''}>
                                        <option value="" disabled={true}> Please select.. </option>
                                        <option value="1"> My data </option>
                                        <option value="2"> All data </option>
                                        <option value="3"> All data (excluding mine) </option>
                                    </select>
                                </div>
                            </div>
                            <div className="condition-menu">
                                <div className="title">
                                    <p> Condition </p>
                                </div>
                                <div className="condition-selector">
                                    <select className="select" onChange={this.onConditionSelectorChange} defaultValue={''}>
                                        <option value="" disabled={true}> Please select.. </option>
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
                            <div className="muscle-menu">
                                <div className="title">
                                    <p> Muscle </p>
                                </div>
                                <div className="muscle-selector">
                                    <select className="select" onChange={this.onMuscleSelectorChange} defaultValue={''}>
                                        <option value="" disabled={true}> Please select.. </option>
                                        {this.state.domSelectMuscles}
                                    </select>
                                </div>
                            </div>
                            <div className="visual-menu">
                                <div className="title">
                                    <p> Data visualization </p>
                                </div>
                                <div className="visual-selector">
                                    <select className="select">
                                        <option value="1"> Injection frequency </option>
                                        <option value="2"> Average dose per site </option>
                                        <option value="3"> Dosage range </option>
                                    </select>
                                </div>
                            </div>
                            <div className="views-menu">
                                <div className="title">
                                    <p> Additional Views </p>
                                </div>
                                <div className="views">
                                    {(this.state.domMuscleViews.length > 0 ?
                                        this.state.domMuscleViews
                                        : <div> </div>)}
                                </div>
                            </div>
                            <div>
                                <p> Show background image </p>
                                <input id="showBgCheck" type="checkbox" onClick={this.toggleShowBg} defaultChecked={true} />
                                {/* <input type="checkbox" onClick={this.toggleDataTableFull} defaultChecked={true} /> </div> */}
                            </div>
                        </div>
                        <div className="panel-bottom">

                        </div>


                    </div>
                    <div className="anatomy-panel panel-view">
                        <p className="title"> Number of injections by muscle location </p>
                        <div id="panel-view-main" className="panel-main">
                            

                            <div id="panel-view-main-loading" className={this.state.processingData ? "panel-main-loading active" : "panel-main-loading inactive"}>
                                <p> Loading... please wait </p>
                            </div>
                            {/* <div id="panel-view-main-img-size" className="img-size"> 
                                <img className="h" src={tempImg}/>
                            </div>
                            <div id="panel-view-main-img-bg" className="img-bg">
                                <img className="w" src={this.state.currentMuscleImageBg} />
                            </div>
                            <div id="panel-view-main-img-overlay" className="img-overlay">
                                <img className="w" src={this.state.currentMuscleImageOverlay} />
                            </div>
                            <div id="scatterContainer" className="img-scatterplot">
                                <div id="scatterplot"></div>
                            </div>
                            <div id="heatchartContainer" className="img-heatmap">
                                <div id="heatchart"></div>
                            </div> */}
                            <Heatmap points={this.state.dataCurrentInjections} size={{ width: this.state.mainImageSize.x, height: this.state.mainImageSize.y }} imgBg={this.state.currentMuscleImageBg} imgOver={this.state.currentMuscleImageOverlay} showBg={this.state.showBg}> </Heatmap>
                        </div>
                        <div className="panel-bottom">
                            <div className="heatmap-scale">
                                <div className="heatmap-scale-bg"> </div>
                                <div className="heatmap-scale-text">
                                    <div className="heatmap-scale-text-left"> 0 </div>
                                    <div className="heatmap-scale-text-center"> scale </div>
                                    <div className="heatmap-scale-text-right"> 10 </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="anatomy-panel panel-data">
                        <div className="panel-main">
                            <p className="title"> {this.state.tabs[this.state.tabIndex].conditionName ? this.state.tabs[this.state.tabIndex].conditionName : ''} </p>
                            <div className="panel-main-top">
                                <div className={this.state.domVarDataTable ? 'btn active' : 'btn'} onClick={this.toggleDataTableView}> {this.state.domVarCurrentMuscle !== null ? this.state.domVarCurrentMuscle.muscleName : 'No muscle selected'} </div>
                                {/* <div className={ !this.state.domVarDataTable ? 'btn active':'btn'} onClick={this.toggleDataTableView}> All Muscles </div> */}
                                <div className={!this.state.domVarDataTable ? 'btn active' : 'btn'} onClick={this.toggleDataTableView}> Patient information </div>
                                {!this.state.domVarDataTable ? (
                                    <div > </div>
                                    // <div className='btn checkbox'> <input type="checkbox" onClick={this.toggleDataTableFull} defaultChecked={true} /> </div>
                                ) : null}


                            </div>
                            {this.state.domVarDataTable ? (
                                <div className="panel-main-muscle">
                                    <div className="muscle-table">
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <td> Muscle Name </td>
                                                    <td> {this.state.domVarMuscleValues.muscleName} </td>
                                                </tr>
                                                <tr>
                                                    <td> Number of Sites </td>
                                                    <td> {this.state.domVarMuscleValues.numOfSites} </td>
                                                </tr>
                                                <tr>
                                                    <td> Number of Patients </td>
                                                    <td> {this.state.domVarMuscleValues.numOfPatients} </td>
                                                </tr>
                                                <tr>
                                                    <td> Number of Sessions </td>
                                                    <td> {this.state.domVarMuscleValues.numOfSessions} </td>
                                                </tr>
                                                <tr>
                                                    <td> Average number of sites per session </td>
                                                    <td> {this.state.domVarMuscleValues.avgNumOfSitesPerSession} </td>
                                                </tr>
                                                <tr>
                                                    <td> Maximum number of sites in a single session </td>
                                                    <td> {this.state.domVarMuscleValues.maxNumOfSitesInSession} </td>
                                                </tr>
                                                <tr>
                                                    <td> Average dose of botox for muscle per session </td>
                                                    <td> {this.state.domVarMuscleValues.avgDoseBotox} </td>
                                                </tr>
                                                <tr>
                                                    <td> Average dose of DYSPORT for muscle per session </td>
                                                    <td> {this.state.domVarMuscleValues.avgDoseDysport} </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>)
                                : (
                                    // <div className="panel-main-table"> 
                                    //     <p> Muscles injected by condition </p>
                                    //     <div className="condition-table">
                                    //         <table className="table table-bordered">
                                    //             <thead className={this.state.domVarDataTableFull === true ? 'full':'less'}>
                                    //                 <tr>
                                    //                     <td className="tb-col-0"> Muscle </td>
                                    //                     <td> Average number of injection sites per muscle </td>
                                    //                     <td> Average dose per muscle BOTOX </td>
                                    //                     <td> Average Dose per muscle DYSPORT </td>
                                    //                 </tr>
                                    //             </thead>
                                    //             <tbody className={this.state.domVarDataTableFull === true ? 'full':'less'}>
                                    //                 {this.state.domMetaList}
                                    //                 <tr>
                                    //                     <td> TOTAL </td>
                                    //                     <td> {this.state.totalInjectionAverage} </td>
                                    //                     <td> {this.state.totalBotoxAverage} </td>
                                    //                     <td> {this.state.totalDysportAverage} </td>
                                    //                 </tr>
                                    //             </tbody>
                                    //         </table>
                                    //     </div>
                                    // </div>
                                    <div className="panel-main-patient">
                                        <p> Patient information </p>
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
                                                            {this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta ?
                                                                this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta.patientsTotal :
                                                                '-'
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td> Gender Male </td>
                                                        <td>
                                                            {this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta ?
                                                                this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta.genderMalePercentage + '%' :
                                                                '-'
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td> Gender Female </td>
                                                        <td>
                                                            {this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta ?
                                                                this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta.genderFemalePercentage + '%' :
                                                                '-'
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td> Average Age </td>
                                                        <td>
                                                            {this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta ?
                                                                this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta.averageAge + ' Years' :
                                                                '-'
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td> Youngest Patient </td>
                                                        <td>
                                                            {this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta ?
                                                                this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta.youngestPatient + ' Years' :
                                                                '-'
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td> Oldest Patient </td>
                                                        <td>
                                                            {this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta ?
                                                                this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta.oldestPatient + ' Years' :
                                                                '-'
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td> Average time from first reported to treatment  </td>
                                                        <td>
                                                            {this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta ?
                                                                this.state.tabs[this.state.tabIndex].dataCurrentConditionMeta.averageTimeFirstReported :
                                                                '-'
                                                            }
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                        </div>
                        <div className="panel-bottom">

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}