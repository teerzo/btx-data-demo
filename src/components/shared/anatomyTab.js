
'use strict';

// Libs
import React from 'react';
import simpleheat from 'simpleheat';

import colourGradient from '../helper/colourgradient.js';
import AnatomyOptions from '../shared/anatomyOptions';
import AnatomyInfo from '../shared/anatomyInfo';
import Heatmap from '../shared/heatmap';



// import React from 'react';
// import { routeNode } from 'react-router5';
// import * as d3 from "d3";
// import * as d3Queue from "d3-queue";
// import axios from 'axios';
// import qs from 'qs';
// import simpleheat from 'simpleheat';

// // Components
// import colourGradient from '../helper/colourgradient.js';
// import Nav from '../nav';
// import TaskPopup from '../shared/taskPopup';
// import AnatomyTab from '../shared/anatomyTab';
// import AnatomyTabButton from '../shared/anatomyTabButton';
// import AnatomyTabs from '../shared/anatomyTabs';

// css
import '../../styles/shared/anatomyTab.scss';

export default class AnatomyTab extends React.Component {
    constructor(props) {
        super(props);
        this.initialize = this.initialize.bind(this);
        this.update = this.update.bind(this);
        this.updateZones = this.updateZones.bind(this);
        this.updatePoints = this.updatePoints.bind(this);
        this.updateValues = this.updateValues.bind(this);
        this.setValues = this.setValues.bind(this);

        this.isPointInZone = this.isPointInZone.bind(this);

        this.toggleSliders = this.toggleSliders.bind(this);
        this.updateCursorPosition = this.updateCursorPosition.bind(this);
        this.checkCursorValue = this.checkCursorValue.bind(this);

        this.heatmapUpdateFinish = this.heatmapUpdateFinish.bind(this);

        this.state = {
            optionsChanged: false,

            tempString: '....',

            imgBg: null,
            imgOver: null,
            showBg: true,

            heatmapRadius: 9,
            heatmapBlur: 2,
            heatmapDistance: 9,
            heatmapMax: 1.5,

            dataPoints: [],
            dataMuscles: [],
            dataPhysicians: [],
            tabData: {
                tabName: '....',

                info: {
                    title: '....'
                }
            },

            currentMuscle: null,

            showSliders: false,
            scaleMin: '??',
            scaleMax: '??',

            rawPos: {
                posX: 0,
                posY: 0,
            },
            cursorPos: {
                posX: 0,
                posY: 0,
            }
        }
    }
    componentWillReceiveProps(newProps) {
        // console.log('anatomyTab update', newProps.update);
        // console.log('AnatomyTab componentWillReceiveProps'); 
        // console.log()
        this.setState({
            optionsChanged: newProps.optionsChanged,
            dataPoints: newProps.dataPoints,
            dataMuscles: newProps.dataMuscles,
            dataPhysicians: newProps.dataPhysicians,
            tabData: newProps.tabData,
            tabIndex: newProps.tabIndex,
            index: newProps.index,
        }, this.update);
    }

    componentDidMount() {
        // console.log('anatomyTab init', this.props.update);
        // console.log(this.props.tabData);

        window.setTimeout(function () {
            this.setState({
                optionsChanged: this.props.optionsChanged,
                dataPoints: this.props.dataPoints,
                dataMuscles: this.props.dataMuscles,
                dataPhysicians: this.props.dataPhysicians,
                tabData: this.props.tabData,
                tabIndex: this.props.tabIndex,
                index: this.props.index,
            }, this.initialize);
        }.bind(this), 1000);
    };

    initialize() {
        this.setValues();

        let dom = document.getElementById('heatmap-container');
        dom.addEventListener('mousemove', function(event) {
            // console.log('mouse move', event);

            // let newX = (this.props.width / event.offsetX) + this.props.width;
            // let newY = (this.props.height / event.offsetY) + this.props.height;

            // let newX = (event.offsetX / 100) / this.props.width;
            // let newY = (event.offsetY / 100) / this.props.height;

            // let newX = ( this.props.width - event.offsetX ) / this.props.width;
            // let newY = ( this.props.height - event.offsetY ) / this.props.height;

            const width = 1000 * 0.3;
            const height = 1130 * 0.3;

            let newX = ( width - event.offsetX ) / width * -1 + 1;
            let newY = ( height - event.offsetY ) / height * -1 + 1;

            newX = newX.toFixed(3);
            newY = newY.toFixed(3);

            this.setState({
                rawPos: { posX: event.offsetX, posY: event.offsetY },
                cursorPos: { posX: newX, posY: newY }
            // }, this.checkCursorValue );
            }, this.updateCursorPosition );
        }.bind(this));

        this.update();
    };

