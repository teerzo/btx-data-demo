
import React from 'react';
import { routeNode } from 'react-router5';

import * as d3 from "d3";
import * as d3Queue from "d3-queue";

// var queue = require('d3-queue').queue;
import axios from 'axios';
import simpleheat from 'simpleheat';

// components
import Nav from '../nav';

// css
import '../../styles/assessments/desktop.scss';
import '../../styles/assessments/mobile.scss';
import '../../styles/assessments/inner.scss';

// data
import dataInjections from '../../data/injections.js';
import dataMuscles from '../../data/muscles';

// imgs
import tempImg from '../../images/temp.png';

export default class Assessments extends React.Component {
    constructor(props) {
        super(props);

        this.processHtmlData = this.processHtmlData.bind(this);
        this.processPieChartData = this.processPieChartData.bind(this);
        this.processLineChartData = this.processLineChartData.bind(this);

        this.getMuscleItemById = this.getMuscleItemById.bind(this);
        this.onMuscleViewClick = this.onMuscleViewClick.bind(this);
        this.onMuscleSelectorChange = this.onMuscleSelectorChange.bind(this);
        this.toggleMobilePanelMenu = this.toggleMobilePanelMenu.bind(this);
        this.hideMobilePanelMenu = this.hideMobilePanelMenu.bind(this);
        this.resizeEnd = this.resizeEnd.bind(this);
        this.state = {
            panelMenu: false,
            currentMuscleId: 0,
            currentViewId: 0,
            currentMuscleImageBg: null,
            currentMuscleImageOverlay: null,
            totalInjectionAverage: 0,
            totalBotoxAverage: 0,
            totalDysportAverage: 0,

            mainImageSize: { x: 300, y: 400 },

            listMuscleViews: [],
        }
    }
    // resize functions
    resizeEnd(event) {
        var that = this;

        console.log('OnResizeEnd', event);
        // console.log('I\'ve been resized 100ms ago! — ' + new Date() );

        window.setTimeout(function () {
            var DOMcontent = document.getElementById('content');

            var contentHeight = DOMcontent.offsetHeight;
            var contentWidth = DOMcontent.offsetWidth;
            // console.log('container size', contentHeight);

            if (contentWidth >= 1400) {
                that.hideMobilePanelMenu();
            }

            var domPanels = document.getElementsByClassName('anatomy-panel');
            // console.log('DOMpanels', domPanels);
            for (var i = 0; i < domPanels.length; i++) {
                // console.log(domPanels[i]);
                if (contentWidth < 1400) {
                    domPanels[i].style.height = 'auto';
                    // domPanels[i].style.height = contentHeight + 'px';
                }
                else {
                    domPanels[i].style.height = contentHeight + 'px';

                }

                var domPanelTop = null;
                var domPanelMain = null;
                var domPanelBottom = null;

                var children = domPanels[i].childNodes;
                for (var c = 0; c < children.length; c++) {
                    if (children[c].className.indexOf('panel-top') !== -1) {
                        domPanelTop = children[c];
                    }
                    if (children[c].className.indexOf('panel-main') !== -1) {
                        domPanelMain = children[c];
                    }
                    if (children[c].className.indexOf('panel-bottom') !== -1) {
                        domPanelBottom = children[c];
                    }
                }
                if (domPanelTop !== null && domPanelMain !== null && domPanelBottom !== null) {

                    var mainHeight = 100;
                    if (domPanelMain.id === 'panel-menu-main') {
                        mainHeight = contentHeight - (domPanelTop.offsetHeight + domPanelBottom.offsetHeight) + 'px';
                    }
                    else if (contentWidth < 1400) {
                        mainHeight = 'auto';
                    }
                    else {
                        mainHeight = contentHeight - (domPanelTop.offsetHeight + domPanelBottom.offsetHeight) + 'px';

                    }
                    domPanelMain.style.height = mainHeight;

                }
                else {
                    // console.log('dont update thingy', domPanelTop, domPanelMain, domPanelBottom );
                }



                // console.log(children);
            }

            var domPanelViewMain = document.getElementById('panel-view-main');
            var domPanelMenuMain = document.getElementById('panel-menu-main');


            var domImageOverlay = document.getElementById('panel-view-main-img-overlay');
            var domImageBg = document.getElementById('panel-view-main-img-bg');
            var domScatterPlot = document.getElementById('scatterContainer');
            var domHeatmap = document.getElementById('heatchartContainer');


            var mainImageSize = {
                x: 1,
                y: 1,
            };

            if (domPanelViewMain) {
                var mainWidth = domPanelViewMain.offsetWidth;
                var mainHeight = domPanelViewMain.offsetHeight;
                if (domImageOverlay) {
                    domImageOverlay.style.width = mainWidth - 2;
                    domImageOverlay.style.height = mainHeight - 2;
                    if (mainWidth < mainHeight) {
                        domImageOverlay.children[0].className = 'w';
                    }
                    else {
                        domImageOverlay.children[0].className = 'h';
                    }
                }
                if (domImageBg) {
                    domImageBg.style.width = mainWidth - 2;
                    domImageBg.style.height = mainHeight - 2;
                    if (mainWidth < mainHeight) {
                        domImageBg.children[0].className = 'w';
                    }
                    else {
                        domImageBg.children[0].className = 'h';
                    }
                    mainImageSize.x = domImageBg.children[0].offsetWidth;
                    mainImageSize.y = domImageBg.children[0].offsetHeight;
                }
                if (domScatterPlot) {
                    domScatterPlot.style.width = mainWidth - 2;
                    domScatterPlot.style.height = mainHeight - 2;
                }
                if (domHeatmap) {
                    domHeatmap.style.width = mainWidth - 2;
                    domHeatmap.style.height = mainHeight - 2;
                }
            }
            if (domPanelMenuMain) {
                // domPanelMenuMain.style.height = contentHeight + 'px';
            }

            console.log('new width', mainImageSize);

            that.setState({ mainImageSize: { x: mainImageSize.x, y: mainImageSize.y } });
        }, 200);
    }