    update() {

        let imgBg = null;
        let imgOver = null;
        let imgs = [];
        let muscle = null;
        if (this.state.dataMuscles && this.state.dataMuscles.length > 0) {
            for (let i = 0; i < this.state.dataMuscles.length; i++) {
                if (this.state.tabData.muscleId !== '' && this.state.tabData.muscleId === this.state.dataMuscles[i].id) {
                    if (this.state.dataMuscles[i].muscles && this.state.dataMuscles[i].muscles.length > 0) {
                        for (let m = 0; m < this.state.dataMuscles[i].muscles.length; m++) {
                            if (this.state.dataMuscles[i].muscles[m].muscleId === this.state.tabData.muscleViewId) {
                                muscle = this.state.dataMuscles[i].muscles[m];

                                imgBg = muscle.muscleImgBg;
                                imgOver = muscle.muscleImgOverlay;
                                imgs.push(muscle.muscleImgOverlay);
                            }
                        }
                    }
                }
            }
        }
        this.setState({
            currentMuscle: muscle,

            imgBg: imgBg,
            imgOver: imgOver,
            imgs: imgs,
        }, this.updateZones);
    }

    updateZones() {
        console.log('updateZones');
        const currentMuscle = this.state.currentMuscle;
        let tab = this.state.tabData;

        let zones = [];
        let pointsAll = [];

        let scaleMin = null;
        let scaleMax = null;

        if (currentMuscle) {
            console.log(currentMuscle);
            zones = currentMuscle.zones;
            for (let z = 0; z < zones.length; z++) {
                zones[z].points = [];
            }

            // for (let ph = 0; ph < this.state.dataPhysicians.length; ph++) {
            //     if (tab.physicianId === this.state.dataPhysicians[ph].physicianId) {
            //         const physician = this.state.dataPhysicians[ph];

            //         for (let c = 0; c < physician.conditions.length; c++) {
            //             if (tab.conditionId === physician.conditions[c].condition_id) {
            //                 const condition = physician.conditions[c];

            //                 for (let pa = 0; pa < condition.patients.length; pa++) {
            //                     const patient = condition.patients[pa];

            //                     if (patient.sessions && patient.sessions.length > 0) {
            //                         for (let s = 0; s < patient.sessions.length; s++) {
            //                             const session = patient.sessions[s];

            //                             // console.log('injections', session.injections.length);
            //                             if (session.injections && session.injections.length > 0) {
            //                                 for (let i = 0; i < session.injections.length; i++) {
            //                                     const injection = session.injections[i];

            //                                     if (injection.muscle_image_id === currentMuscle.muscleId) {
            //                                         let point = {
            //                                             x: injection.injection_x_point,
            //                                             y: injection.injection_y_point,
            //                                             z: 2,
            //                                             zinjection_id: injection.injection_id,
            //                                         }
                                                    

            //                                         console.log('check', tab.visualId);
            //                                         if( tab.visualId === 1 ) {
            //                                             scaleMin = '1%';
            //                                             scaleMax = '100%';
            //                                             pointsAll.push(point);
            //                                         }
            //                                         else if( tab.visualId === 2 ) {
            //                                             if( tab.drugId === injection.injection_medication_id ) {
            //                                                 if( injection.injection_site_amount < scaleMin || scaleMin === null) {
            //                                                     scaleMin = injection.injection_site_amount;
            //                                                 } 
            //                                                 else if(  injection.injection_site_amount > scaleMax || scaleMax === null) {
            //                                                     scaleMax = injection.injection_site_amount;
            //                                                 }
            //                                                 pointsAll.push(point);
            //                                             }
            //                                         } 
            //                                         else if( tab.visualId === 3 ) {
            //                                             if( tab.drugId === injection.injection_medication_id ) {
            //                                                 if( injection.injection_site_amount < scaleMin || scaleMin === null) {
            //                                                     scaleMin = injection.injection_site_amount;
            //                                                 } 
            //                                                 else if(  injection.injection_site_amount > scaleMax || scaleMax === null) {
            //                                                     scaleMax = injection.injection_site_amount;
            //                                                 }
            //                                                 pointsAll.push(point);
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
            //     }
            // }

            for (let ph = 0; ph < this.state.dataPhysicians.length; ph++) {
                if (tab.physicianId === this.state.dataPhysicians[ph].physicianId) {
                    const physician = this.state.dataPhysicians[ph];

                    // console.log('injections', session.injections.length);
                    if (physician.injections && physician.injections.length > 0) {
                        for (let i = 0; i < physician.injections.length; i++) {
                            const injection = physician.injections[i];

                            if (injection.muscleId === currentMuscle.muscleId) {
                                let point = {
                                    x: injection.injectionX,
                                    y: injection.injectionY,
                                    z: 2,
                                    zinjection_id: injection.injectionId,
                                }
                                

                                console.log('check', tab.visualId);
                                if( tab.visualId === 1 ) {
                                    scaleMin = '1%';
                                    scaleMax = '100%';
                                    pointsAll.push(point);
                                }
                                else if( tab.visualId === 2 ) {
                                    // if( tab.drugId === injection.injection_medication_id ) {
                                    //     if( injection.injection_site_amount < scaleMin || scaleMin === null) {
                                    //         scaleMin = injection.injection_site_amount;
                                    //     } 
                                    //     else if(  injection.injection_site_amount > scaleMax || scaleMax === null) {
                                    //         scaleMax = injection.injection_site_amount;
                                    //     }
                                        pointsAll.push(point);
                                    // }
                                } 
                                else if( tab.visualId === 3 ) {
                                    // if( tab.drugId === injection.injection_medication_id ) {
                                    //     if( injection.injection_site_amount < scaleMin || scaleMin === null) {
                                    //         scaleMin = injection.injection_site_amount;
                                    //     } 
                                    //     else if(  injection.injection_site_amount > scaleMax || scaleMax === null) {
                                    //         scaleMax = injection.injection_site_amount;
                                    //     }
                                        pointsAll.push(point);
                                    // }
                                }                                                                                               
                            }
                        }
                    }
                }
            }

            for (let p = 0; p < pointsAll.length; p++) {
                const point = pointsAll[p];
                let zoneIndex = null;

                for (let z = 0; z < zones.length; z++) {
                    const zone = zones[z];

                    if (this.isPointInZone(zone, point)) {
                        zoneIndex = z;
                    }
                }
                if (zoneIndex !== null) {
                    zones[zoneIndex].points.push(point);
                }
            }

        }


        this.setState({
            scaleMin: scaleMin,
            scaleMax: scaleMax,
            zones: zones,
        }, this.updatePoints);
    }

    updatePoints() {
        // console.log('updatePoints');
        let tab = this.state.tabData;


        const zones = this.state.zones;

        let pointsTotal = 0;

        for (let z = 0; z < zones.length; z++) {
            let zone = zones[z];

            if( zone.points && zone.points.length > 0 ) {
                for( let p = 0; p < zone.points.length; p++ ) {
                    pointsTotal += 1;
                } 
            }
        }

        for (let z = 0; z < zones.length; z++) {
            let zone = zones[z];



            if( zone.points && zone.points.length > 0 ) {
                zone.percentage = Math.floor(pointsTotal/zone.points.length) * 100;
            }
        }

        if( zones && zones.length > 0 ) {
            console.log(zones);
            ;



            let colours1 = { 0: '#0000ff', 0.5: '#00ff00', 1: '#ff0000' };
            let colours2 = { 0: '#0000ff', 0.5: '#00ff00', 1: '#ff0000' };
            let colours3 = { 0: '#000000', 0.5: '#7d5271', 1: '#ca364d' };


            for (let z = 0; z < zones.length; z++) {
                let zone = zones[z];

                if (tab.visualId === 1) {
                    zone.gradient = colours1;
                }
                if (tab.visualId === 2) {
                    zone.gradient = colours2;
                }
                if (tab.visualId === 3) {
                    zone.gradient = colours3;
                }
            }
        }

        this.setState({
            dataPoints: zones,
            // dataPoints: layers,
        })

      


    //     let groups = [];
    //     let newPoints = data.slice(0);
    //     ;
    //     while (newPoints.length > 0) {
    //         let point1 = newPoints[0];
    //         let add = false;
    //         // console.log('point1', point1);


    //         ///
    //         let lowDist = null;
    //         let lowGroupI = null;


    //         for (let i = 0; i < groups.length; i++) {
    //             for (let j = 0; j < groups[i].length; j++) {
    //                 let point2 = groups[i][j];
    //                 // console.log('point2', point2);
    //                 let a = point1.x - point2.x;
    //                 let b = point1.y - point2.y;
    //                 let distance = Math.sqrt(a * a + b * b);
    //                 console.log('check', this.state.heatmapDistance);
    //                 if (distance <= this.state.heatmapDistance * 0.01) {
    //                     add = true;
    //                     if (distance < lowDist || lowDist === null) {
    //                         lowDist = distance;
    //                         // console.log('lowGroupI before', i);
    //                         lowGroupI = i;
    //                     }
    //                 }
    //             }
    //         }
    //         if (add) {
    //             // console.log('lowGroupI after', lowGroupI);
    //             groups[lowGroupI].push(point1);
    //             newPoints = newPoints.slice(1, newPoints.length);
    //         }
    //         else {
    //             let temp = [];
    //             temp.push(point1);
    //             groups.push(temp);
    //             newPoints = newPoints.slice(1, newPoints.length);
    //         }
    //     }



    //     // console.log('groups', groups);

    //     let finalGroups = [];
    //     for (let i = 0; i < groups.length; i++) {
    //         let dataPercentage = (groups[i].length / points.length) * 100;
    //         finalGroups.push({
    //             points: groups[i],
    //             gradient: null,
    //             percentage: dataPercentage,
    //         });
    //     }
    //     // console.log('final group before', finalGroups);
    //     finalGroups = finalGroups.sort(function (a, b) {
    //         let ap = a.percentage;
    //         let bp = b.percentage;

    //         if (ap < bp) {
    //             return 1;
    //         }
    //         if (ap > bp) {
    //             return -1;
    //         }
    //         // names must be equal
    //         return 0;
    //     });
    //     // console.log('final group after', finalGroups);

    //     if (finalGroups.length > 0) {

    //         let finalMin = finalGroups[0].percentage;
    //         let finalMax = finalGroups[finalGroups.length - 1].percentage;


    //         let colours = [];
    //         let colourRange = [
    //             '0000FF',
    //             '61e139',
    //             'eeee33',
    //             'fe1612'
    //         ];
    //         // #fe1612,#eeee33,#61e139,#0000FF 

    //         let colorMax = (finalGroups.length + 3) * 3;
    //         if (colorMax > 10) {
    //             colorMax = 10;
    //         }
    //         else if (colorMax < 10) {
    //             colorMax = 10;
    //         }
    //         // console.log(colorMax);

    //         let colours3 = colourGradient.generateColor('#' + colourRange[3], '#' + colourRange[2], colorMax);
    //         let colours2 = colourGradient.generateColor('#' + colourRange[2], '#' + colourRange[1], colorMax);
    //         let colours1 = colourGradient.generateColor('#' + colourRange[1], '#' + colourRange[0], colorMax);


    //         colours.push(colourRange[0]);
    //         colours = colours.concat(colours1);
    //         colours.push(colourRange[1]);
    //         colours = colours.concat(colours2);
    //         colours.push(colourRange[2]);
    //         colours = colours.concat(colours3);
    //         colours.push(colourRange[3]);

    //         // console.log(colours);
    //         ;
    //         // generateColor('#000000','#ff0ff0',10);

    //         let domRange = document.getElementById('color-range');
    //         domRange.innerHTML = '';
    //         ;
    //         for (let i = 0; i < colours.length; i++) {
    //             let colorDiv = document.createElement('div');
    //             colorDiv.classList.add('color-div');
    //             colorDiv.style.backgroundColor = '#' + colours[i];
    //             colorDiv.innerHTML = i + "° - #" + colours[i];
    //             // domRange.appendChild(colorDiv);
    //             // $('#result_show').append("<div style='padding:8px;color:#FFF;background-color:#"+tmp[cor]+"'>COLOR "+cor+"° - #"+tmp[cor]+"</div>")
    //         }


    //         // console.log('finalGroups.length', finalGroups.length);
    //         // console.log('colours.length', colours.length);
    //         ;

    //         // if( ) {

    //         // }

    //         for (let i = 0; i < finalGroups.length; i++) {
    //             let colourI = 0

    //             //((input - min) * 100) / (max - min)
    //             // colourI = ((finalGroups[i].percentage - finalMin) * 100) / (finalMax - finalMin)
    //             // console.log('colourI percentage', colourI);
    //             // console.log('finalGroups[i].percentage', finalGroups[i].percentage);
    //             // console.log('finalMin', finalMin);
    //             // console.log('finalMax', finalMax);


    //             colourI = Math.round((finalGroups[i].percentage / 100) * colours.length);
    //             // console.log('colourI before', colourI);
    //             // // max-(min-input);

    //             // colourI = colours.length - ( 0 - colourI);

    //             // console.log('colourI after', colourI);
    //             colourI = Math.round(colourI);
    //             let colourILess = colourI - 5;

    //             if (colourI < 0) {
    //                 colourI = 0;
    //             }
    //             else if (colourI > colours.length - 1) {
    //                 colourI = colours.length - 1;
    //             }
    //             if (colourILess < 0) {
    //                 colourILess = 0;
    //             }
    //             else if (colourILess > colours.length - 1) {
    //                 colourILess = colours.length - 1;
    //             }

    //             if (tab.visualId === 1) {
    //                 finalGroups[i].gradient = { 0: '#000000', 0.5: '#' + colours[colourILess], 1: '#' + colours[colourI] };
    //             }
    //             else if (tab.visualId === 2) {
    //                 // finalGroups[i].gradient = { 0: '#000000', 0.5: '#' + colours[colourILess], 1: '#' + colours[colourI] };
    //                 finalGroups[i].gradient = { 0: '#0000ff', 0.5: '#00ff00', 1: '#ff0000' };


    //             }
    //             else if (tab.visualId === 3) {
    //                 finalGroups[i].gradient = { 0: '#000000', 0.5: '#7d5271', 1: '#ca364d' };
    //                 // finalGroups[i].gradient = { 0: '#7d5271', 1: '#ca364d' };

    //             }



    //             // finalGroups[i].gradient = { 0:'#'+colours[colourILess], 1: '#'+colours[colourI] };

    //             if (finalGroups[i].points.length > 0) {
    //                 // layers.push({
    //                 //     id: 1,
    //                 //     points: points,
    //                 //     gradient: gradient,                                   
    //                 //     // gradient: { 0: '#330000', 0.5: '#990000', 1: '#ff0000' }                                    
    //                 // });

    //                 // that.createHeatmap(finalGroups[i].points, finalGroups[i].gradient);
    //             }
    //         }
    //     }



    //     /////////////////////////

    //     // layers.push({
    //     //     id: 1,
    //     //     points: points,
    //     //     gradient: { 0: '#330000', 0.5: '#990000', 1: '#ff0000' }
    //     // });


    //     ;
    //     console.log(finalGroups);

    //     this.setState({
    //         dataPoints: finalGroups,
    //         // dataPoints: layers,
    //     }, this.updateTabs)
    // }
}

updateValues() {
    let distance = Number(document.getElementById('points-radius').value);
    let blur = Number(document.getElementById('heatmap-blur').value);
    let radius = Number(document.getElementById('heatmap-radius').value);
    let max = Number(document.getElementById('heatmap-max').value) * 0.1;
    // let heatmapMaximum = document.getElementById('heatmap-max').value;

    console.log('updateValues', distance, radius, blur);

    this.setState({ 
        optionsChanged: true,
        heatmapDistance: distance, 
        heatmapBlur: blur, 
        heatmapRadius: radius, 
        heatmapMax: max
    }, this.update);
}

setValues() {
    let distance = document.getElementById('points-radius');
    let blur = document.getElementById('heatmap-blur');
    let radius = document.getElementById('heatmap-radius');
    let max = document.getElementById('heatmap-max');

    if (distance) {
        distance.value = this.state.heatmapDistance;
    }
    if (blur) {
        blur.value = this.state.heatmapBlur;
    }
    if (radius) {
        radius.value = this.state.heatmapRadius;
    }
    if (max) {
        max.value = this.state.heatmapMax * 10;
    }
    // if (heatmapMaximum) {
    //     heatmapMaximum.value = this.state.heatmapMaximum;
    // }
}

isPointInZone(zone, point) {
    let result = true;

    return result;
}

toggleSliders(value) {
    console.log('parent check', value);

    this.setState({ showSliders: value });
}

updateCursorPosition() {
    // console.log('updateCursorPosition');

    this.setState({
        // update: false,
    }, this.checkCursorValue );
}

checkCursorValue() {
    // console.log('checkCursorValue');

    const mouse = this.state.rawPos;
    // const mouse = this.state.cursorPos;

    // console.log(this.state);

    const zones = this.state.points;

    let closestDistance = null;
    let closestPoint = null;
    if( this.state.zones && this.state.zones.length > 0 ) {
        for( let z = 0; z < this.state.zones.length; z++ ) {
            const zone = this.state.zones[z];
            for( let p = 0; p < zone.points.length; p++ ) {
                const point = zone.points[p];                
                let a = mouse.posX - point[0];
                let b = mouse.posY - point[1];
                let distance = Math.sqrt(a * a + b * b);

                // console.log('distance', distance, closestDistance);

                if( closestDistance === null || closestDistance > distance ) {
                    if( distance <= 15 ) {
                        console.log('replace', distance, closestDistance )
                        closestDistance = distance;
                        closestPoint = point;
                    }                    
                }
            }
        }
    }

    // console.log('mouse point', mouse);
    // console.log('closest point', closestPoint);
    // closestPoint = null;
    if( closestPoint ) {
        console.log('Point', closestPoint);
        let tab = this.state.tabData;
        let value = null;
        // if( )

        let container = document.getElementById('heatmap-container');
        let label = document.getElementById('heatmap-label');

        label.classList.remove("hide");

        label.style.left = closestPoint[0] + container.offsetLeft;
        label.style.top = closestPoint[1] + container.offsetTop;

        for (let ph = 0; ph < this.state.dataPhysicians.length; ph++) {
            if (tab.physicianId === this.state.dataPhysicians[ph].physicianId) {
                const physician = this.state.dataPhysicians[ph];

                for (let c = 0; c < physician.conditions.length; c++) {
                    if (tab.conditionId === physician.conditions[c].condition_id) {
                        const condition = physician.conditions[c];

                        for (let pa = 0; pa < condition.patients.length; pa++) {
                            const patient = condition.patients[pa];

                            if (patient.sessions && patient.sessions.length > 0) {
                                for (let s = 0; s < patient.sessions.length; s++) {
                                    const session = patient.sessions[s];

                                    // console.log('injections', session.injections.length);
                                    if (session.injections && session.injections.length > 0) {
                                        for (let i = 0; i < session.injections.length; i++) {
                                            const injection = session.injections[i];

                                            console.log('check injection', injection);
                                            if( injection.injection_id === closestPoint.zinjection_id ) {
                                                console.log('$$$', injection);
                                                value = injection.injection_site_amount;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.setState({
            cursorValue: value
        });

    }
    else {
        let container = document.getElementById('heatmap-container');
        let label = document.getElementById('heatmap-label');

        label.classList.add("hide");

        // label.style.left = container.offsetLeft;
        // label.style.top = container.offsetTop;
    }
}

heatmapUpdateFinish () {
    // console.log('UPDATE FINISH');
    this.setState({
        optionsChanged: false,
    });
}


render() {
    return (
        <div className="component-anatomy-tab">
            <div className="options-parent">
                <AnatomyOptions
                    dataPoints={this.state.dataPoints}
                    dataMuscles={this.state.dataMuscles}
                    dataPhysicians={this.state.dataPhysicians}
                    tabData={this.state.tabData}
                    triggerUpdate={this.props.triggerUpdate}
                    onPhysicianSelectChange={this.props.onPhysicianSelectChange}
                    onDataSelectChange={this.props.onDataSelectChange}
                    onConditionSelectChange={this.props.onConditionSelectChange}
                    onMuscleSelectChange={this.props.onMuscleSelectChange}
                    onVisualSelectChange={this.props.onVisualSelectChange}
                    onDrugSelectChange={this.props.onDrugSelectChange}
                    onMuscleViewClick={this.props.onMuscleViewClick}
                />
            </div>
            <div className="visual-parent">
                {/* <AnatomyCanvas/> */}
                <div id="heatmap-label" className="">
                    <div className="label-line"> 
                    
                    </div>
                    <div className="label-info"> 
                        <p> Test </p>
                    </div>
                </div>
                {/* <div className="title"> {this.state.tabData.tabName} </div> */}
                <Heatmap
                    optionsChanged={this.state.optionsChanged}

                    points={this.state.dataPoints}
                    imgBg={this.state.imgBg}
                    imgOver={this.state.imgOver}
                    showBg={this.state.showBg}

                    imgs={this.state.imgs}
                    zones={this.state.zones}

                    max={this.state.heatmapMax}
                    radius={this.state.heatmapRadius}
                    blur={this.state.heatmapBlur}
                    distance={this.state.heatmapDistance}

                    width={1000 * 0.3} height={1130 * 0.3}


                    rawPos={this.state.rawPos}
                    cursorPos={this.state.cursorPos}
                    cursorValue={this.state.cursorValue}

                    updateFinish={this.heatmapUpdateFinish}
                    updateCursorPosition={this.updateCursorPosition}
                    onToggleSliders={this.toggleSliders}
                />

                <div className={this.state.showSliders ? 'ranges active' : 'ranges inactive'}>
                    <div className="range-item">
                        <p> Distance - {this.state.heatmapDistance} </p>
                        <input id="points-radius" className="range" type="range" min="1" max="50" onChange={this.updateValues} />
                    </div>
                    <div className="range-item">
                        <p> Radius - {this.state.heatmapRadius} </p>
                        <input id="heatmap-radius" className="range" type="range" min="1" max="20" onChange={this.updateValues} />
                    </div>
                    <div className="range-item">
                        <p> Blur - {this.state.heatmapBlur} </p>
                        <input id="heatmap-blur" className="range" type="range" min="1" max="10" onChange={this.updateValues} />
                    </div>
                    <div className="range-item">
                        <p> Max - {this.state.heatmapMax} </p>
                        <input id="heatmap-max" className="range" type="range" min="1" max="100" onChange={this.updateValues} />
                    </div>
                    {/* <div className="range-item hidden">
                            <p> heatmap max </p>
                            <input id="heatmap-max" className="range" type="range" min="1" max="20" onChange={this.updateValues} />
                        </div> */}
                </div>
                <div className="colour-range">
                    <div className={this.state.tabData.visualId !== '' ? "colour-range-bg range-" + this.state.tabData.visualId : 'colour-range-bg'}> </div>
                    <div className="colour-range-text">
                        <div className="colour-range-text-left"> {this.state.scaleMin} </div>
                        <div className="colour-range-text-center"> scale </div>
                        <div className="colour-range-text-right"> {this.state.scaleMax} </div>
                    </div>
                </div>

            </div>
            <div className="info-parent">
                <AnatomyInfo
                    dataPoints={this.state.dataPoints}
                    dataMuscles={this.state.dataMuscles}
                    dataPhysicians={this.state.dataPhysicians}
                    tabData={this.state.tabData}
                // triggerUpdate={this.props.triggerUpdate}
                // onPhysicianSelectChange={this.props.onPhysicianSelectChange}
                // onDataSelectChange={this.props.onDataSelectChange}
                // onConditionSelectChange={this.props.onConditionSelectChange}
                // onMuscleSelectChange={this.props.onMuscleSelectChange}
                // onVisualSelectChange={this.props.onVisualSelectChange}
                />
            </div>
        </div>
    )
}
}