    getMuscleItemById(id) {
        // initial values for start, middle and end
        let start = 0
        let stop = this.state.filteredList.length - 1
        let middle = Math.floor((start + stop) / 2)

        // While the middle is not what we're looking for and the list does not have a single item
        while (this.state.filteredList[middle].id !== Number(id) && start < stop) {
            if (id < this.state.filteredList[middle].id) {
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
        return this.state.filteredList[middle];

        // if the current middle item is what we're looking for return it's index, else return -1
        // return (dataMuscles.data[middle].muscleId !== id) ? -1 : middle
    }

    onMuscleViewClick(event, item) {
        console.log('onMuscleViewClick', event.target.value, item);

        var muscleImgOverlay = null;
        var muscleImgBg = null;
        if (item) {
            muscleImgOverlay = item.muscleImgOverlay;
            muscleImgBg = item.muscleImgBg;
        }
        else {
            muscleImgOverlay = tempImg;
            muscleImgBg = tempImg;
        }

        this.setState({ currentViewId: item.muscleId, currentMuscleImageBg: muscleImgBg, currentMuscleImageOverlay: muscleImgOverlay }, this.processHtmlData);
    }

    onMuscleSelectorChange(event, item) {
        console.log('onMuscleSelectorChange', event.target.value);

        var muscle = this.getMuscleItemById(event.target.value);
        console.log('selected muscled', muscle);
        var muscleImgOverlay = null;
        var muscleImgBg = null;
        if (muscle) {
            muscleImgOverlay = muscle.muscles[0].muscleImgOverlay;
            muscleImgBg = muscle.muscles[0].muscleImgBg;
        }
        else {
            muscleImgOverlay = tempImg;
            muscleImgBg = tempImg;
        }
        console.log('new muscle', muscle);
        console.log('currentViewId', muscle.muscles[0].muscleId);
        this.setState({ currentMuscleId: muscle.id, currentViewId: muscle.muscles[0].muscleId, currentMuscleImageBg: muscleImgBg, currentMuscleImageOverlay: muscleImgOverlay }, this.processHtmlData);
    }

    toggleMobilePanelMenu() {
        console.log('toggleMobilePanelMenu', !this.state.panelMenu);
        const state = !this.state.panelMenu;
        this.setState({ panelMenu: state });
    }
    hideMobilePanelMenu() {
        console.log('hideMobilePanelMenu');
        const state = false;
        this.setState({ panelMenu: state });
    }

    loadDataMuscles() {
        console.log('loadDataMuscles');
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

            // newList = sortedList.map(function (item, key) {
            //     // console.log(item);
            //     // var onClick = function() {
            //     //     that.props.router.navigate('adminArticle', {id: item.articleId});
            //     // }
            //     var itemText = item.muscleId + ' ' + item.muscleName + ' ';
            //     if (item.lateralPositionSet[0].lateralPositionCode === 'L' || item.lateralPositionSet[0].lateralPositionCode === 'R') {
            //         itemText += item.lateralPositionSet[0].lateralPositionCode;
            //     }

            //     return (
            //         <option key={key} value={item.muscleId} > {itemText} </option>
            //     )


            //     // if( muscle.lateralPositionSet[0].lateralPositionCode === 'L' || muscle.lateralPositionSet[0].lateralPositionCode === 'R' ) {
            //     //     domOption.text += ' - ' + muscle.lateralPositionSet[0].lateralPosition;
            //     // }
            // });

            var filteredList = [];

            // Setup base muscle
            for (var i = 0; i < sortedList.length; i++) {
                var baseMuscle = sortedList[i];
                var match = false;


                for (var m = 0; m < filteredList.length; m++) {
                    var muscle = filteredList[m];
                    if (baseMuscle.muscleName === muscle.muscleName) {
                        match = true;
                    }
                }
                if (!match) {
                    var item = {
                        // muscleId: sortedList[m].muscleId,
                        id: filteredList.length,
                        muscleName: baseMuscle.muscleName,
                        muscles: [],

                        injectionAverage: 0,
                        botoxAverage: 0,
                        dysportAverage: 0,

                        // sessions: [],
                    };
                    filteredList.push(item);
                }
            }

            // Setup children muscles
            for (var i = 0; i < sortedList.length; i++) {
                var baseMuscle = sortedList[i];
                for (var m = 0; m < filteredList.length; m++) {
                    var muscle = filteredList[m];

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


            // Setup sessions 
            for (var bm = 0; bm < filteredList.length; bm++) {
                var baseMuscle = filteredList[bm];
                for (var m = 0; m < baseMuscle.muscles.length; m++) {
                    var muscle = baseMuscle.muscles[m];

                    for (var i = 0; i < dataInjections.data.length; i++) {
                        var injection = dataInjections.data[i];
                        ;


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
                // filteredList[m] = baseMuscle;
            }

            // Setup injections
            for (var bm = 0; bm < filteredList.length; bm++) {
                var baseMuscle = filteredList[bm];
                for (var m = 0; m < baseMuscle.muscles.length; m++) {
                    var muscle = baseMuscle.muscles[m];
                    for (var i = 0; i < dataInjections.data.length; i++) {
                        var injection = dataInjections.data[i];
                        if (muscle.muscleId === Number(injection.muscle_image_id)) {

                            for (var s = 0; s < muscle.sessions.length; s++) {
                                var session = muscle.sessions[s];
                                if (session.session_id === injection.session_id) {
                                    var newInjection = {
                                        injection_id: injection.injection_id,
                                        injection_medication_name: injection.injection_medication_name,
                                        injection_medication_id: injection.injection_medication_id,
                                        injection_medication_amount: injection.injection_medication_amount,
                                        injection_medication_amount_unit_code: injection.injection_medication_amount_unit_code,
                                        injection_x_point: injection.injection_x_point,
                                        injection_y_point: injection.injection_y_point,


                                        //                 injection_id: sortedList[n].injection_id,
                                        //                 injection_medication_id: sortedList[n].injection_medication_id,
                                        //                 injection_medication_amount: sortedList[n].injection_medication_amount,
                                        //                 injection_medication_amount_unit_code: sortedList[n].injection_medication_amount_unit_code,


                                        //                 // "injection_medication_name": "BOTOX®",
                                        //                 // "injection_id": 1227,
                                        //                 // "session_id": 66,
                                        //                 // "injection_medication_id": 1,
                                        //                 // "injection_medication_amount": 100,
                                        //                 // "injection_medication_amount_unit_code": "ml",
                                        //                 // "injection_medication_dilution": 2,
                                        //                 // "injection_medication_dilution_unit_code": "ml",
                                        //                 // "injection_site_amount": 5,
                                        //                 // "injection_site_amount_unit_code": "ml",
                                        //                 // "injection_site_dilution": 0.1,
                                        //                 // "injection_site_dilution_unit_code": "ml",
                                        //                 // "muscle_image_id": 29,
                                        //                 // "injection_x_point": 0.2684,
                                        //                 // "injection_y_point": 0.1498,
                                        //                 // "medication_batch": "C4136C3",
                                        //                 // "medication_expire_date": "2019-03-01",
                                        //                 // "is_emg": false,
                                        //                 // "created": "2017-03-15 02:49:35",
                                        //                 // "created_by": 23,
                                        //                 // "modified": "",
                                        //                 // "modified_by": "",
                                    };
                                    session.injections.push(newInjection);
                                }
                            }
                        }
                    }
                }
            }

            // Calculate averages 
            ;
            for (var bm = 0; bm < filteredList.length; bm++) {

                var baseMuscle = filteredList[bm];

                baseMuscle.injectionAverage = 0;
                baseMuscle.injectionTotal = 0;
                baseMuscle.injectionTotalCount

                var sessionCount = 0;

                var injectionCount = 0;

                var sessionTotal;
                var sessionTotalCount;
                var sessionAverage;

                baseMuscle.botoxAverage = 0;
                baseMuscle.botoxTotal = 0;
                baseMuscle.botoxTotalCount = 0;




                for (var m = 0; m < baseMuscle.muscles.length; m++) {
                    var muscle = baseMuscle.muscles[m];
                    for (var s = 0; s < muscle.sessions.length; s++) {
                        var session = muscle.sessions[s];

                        sessionCount += 1;

                        for (var i = 0; i < session.injections.length; i++) {
                            var injection = session.injections[i];

                            if (baseMuscle.muscleName === 'Subdermal') {
                                // console.log(injection.injection_medication_amount);
                            }

                            // Average injections
                            injectionCount += 1;

                            // Botox injections 
                            if (Number(injection.injection_medication_id) === 1) {
                                baseMuscle.botoxTotal += injection.injection_medication_amount;
                                baseMuscle.botoxTotalCount += 1;
                            }



                        }
                    }
                }



                if (baseMuscle.muscleName === 'Subdermal') {
                    // console.log( baseMuscle.botoxTotal, baseMuscle.botoxTotalCount);
                }

                if (sessionCount > 0) {
                    // console.log(injectionCount, sessionCount);
                    baseMuscle.injectionAverage = injectionCount / sessionCount;

                    if (Math.round(baseMuscle.injectionAverage) !== baseMuscle.injectionAverage) {
                        baseMuscle.injectionAverage = baseMuscle.injectionAverage.toFixed(2);
                    }
                }
                if (baseMuscle.botoxTotalCount > 0) {

                    // var itemPrice = 1.50;
                    // var itemQuantity = $(this).val();
                    // var quantityPrice = (itemPrice * itemQuantity);
                    // if(Math.round(quantityPrice) !== quantityPrice) {
                    //     quantityPrice = quantityPrice.toFixed(2);
                    // }
                    baseMuscle.botoxAverage = (baseMuscle.botoxTotal / baseMuscle.botoxTotalCount);

                    if (Math.round(baseMuscle.botoxAverage) !== baseMuscle.botoxAverage) {
                        baseMuscle.botoxAverage = baseMuscle.botoxAverage.toFixed(2);
                    }

                }

                // baseMuscle.dysportAverage = 1;


            }





            // console.log('check meh', filteredList);

            var newList = filteredList.map(function (item, key) {
                return (
                    <option key={key} value={item.id} > {item.id} {item.muscleName} </option>
                )
            });


        }




        console.log(newInjectedList);



        var newViewId = filteredList[0].muscles[0].muscleId;
        console.log(newViewId);
        this.setState({
            currentViewId: newViewId,
            listMuscles: newList,
            filteredList: filteredList
        }, this.processHtmlData);
    };

    processHtmlData() {
        var that = this;
        console.log('process id ', this.state.currentMuscleId);
        var newMuscleViews = this.state.filteredList[this.state.currentMuscleId].muscles;
        // if( this.state.currentMuscleId ) {
        //     for( var i = 0; i < this.state.filteredList[this.state.currentMuscleId].muscles.length; i++ ) {

        //     }
        // }

        var listMuscleViews = newMuscleViews.map(function (item, key) {

            var onClick = function (event) {
                that.onMuscleViewClick(event, item);
                // that.props.router.navigate('adminArticle', {id: item.articleId});
            }

            return (
                <div key={key} onClick={onClick} className={that.state.currentViewId === item.muscleId ? 'view active' : 'view'}>
                    <div className="inner">

                        {/*<img src={item.muscleImgBg} className="img" style={ { backgroundImage: `url("images/img.svg")` } } />*/}
                        <img src={item.muscleImgOverlay} className="img" style={{ backgroundImage: 'url(' + item.muscleImgBg + ')' }} />
                        {/*{item.muscleId}*/}



                    </div>
                </div>

                // <div key={key}> {item.muscleId} </div>
            )
        });

        console.log('muscles views', newMuscleViews);
        // if( this.state.currentMuscleId ) {

        var newInjectedList = this.state.filteredList.map(function (item, key) {
            return (
                (that.state.currentMuscleId === '' || that.state.currentMuscleId === item.id ?
                    // ( that.state.currentMuscleId === item.id ? 
                    <tr key={key} className="vis">
                        <td> {item.muscleName} </td>
                        <td> {item.injectionAverage} </td>
                        <td> {item.botoxAverage} </td>
                        <td> {item.dysportAverage} </td>
                    </tr> :
                    <tr key={key} className="hide">
                        <td> - {item.id} </td>
                        <td> - </td>
                        <td> - </td>
                        <td> - </td>
                    </tr>
                )
            )
        });
        this.setState({ listMuscleViews: listMuscleViews, listInjectedMuscles: newInjectedList });

    };

    processPieChartData() {
        var svg = d3.select("#piechart")
            .append("svg")
            .append("g")

        svg.append("g")
            .attr("class", "slices");
        svg.append("g")
            .attr("class", "labels");
        svg.append("g")
            .attr("class", "lines");

        var width = 600,
            height = 450,
            radius = Math.min(width, height) / 2;

        var pie = d3.pie()
            .sort(null)
            .value(function (d) {
                return d.value;
            });

        var arc = d3.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4);

        var outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var key = function (d) { return d.data.label; };

        var color = d3.scaleOrdinal()
            .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        function randomData() {
            var labels = color.domain();
            return labels.map(function (label) {
                return { label: label, value: Math.random() }
            });
        }

        change(randomData());

        d3.select("#piechartrandom")
            .on("click", function () {
                change(randomData());
            });


        function change(data) {

            /* ------- PIE SLICES -------*/
            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data), key);

            slice.enter()
                .insert("path")
                .style("fill", function (d) { return color(d.data.label); })
                .attr("class", "slice");

            slice
                .transition().duration(1000)
                .attrTween("d", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        return arc(interpolate(t));
                    };
                })

            slice.exit()
                .remove();

            /* ------- TEXT LABELS -------*/

            var text = svg.select(".labels").selectAll("text")
                .data(pie(data), key);

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .text(function (d) {
                    return d.data.label;
                });

            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle) / 2;
            }

            text.transition().duration(1000)
                .attrTween("transform", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                        return "translate(" + pos + ")";
                    };
                })
                .styleTween("text-anchor", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        var d2 = interpolate(t);
                        return midAngle(d2) < Math.PI ? "start" : "end";
                    };
                });

            text.exit()
                .remove();

            /* ------- SLICE TO TEXT POLYLINES -------*/

            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data), key);

            polyline.enter()
                .append("polyline");

            polyline.transition().duration(1000)
                .attrTween("points", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                    };
                });

            polyline.exit()
                .remove();
        };
        change(randomData());
    };

    processLineChartData() {
        console.log('processLineChartData');

       
    
        var axis = {
            x: {
                label: 'x axis',
                min: 0,
                max: 4,
            },
            y: {
                label: 'y axis',
                min: 0,
                max: 16,
            }

        };
        var grid = {
            width: 600,
            height: 300,
        };
        var margin = {
            top: 20, right: 20, bottom: 20, left: 50
        }
        var innerwidth = grid.width - margin.left - margin.right;
        var innerheight = grid.height - margin.top - margin.bottom;

        var svg = d3.select('#linechart').append('svg')
        var svgG = d3.select('#linechart svg').append('g');
        // svgG.append('g').attr('class', 'gridX');
        // svgG.append('g').attr('class', 'gridY');
        // svgG.append('g').attr('class', 'axisX');
        // svgG.append('g').attr('class', 'axisY');

        svg.attr("width", grid.width);
        svg.attr("height", grid.height)
        svgG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // var svg = d3.select("#linechart").append("svg");
        // svg.datum(randomData());


        // change 

        function change(data) {
            console.log(data);

           

            var x_scale = d3.scaleLinear()
                .range([0, innerwidth])
                .domain([axis.x.min, axis.x.max]);

            var y_scale = d3.scaleLinear()
                .range([innerheight, 0])
                .domain([axis.y.min,axis.y.max]);

            var x_axis =d3.axisBottom(x_scale);
            var y_axis =d3.axisLeft(y_scale);

            var x_grid = d3.axisBottom(x_scale).tickSize(-innerheight);
            var y_grid = d3.axisLeft(y_scale).tickSize(-innerWidth);     

             var color_scale = d3.scaleOrdinal(d3.schemeCategory10)
                        .domain(d3.range(data.length));

            var draw_line = d3.line()
                .curve(d3.curveLinear)
                .x(function (d) { return x_scale(d[0]); })
                .y(function (d) { return y_scale(d[1]); });

            svgG.append("g")
                .attr("class", "axisX")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(x_axis)
                .append("text")
                .attr("dy", "-.71em")
                .attr("x", innerwidth)
                .style("text-anchor", "end")
                .text(axis.x.label);

            svgG.append("g")
                .attr("class", "axisY")
                .call(y_axis)
                .append("text")
                .attr("transform", "rotate(-90)")
                // .attr("y", 6)
                .attr("y", innerheight)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .text(axis.y.label);


            // svgG.append("g")
            //     .attr("class", "gridX")
            //     .attr("transform", "translate(0," + innerheight + ")")
            //     .call(x_grid);

            // svgG.append("g")
            //     .attr("class", "gridY")
            //     .call(y_grid);

            var data_lines = svgG.selectAll(".d3_xy_chart_line")
                .data(data.map(function (d) { return d3.zip(d.x, d.y); }))
                .enter().append("g")
                .attr("class", "d3_xy_chart_line");

            data_lines.append("path")
                .attr("class", "line")
                .attr("d", function (d) { return draw_line(d); })
                .attr("stroke", function (_, i) { return color_scale(i); });

            data_lines.append("text")
                .datum(function (d, i) { return { name: data[i].label, final: d[d.length - 1] }; })
                .attr("transform", function (d) {
                return ("translate(" + x_scale(d.final[0]) + "," +
                y_scale(d.final[1]) + ")");
                })
                .attr("x", 3)
                .attr("dy", ".35em")
                .attr("fill", function (_, i) { return color_scale(i); })
                .text(function (d) { return d.name; });
        }

        function randomData() {
          


            
            
            var data = [{
                label: "Data Set 1",
                x: [0, 1, 2, 3, 4],
                y: [0, 1, 2, 3, 4]
            },
            {
                label: "Data Set 2",
                x: [0, 1, 2, 3, 4],
                y: [0, 1, 4, 9, 16]
            }];
            return data.map(function(item,index) {
                console.log(item, index);
                return {
                    label: item.label,
                    x: [ 
                        item.x[0] + Math.random() * 1, 
                        item.x[1] + Math.random() * 1, 
                        item.x[2] + Math.random() * 1, 
                        item.x[3] + Math.random() * 1, 
                    ],
                    y: [ 
                       item.y[0] + Math.random() * 1, 
                       item.y[1] + Math.random() * 1,  
                       item.y[2] + Math.random() * 1, 
                       item.y[3] + Math.random() * 1,  
                    ]
                }
            });
        }

        d3.select("#linechartrandom").on("click", function () {
            console.log('random data');
            change(randomData());
        });
        // start
        change(randomData());
       
        
        return;
       
       

        
        // var data = [{
        //         label: "Data Set 1",
        //         x: [0, 1, 2, 3, 4],
        //         y: [0, 1, 2, 3, 4]
        //     },
        //     {
        //         label: "Data Set 2",
        //         x: [0, 1, 2, 3, 4],
        //         y: [0, 1, 4, 9, 16]
        //     }];
        // var xy_chart = d3_xy_chart()
        //     .width(640)
        //     .height(480)
        //     .xlabel("X Axis")
        //     .ylabel("Y Axis");
        // var svg = d3.select("#linechart").append("svg")
        //     .datum(data)
        //     .call(xy_chart);

        // function d3_xy_chart() {
        //     var width = 640,
        //         height = 480,
        //         xlabel = "X Axis Label",
        //         ylabel = "Y Axis Label";
                
        //     function chart(selection) {
        //         selection.each(function (datasets) {
        //             console.log('datasets:',datasets);
        //             //
        //             // Create the plot. 
        //             //
        //             var margin = { top: 20, right: 80, bottom: 30, left: 50 },
        //                 innerwidth = width - margin.left - margin.right,
        //                 innerheight = height - margin.top - margin.bottom;

        //             var x_scale = d3.scaleLinear()
        //                 .range([0, innerwidth])
        //                 .domain([d3.min(datasets, function (d) { return d3.min(d.x); }),
        //                 d3.max(datasets, function (d) { return d3.max(d.x); })]);

        //             var y_scale = d3.scaleLinear()
        //                 .range([innerheight, 0])
        //                 .domain([d3.min(datasets, function (d) { return d3.min(d.y); }),
        //                 d3.max(datasets, function (d) { return d3.max(d.y); })]);

        //             var color_scale = d3.scaleOrdinal(d3.schemeCategory10)
        //                 .domain(d3.range(datasets.length));

        //             var x_axis =d3.axisBottom(x_scale);
        //             // var x_axis = d3.svg.axis()
        //                 // .scale(x_scale)
        //                 // .orient("bottom");

        //             var y_axis =d3.axisLeft(y_scale);
        //             // var y_axis = d3.svg.axis()
        //             //     .scale(y_scale)
        //             //     .orient("left");
        //             var x_grid = d3.axisBottom(y_scale).tickFormat(function(d){ return d.x;}).tickSize(-innerheight);
        //             // var x_grid = d3.svg.axis()
        //             //     .scale(x_scale)
        //             //     .orient("bottom")
        //             //     .tickSize(-innerheight)
        //             //     .tickFormat("");

        //             var y_grid = d3.axisLeft(y_scale).tickFormat(function(d){ return d.x;}).tickSize(-innerheight);                    
        //             // var y_grid = d3.svg.axis()
        //             //     .scale(y_scale)
        //             //     .orient("left")
        //             //     .tickSize(-innerwidth)
        //             //     .tickFormat("");

        //             var draw_line = d3.line()
        //                 .curve(d3.curveLinear)
        //                 .x(function (d) { return x_scale(d[0]); })
        //                 .y(function (d) { return y_scale(d[1]); });
                        
        //             // var svg = d3.select(this)
        //             //     .attr("width", width)
        //             //     .attr("height", height)
        //             //     .append("g")
        //             //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //             // svg.append("g")
        //             //     .attr("class", "x grid")
        //             //     .attr("transform", "translate(0," + innerheight + ")")
        //             //     .call(x_grid);

        //             // svg.append("g")
        //             //     .attr("class", "y grid")
        //             //     .call(y_grid);

        //             // svg.append("g")
        //             //     .attr("class", "x axis")
        //             //     .attr("transform", "translate(0," + innerheight + ")")
        //             //     .call(x_axis)
        //             //     .append("text")
        //             //     .attr("dy", "-.71em")
        //             //     .attr("x", innerwidth)
        //             //     .style("text-anchor", "end")
        //             //     .text(xlabel);

        //             // svg.append("g")
        //             //     .attr("class", "y axis")
        //             //     .call(y_axis)
        //             //     .append("text")
        //             //     .attr("transform", "rotate(-90)")
        //             //     .attr("y", 6)
        //             //     .attr("dy", "0.71em")
        //             //     .style("text-anchor", "end")
        //             //     .text(ylabel);

        //             // var data_lines = svg.selectAll(".d3_xy_chart_line")
        //             //     .data(datasets.map(function (d) { return d3.zip(d.x, d.y); }))
        //             //     .enter().append("g")
        //             //     .attr("class", "d3_xy_chart_line");

        //             // data_lines.append("path")
        //             //     .attr("class", "line")
        //             //     .attr("d", function (d) { return draw_line(d); })
        //             //     .attr("stroke", function (_, i) { return color_scale(i); });

        //             // data_lines.append("text")
        //             //     .datum(function (d, i) { return { name: datasets[i].label, final: d[d.length - 1] }; })
        //             //     .attr("transform", function (d) {
        //             //         return ("translate(" + x_scale(d.final[0]) + "," +
        //             //             y_scale(d.final[1]) + ")");
        //             //     })
        //             //     .attr("x", 3)
        //             //     .attr("dy", ".35em")
        //             //     .attr("fill", function (_, i) { return color_scale(i); })
        //             //     .text(function (d) { return d.name; });

        //         });
        //     }

        //     chart.width = function (value) {
        //         if (!arguments.length) return width;
        //         width = value;
        //         return chart;
        //     };

        //     chart.height = function (value) {
        //         if (!arguments.length) return height;
        //         height = value;
        //         return chart;
        //     };

        //     chart.xlabel = function (value) {
        //         if (!arguments.length) return xlabel;
        //         xlabel = value;
        //         return chart;
        //     };

        //     chart.ylabel = function (value) {
        //         if (!arguments.length) return ylabel;
        //         ylabel = value;
        //         return chart;
        //     };

        //     return chart;
        // }
    }

    goTo(route) {
        this.props.history.replace(`/${route}`);
    }

    componentDidMount() {
        let that = this;

        this.loadDataMuscles();

        this.setState({ currentMuscleImageBg: tempImg });
        this.setState({ currentMuscleImageOverlay: tempImg });

        window.addEventListener('resize-end', function (event) {
            that.resizeEnd(event);
        });
        var resizeEnd;
        window.addEventListener('resize', function () {
            console.log('resizing');
            clearTimeout(resizeEnd);
            resizeEnd = setTimeout(function () {
                // option 1
                var evt = new Event('resize-end');
                window.dispatchEvent(evt);
                // option 2: old-fashioned
                /*var evt = document.createEvent('Event');
                evt.initEvent('resize-end', true, true);
                window.dispatchEvent(evt);*/
            }, 100);
        });

        window.setTimeout(function () {
            that.resizeEnd();
            that.processPieChartData();
            that.processLineChartData();
        }, 1000);
    };


    render() {
        return (
            <div className="route-assessments">
                <div className="route-nav">
                    <Nav />
                </div>

                <div id="route-content" className="route-content">
                    <div className={this.state.panelMenu ? 'anatomy-panel panel-menu active' : 'anatomy-panel panel-menu'}>
                        <div className="panel-top">

                            <div className="btn-toggle-panel-menu" onClick={this.toggleMobilePanelMenu}>
                                <Glyphicon glyph="triangle-left"></Glyphicon>
                            </div>
                            <div className="data-selector">
                                <div className="btn active"> My Data </div>
                                <div className="btn "> All Data </div>
                            </div>
                        </div>
                        <div id="panel-menu-main" className="panel-main">

                            {/*<div className="muscle-menu">
                                <div className="title">
                                    <p> Muscle </p>
                                </div>
                                <div className="muscle-selector">
                                    <select className="select" onChange={this.onMuscleSelectorChange}>
                                        {this.state.listMuscles}
                                    </select>
                                </div>
                            </div>*/}
                            <div className="condition-menu">
                                <div className="title">
                                    <p> Condition </p>
                                </div>
                                <div className="condition-selector">
                                    <select className="select">
                                        <option value="Hemifacial spasm"> Hemifacial spasm </option>
                                        <option value="Belphrospasm" disabled={true}> Belphrospasm </option>
                                        <option value="Anterocollis" disabled={true}> Anterocollis </option>
                                        <option value="Laterolcollis" disabled={true}> Laterolcollis </option>
                                        <option value="Retrocollis" disabled={true}> Retrocollis </option>
                                        <option value="Torocollis" disabled={true}> Torocollis </option>
                                        <option value="Other" disabled={true}> Other </option>

                                    </select>
                                </div>
                            </div>
                            <div className="data-menu">
                                <div className="title">
                                    <p> Data? / View data by </p>
                                </div>
                                <div className="data-selector">
                                    <select className="select">
                                        <option value="# of injections"> # of injections </option>
                                        <option value="Average Dose"> Average Dose </option>
                                    </select>
                                </div>
                            </div>
                            {/*<div className="views-menu">
                                <div className="title">
                                    <p> Additional Views </p>
                                </div>
                                <div className="views">
                                    { 
                                        (this.state.listMuscleViews.length > 0 ?
                                        this.state.listMuscleViews : 
                                        <div className="view"> <div className="inner">  </div> </div>)
                                    }
                                </div>
                            </div>*/}
                        </div>
                        <div className="panel-bottom">

                        </div>


                    </div>
                    <div className="anatomy-panel panel-view">
                        <div className="panel-top">
                            <div className="btn-toggle-panel-menu" onClick={this.toggleMobilePanelMenu}>
                                {this.state.panelMenu ? '' :
                                    <Glyphicon glyph="triangle-right"></Glyphicon>
                                }
                            </div>
                            <p> Benefits over time </p>
                        </div>
                        <div id="panel-view-main" className="panel-main">
                            <div className="panel-main-inner">
                                <button id="linechartrandom" className="randomize">randomize</button>
                                <div id="linechart" className="linechart">

                                </div>
                            </div>
                        </div>
                        <div className="panel-bottom">

                        </div>

                    </div>

                    <div className="anatomy-panel panel-data">
                        <div className="panel-top">
                            <p> Most common side effects </p>
                        </div>
                        <div className="panel-main">
                            <div className="panel-main-inner">
                                <button id="piechartrandom" className="randomize">randomize</button>
                                <div id="piechart">

                                </div>
                            </div>
                        </div>
                        <div className="panel-bottom">

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}