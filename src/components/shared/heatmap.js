
import React from 'react';

import * as d3 from "d3";
import * as d3Queue from "d3-queue";

// let queue = require('d3-queue').queue;
import axios from 'axios';
import simpleheat from 'simpleheat';

import colourGradient from '../helper/colourgradient.js';
import '../../styles/shared/heatmap.scss';

export default class Heatmap extends React.Component {
    constructor(props) {
        super(props);

        this.initialize = this.initialize.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);

        this.update = this.update.bind(this);
        this.createImgCanvas = this.createImgCanvas.bind(this);
        this.createPointsCanvas = this.createPointsCanvas.bind(this);
        this.mergeCanvas = this.mergeCanvas.bind(this);

        this.processPoints2 = this.processPoints2.bind(this);

        this.checkCursorValue = this.checkCursorValue.bind(this);

        this.mergeCanvases = this.mergeCanvases.bind(this);
        this.createImgCanvases = this.createImgCanvases.bind(this);
        this.processPoints = this.processPoints.bind(this);
        this.checkPointDistance = this.checkPointDistance.bind(this);
        this.createHeatmap = this.createHeatmap.bind(this);
        this.clearHeatmap = this.clearHeatmap.bind(this);

        this.updateValue = this.updateValue.bind(this);
        this.setValues = this.setValues.bind(this);

        this.updateCursorPosition = function(e, item) {
            if (typeof this.props.updateCursorPosition === 'function') {
                this.props.updateCursorPosition(e, item);
            }
        }.bind(this)
        this.updateFinish = function() {
            if (typeof this.props.updateFinish === 'function') {
                this.props.updateFinish();
            }
        }.bind(this)
       

        this.onToggleSliders = function (e) {
            console.log('child trigger');

            const value = !this.state.showSliders;
            function onDone() {
                if (typeof this.props.onToggleSliders === 'function') {
                    this.props.onToggleSliders(value);
                }
            }
            this.setState({ showSliders: value }, onDone);
        }.bind(this)


        this.state = {
            testImg: './images/temp.png',

            optionsChanged: false,

            updating: false,

            debug: true,
            debugResize: true,
            radius: 2, // 10
            blur: 2, // 2
            max: 2,

            distance: 10,
            points: [],
            rawPoints: [],

            imgBg: null,
            imgs: [],
            zones: [],

            showSliders: false,
            cursorValue: 0,
            rawPos: {
                posX: 0,
                posY: 0,
            },
            cursorPos: {
                posX: 0,
                posY: 0,
            },
        }
    }

    componentWillReceiveProps(newProps) {
        // console.log('heatmap update', newProps.optionsChanged);



        this.setState({
            optionsChanged: newProps.optionsChanged ? true : false,

            points: newProps.points,
            width: newProps.width,
            height: newProps.height,

            imgBg: newProps.imgBg,
            imgOver: newProps.imgOver,
            showBg: newProps.showBg,

            imgs: newProps.imgs,
            zones: newProps.zones,


            max: newProps.max,
            blur: newProps.blur,
            radius: newProps.radius,
            distance: newProps.distance,

            rawPos: newProps.rawPos,
            cursorPos: newProps.cursorPos,
            cursorValue: newProps.cursorValue,
            // rawPoints: newProps.points,

            // size: newProps.size,
        }, this.update);
    }

    componentDidMount() {
        console.log('heatmap init', this.props.optionsChanged);

        this.setState({
            optionsChanged: this.props.optionsChanged ? true : false,

            points: this.props.points,
            width: this.props.width,
            height: this.props.height,

            imgBg: this.props.imgBg,
            imgOver: this.props.imgOver,
            showBg: this.props.showBg,

            imgs: this.props.imgs,
            zones: this.props.zones,

            max: this.props.max,
            blur: this.props.blur,
            radius: this.props.radius,
            distance: this.props.distance,

            rawPos: this.props.rawPos,
            cursorPos: this.props.cursorPos,
            cursorValue: this.props.cursorValue,

        }, this.initialize);
    };

    initialize() {
        let that = this;

        let defaultMuscleId = null;
        let defaultViewId = null;

        // console.log('points', this.props.points);
        // console.log('size', this.props);

        let domdistance = document.getElementById('points-radius');
        if (domdistance) {
            domdistance.value = this.state.distance;
        }

        // let domCmpHeatmap = document.getElementById('cmp-heatmap');
        // domCmpHeatmap.style.width = this.props.width + 'px';
        // domCmpHeatmap.style.height = this.props.height + 'px';

        // this.setHeatmapDefaults();

        // this.initResizeListeners();
            // this.resizeEnd(null);
        // let dom = document.getElementById('heatmap-container');
        // dom.addEventListener('mousemove', function(event) {
        //     // console.log('mouse move', event);

        //     // let newX = (this.props.width / event.offsetX) + this.props.width;
        //     // let newY = (this.props.height / event.offsetY) + this.props.height;

        //     // let newX = (event.offsetX / 100) / this.props.width;
        //     // let newY = (event.offsetY / 100) / this.props.height;

        //     // let newX = ( this.props.width - event.offsetX ) / this.props.width;
        //     // let newY = ( this.props.height - event.offsetY ) / this.props.height;

        //     let newX = ( this.props.width - event.offsetX ) / this.props.width * -1 + 1;
        //     let newY = ( this.props.height - event.offsetY ) / this.props.height * -1 + 1;

        //     newX = newX.toFixed(3);
        //     newY = newY.toFixed(3);

        //     this.setState({
        //         rawPos: { posX: event.offsetX, posY: event.offsetY },
        //         cursorPos: { posX: newX, posY: newY }
        //     // }, this.checkCursorValue );
        //     }, this.updateCursorPosition );
        // }.bind(this));


        this.setValues();
        this.resizeCanvas();
        // this.processPoints();
        this.update();
    };

    resizeCanvas() {
        // console.log('resizeCanvas');

        let width = this.props.width ? this.props.width : 100;
        let height = this.props.height ? this.props.height : 100;

        // let domContainer = d3.select("div#heatmap-container").attr('width', width).attr('height', height);
        let domContainer = document.getElementById('heatmap-container');
        if (domContainer) {
            domContainer.style.width = width + 'px';
            domContainer.style.height = height + 'px';
        }
    }

    update() {
        // console.log('heatmap update', this.state.updating, this.state.optionsChanged);
        ;


        if (!this.state.updating && this.state.optionsChanged ) {
            this.setState({
                updating: true,
            }, cbUpdate);
        }
        function cbUpdate() {
            this.clearHeatmap();
            this.createImgCanvas(function () {
                this.createPointsCanvas(function () {
                    this.mergeCanvas(function () {
                        this.setState({
                            updating: false,
                        }, this.updateFinish );
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }

        // this.clearHeatmap();
        // this.createImgCanvas(function () {
        //     this.createPointsCanvas(function () {
        //         this.mergeCanvas(function () {
        //             this.setState({
        //                 updating: false,
        //             });
        //         }.bind(this));
        //     }.bind(this));
        // }.bind(this));
    }

    createImgCanvas(callback) {
        // console.log('createImgCanvas');
        let that = this;
        if (this.state.imgBg && this.state.imgOver && this.state.showBg) {
            // console.log('valid img sources', this.state.imgBg, this.state.imgOver);
            let width = this.props.width;
            let height = this.props.height;
            var div = d3.select('#heatmap-container');


            var domCanvasBg = div.append('canvas').attr('id', 'imgBg').attr('width', width).attr('height', height);
            let canvasBg = domCanvasBg.node();
            let contextBg = canvasBg.getContext('2d');

            let imageBg = new Image();
            imageBg.src = this.state.imgBg;
            imageBg.onload = function () {
                drawImageProp(contextBg, imageBg, 0, 0, width, height, 0.5, 0.5);
                recursive(0);
            }.bind(this);

            let recursive = function (index) {
                // console.log('')
                if (index < this.state.imgs.length) {
                    let id = 'canvas-over-' + index;
                    let domCanvasOver = div.append('canvas').attr('id', id).attr('width', width).attr('height', height);
                    let canvasOver = domCanvasOver.node();
                    let contextOver = canvasOver.getContext('2d');
                    let imgOver = new Image();
                    imgOver.src = this.state.imgs[index];
                    imgOver.onload = function () {
                        drawImageProp(contextOver, imgOver, 0, 0, width, height, 0.5, 0.5);
                        recursive(index + 1);
                    }
                }
                else {
                    // zonesRecursive(0);

                    if (callback) {
                        callback();
                    }
                }
            }.bind(this);

            // let zonesRecursive = function (index) {
            //     // console.log('zonesRecursive');
            //     if (index < this.state.zones.length) {
            //         let id = 'canvas-over-' + index;
            //         let domCanvasOver = div.append('canvas').attr('id', id).attr('width', width).attr('height', height);
            //         let canvasOver = domCanvasOver.node();
            //         let contextOver = canvasOver.getContext('2d');
            //         let imgOver = new Image();
            //         imgOver.src = this.state.zones[index];
            //         imgOver.onload = function () {
            //             drawImageProp(contextOver, imgOver, 0, 0, width, height, 0.5, 0.5);
            //             zonesRecursive(index + 1);
            //         }
            //     }
            //     else {
            //         if (callback) {
            //             callback();
            //         }
            //     }
            // }.bind(this);



            // imageBg.src = this.state.imgBg;
            // imageBg.onload = function () {
            //     drawImageProp(contextBg, imageBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            //     imageOver.src = this.state.imgOver;
            //     imageOver.onload = function () {
            //         drawImageProp(contextOver, imageOver, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            //         if (callback) {
            //             callback();
            //         }
            //     }.bind(this);
            // }.bind(this);


            function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

                if (arguments.length === 2) {
                    x = y = 0;
                    w = ctx.canvas.width;
                    h = ctx.canvas.height;
                }

                // default offset is center
                offsetX = typeof offsetX === "number" ? offsetX : 0.5;
                offsetY = typeof offsetY === "number" ? offsetY : 0.5;

                // keep bounds [0.0, 1.0]
                if (offsetX < 0) offsetX = 0;
                if (offsetY < 0) offsetY = 0;
                if (offsetX > 1) offsetX = 1;
                if (offsetY > 1) offsetY = 1;

                var iw = img.width,
                    ih = img.height,
                    r = Math.min(w / iw, h / ih),
                    nw = iw * r,   // new prop. width
                    nh = ih * r,   // new prop. height
                    cx, cy, cw, ch, ar = 1;

                // decide which gap to fill    
                if (nw < w) {
                    ar = w / nw;
                }
                if (Math.abs(ar - 1) < 1e-14 && nh < h) {
                    ar = h / nh;  // updated
                }
                nw *= ar;
                nh *= ar;

                // calc source rectangle
                cw = iw / (nw / w);
                ch = ih / (nh / h);


                // MY SHIT
                // if( cw > w ) {
                //     cw = w / 2;
                // }
                // if( ch > h ) {
                //     ch = h / 2;
                // }


                cx = (iw - cw) * offsetX;
                cy = (ih - ch) * offsetY;

                // make sure source rectangle is valid
                if (cx < 0) cx = 0;
                if (cy < 0) cy = 0;
                if (cw > iw) cw = iw;
                if (ch > ih) ch = ih;

                // My stuff

                if (iw > ih) {
                    // x is offset
                    // y is 0/max height
                    cx = 0;
                    cw = iw;

                    cy = 0;
                    ch = ih;

                    x = 100;
                    w = w - 100;
                }
                else {
                    // x is 0/max height
                    // y is offset
                    cx = 0;
                    cw = iw;

                    cy = 0;
                    ch = ih;

                    // x = 0; // change me ratio calc
                    // w = w; // change me ratio calc

                    // let fixRatio = 

                    x = (w - (iw * r)) * 0.5;
                    w = iw * r;

                    y = 0;
                    h = h;
                }

                // cy = 0;
                // cw = w;
                // ch = h;
                // w -= 100
                // h -= 100;

                // cx -= 100;
                // cw += 100;

                // fill image in dest. rectangle
                console.log('draw img', cx, cy, cw, ch, x, y, w, h);
                ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
                // ctx.drawImage(img, 0.1, 0.1, cwidth, cheight, x, y, w, h);
            }

        }
        else if (this.state.testImg) {
            // console.log('creating test image', this.state.testImg);
            var div = d3.select('#heatmap-container');
            var domCanvasBg = div.append('canvas').attr('id', 'imgBg').attr('width', this.props.width).attr('height', this.props.height);
            let canvasBg = domCanvasBg.node();
            let contextBg = canvasBg.getContext('2d');



            let domCanvasOver = div.append('canvas').attr('id', 'imgOver').attr('width', this.props.width).attr('height', this.props.height);
            let canvasOver = domCanvasOver.node();
            let contextOver = canvasOver.getContext('2d');

            let imageOver = new Image();
            imageOver.src = this.state.testImg;
            imageOver.onload = function () {
                drawImageProp(contextOver, imageOver, 0, 0, that.props.width, that.props.height, 0.5, 0.5);

            }

            let imageBg = new Image();
            imageBg.src = this.state.testImg;
            imageBg.onload = function () {
                drawImageProp(contextBg, imageBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
                if (callback) {
                    callback();
                }
            }

            function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

                if (arguments.length === 2) {
                    x = y = 0;
                    w = ctx.canvas.width;
                    h = ctx.canvas.height;
                }

                // default offset is center
                offsetX = typeof offsetX === "number" ? offsetX : 0.5;
                offsetY = typeof offsetY === "number" ? offsetY : 0.5;

                // keep bounds [0.0, 1.0]
                if (offsetX < 0) offsetX = 0;
                if (offsetY < 0) offsetY = 0;
                if (offsetX > 1) offsetX = 1;
                if (offsetY > 1) offsetY = 1;

                var iw = img.width,
                    ih = img.height,
                    r = Math.min(w / iw, h / ih),
                    nw = iw * r,   // new prop. width
                    nh = ih * r,   // new prop. height
                    cx, cy, cw, ch, ar = 1;

                // decide which gap to fill    
                if (nw < w) {
                    ar = w / nw;
                }
                if (Math.abs(ar - 1) < 1e-14 && nh < h) {
                    ar = h / nh;  // updated
                }
                nw *= ar;
                nh *= ar;

                // calc source rectangle
                cw = iw / (nw / w);
                ch = ih / (nh / h);


                // MY SHIT
                // if( cw > w ) {
                //     cw = w / 2;
                // }
                // if( ch > h ) {
                //     ch = h / 2;
                // }


                cx = (iw - cw) * offsetX;
                cy = (ih - ch) * offsetY;

                // make sure source rectangle is valid
                if (cx < 0) cx = 0;
                if (cy < 0) cy = 0;
                if (cw > iw) cw = iw;
                if (ch > ih) ch = ih;

                // My stuff

                if (iw > ih) {
                    // x is offset
                    // y is 0/max height
                    cx = 0;
                    cw = iw;

                    cy = 0;
                    ch = ih;

                    x = 100;
                    w = w - 100;
                }
                else {
                    // x is 0/max height
                    // y is offset
                    cx = 0;
                    cw = iw;

                    cy = 0;
                    ch = ih;

                    // x = 0; // change me ratio calc
                    // w = w; // change me ratio calc

                    // let fixRatio = 

                    x = (w - (iw * r)) * 0.5;
                    w = iw * r;

                    y = 0;
                    h = h;
                }

                // cy = 0;
                // cw = w;
                // ch = h;
                // w -= 100
                // h -= 100;

                // cx -= 100;
                // cw += 100;

                // fill image in dest. rectangle
                // console.log('draw img', cx, cy, cw, ch, x, y, w, h);
                ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
                // ctx.drawImage(img, 0.1, 0.1, cwidth, cheight, x, y, w, h);
            }
        }
        else {
            console.log('invalid img sources', this.state.imgBg, this.state.imgOver);
            if (callback) {
                callback();
            }
        }
    }
    createPointsCanvas(callback) {
        let zones = this.state.points;
        // console.log('points before', points);
        zones = this.processPoints2(zones);
        // console.log('points after', points);


        if (zones && zones.length > 0) {
            for (let i = 0; i < zones.length; i++) {
                ;
                this.createHeatmap(zones[i].points, zones[i].gradient);
            }
        }

        if (callback) {
            callback();
        }
    }

    mergeCanvas(callback) {
        // console.log('mergeCanvas');
        var that = this;

        let children = d3.selectAll('div#heatmap-container>canvas');
        // let heatmap = document.getElementById('heatmap-container');
        // let children = heatmap.childNodes;
        // console.log(children);

        // console.log('start');

        if (!children.empty()) {
            // if (children.length > 0) {



            var div = d3.select('#heatmap-container');
            var domCanvasFinal = div.append('canvas').attr('id', 'finalCanvas').attr('alt', 'final canvas').attr('width', that.props.width - 1).attr('height', that.props.height - 1);
            let canvasFinal = domCanvasFinal.node();
            let contextFinal = canvasFinal.getContext('2d');



            // var div = d3.select('#heatmap-container');
            var domCanvas = document.createElement('canvas');
            var domCanvasBg = d3.select(domCanvas).attr('id', 'imgBg').attr('width', that.props.width).attr('height', that.props.height);
            let canvasBg = domCanvasBg.node();
            let contextBg = canvasBg.getContext('2d');

            let imageBg = new Image();
            if (that.state.imgBg) {
                imageBg.src = that.state.imgBg;
                imageBg.onload = function () {
                    // drawImageProp(contextBg, imageBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
                    // drawImageProp(contextFinal, canvasBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);

                }
            }



            // var canvasTestBg = document.getElementById('imgBg');
            // var canvasOver = document.getElementById('imgOver');

            children.each(function (d) {
                let canvas = d3.select(this);
                // console.log(canvas.node());
                // contextFinal.drawImage(canvas.node(), 0, 0);
                drawImageProp(contextFinal, canvas.node(), 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            });

            // ------------------------

            // var div = d3.select('#heatmap-container');
            // var domCanvasFinal = div.append('canvas').attr('id', 'finalCanvas').attr('alt', 'final canvas').attr('width', that.props.width - 1).attr('height', that.props.height - 1);
            // let canvasFinal = domCanvasFinal.node();
            // let contextFinal = canvasFinal.getContext('2d');



            // // var div = d3.select('#heatmap-container');
            // var domCanvas = document.createElement('canvas');
            // var domCanvasBg = d3.select(domCanvas).attr('id', 'imgBg').attr('width', that.props.width).attr('height', that.props.height);
            // let canvasBg = domCanvasBg.node();
            // let contextBg = canvasBg.getContext('2d');

            // let imageBg = new Image();
            // imageBg.src = that.state.imgBg;
            // imageBg.onload = function () {
            //     // drawImageProp(contextBg, imageBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            //     // drawImageProp(contextFinal, canvasBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);

            // }

            // // for (var i = 0; i < children.length; i++) {
            // //     console.log(children[i].canvas);
            // //     drawImageProp(contextFinal, children[i].canvas, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            // // }

            // var canvasTestBg = document.getElementById('imgBg');
            // var canvasOver = document.getElementById('imgOver');


            // // var canvas1 = document.getElementById("myCanvas1");
            // // var ctx1 = canvas1.getContext("2d");
            // // ctx1.fillStyle = "red";
            // // ctx1.fillRect(10,10,100,100);

            // // var canvas2 = document.getElementById("myCanvas2");
            // // var ctx2 = canvas2.getContext("2d");
            // // ctx2.fillStyle = "blue";
            // // ctx2.fillRect(50,50,300,100);

            // // var combined = document.getElementById("combined");
            // // var ctx = combined.getContext("2d");

            // // contextFinal.drawImage(canvasBg, 0, 0); //Copying Canvas1
            // // contextFinal.drawImage(canvasOver, 0, 0); //Copying Canvas2

            // // drawImageProp(contextFinal, canvasTestBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            // // drawImageProp(contextFinal, canvasOver, 0, 0, that.props.width, that.props.height, 0.5, 0.5);


            // children.each(function (d) {
            //     let canvas = d3.select(this);
            //     console.log(canvas.node());
            //     // contextFinal.drawImage(canvas.node(), 0, 0);
            //     drawImageProp(contextFinal, canvas.node(), 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            // });



            if (callback) {
                callback();
            }

        }
        else {
            // console.log('empty selection');
            ;
        }

        // Dont touch
        function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

            if (arguments.length === 2) {
                x = y = 0;
                w = ctx.canvas.width;
                h = ctx.canvas.height;
            }

            // w = w * 0.5;
            // h = h * 0.5;

            // default offset is center
            offsetX = typeof offsetX === "number" ? offsetX : 0.5;
            offsetY = typeof offsetY === "number" ? offsetY : 0.5;

            // keep bounds [0.0, 1.0]
            if (offsetX < 0) offsetX = 0;
            if (offsetY < 0) offsetY = 0;
            if (offsetX > 1) offsetX = 1;
            if (offsetY > 1) offsetY = 1;

            var iw = img.width,
                ih = img.height,
                r = Math.min(w / iw, h / ih),
                nw = iw * r,   // new prop. width
                nh = ih * r,   // new prop. height
                cx, cy, cw, ch, ar = 1;

            // decide which gap to fill    
            if (nw < w) ar = w / nw;
            if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
            nw *= ar;
            nh *= ar;

            // calc source rectangle
            cw = iw / (nw / w);
            ch = ih / (nh / h);

            cx = (iw - cw) * offsetX;
            cy = (ih - ch) * offsetY;

            // make sure source rectangle is valid
            if (cx < 0) cx = 0;
            if (cy < 0) cy = 0;
            if (cw > iw) cw = iw;
            if (ch > ih) ch = ih;

            // fill image in dest. rectangle
            ;

            // ctx.globalAlpha = 0.4; /// $$$ Opacity option

            ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
        }
    }

    mergeCanvases() {
        var that = this;

        let children = d3.selectAll('div#heatmap-container>canvas');
        // let heatmap = document.getElementById('heatmap-container');
        // let children = heatmap.childNodes;
        // console.log(children);



        //     d3.selectAll('g.node')  //here's how you get all the nodes
        // .each(function(d) {
        //   // your update code here as it was in your example
        //   d3.select(this) // Transform to d3 Object
        //   ... 
        // });

        //     var sel = d3.select(this).selectAll(".childNode > *").filter(function() { 
        //         return this.parentNode == child.node();
        //     });

        //     var context = canvas.node().getContext("2d")

        // if( children.node())


        // console.log('start');

        if (!children.empty()) {
            // if (children.length > 0) {



            var div = d3.select('#heatmap-container');
            var domCanvasFinal = div.append('canvas').attr('id', 'finalCanvas').attr('alt', 'final canvas').attr('width', that.props.width - 1).attr('height', that.props.height - 1);
            let canvasFinal = domCanvasFinal.node();
            let contextFinal = canvasFinal.getContext('2d');



            // var div = d3.select('#heatmap-container');
            var domCanvas = document.createElement('canvas');
            var domCanvasBg = d3.select(domCanvas).attr('id', 'imgBg').attr('width', that.props.width).attr('height', that.props.height);
            let canvasBg = domCanvasBg.node();
            let contextBg = canvasBg.getContext('2d');

            let imageBg = new Image();
            imageBg.src = that.state.imgBg;
            imageBg.onload = function () {
                // drawImageProp(contextBg, imageBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
                // drawImageProp(contextFinal, canvasBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);

            }

            // for (var i = 0; i < children.length; i++) {
            //     console.log(children[i].canvas);
            //     drawImageProp(contextFinal, children[i].canvas, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            // }

            var canvasTestBg = document.getElementById('imgBg');
            var canvasOver = document.getElementById('imgOver');


            // var canvas1 = document.getElementById("myCanvas1");
            // var ctx1 = canvas1.getContext("2d");
            // ctx1.fillStyle = "red";
            // ctx1.fillRect(10,10,100,100);

            // var canvas2 = document.getElementById("myCanvas2");
            // var ctx2 = canvas2.getContext("2d");
            // ctx2.fillStyle = "blue";
            // ctx2.fillRect(50,50,300,100);

            // var combined = document.getElementById("combined");
            // var ctx = combined.getContext("2d");

            // contextFinal.drawImage(canvasBg, 0, 0); //Copying Canvas1
            // contextFinal.drawImage(canvasOver, 0, 0); //Copying Canvas2

            // drawImageProp(contextFinal, canvasTestBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            // drawImageProp(contextFinal, canvasOver, 0, 0, that.props.width, that.props.height, 0.5, 0.5);


            children.each(function (d) {
                let canvas = d3.select(this);
                // console.log(canvas.node());
                // contextFinal.drawImage(canvas.node(), 0, 0);
                drawImageProp(contextFinal, canvas.node(), 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            });

        }
        else {
            console.log('empty selection');
            ;
        }



        // let children2 = d3.selectAll('div#heatmap-container>canvas');
        // console.log(children2);

        // children2.each(function(d) {
        //     let canvas = d3.select(this);
        //     console.log(canvas.node().getContext("2d"));

        // });


        // const detachedCanvasEl1 = document.createElement('canvas');
        // const detachedCanvasEl2 = document.createElement('canvas');
        // const imageEl           = document.createElement('img');

        // imageEl.onload = copyImageToCanvasEl1;
        // imageEl.src = 'https://jsfiddle.net/img/logo.png';

        // const copyImageToCanvasEl1 = () => {
        //     detachedCanvasEl1.width  = imageEl.width;
        //     detachedCanvasEl1.height = imageEl.height;
        //     detachedCanvasEl1.getContext('2d').drawImage(imageEl, 0, 0);

        //     copyImageToCanvasEl2();
        // };


        // const copyImageToCanvasEl2 = () => {
        //     detachedCanvasEl2.width  = detachedCanvasEl1.width;
        //     detachedCanvasEl2.height = detachedCanvasEl1.height;
        //     detachedCanvasEl2.getContext('2d').drawImage(detachedCanvasEl1, 0, 0);

        //     setTimeout(() => document.body.appendChild(detachedCanvasEl2), 2000);
        // };

        // Dont touch
        function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

            if (arguments.length === 2) {
                x = y = 0;
                w = ctx.canvas.width;
                h = ctx.canvas.height;
            }

            // w = w * 0.5;
            // h = h * 0.5;

            // default offset is center
            offsetX = typeof offsetX === "number" ? offsetX : 0.5;
            offsetY = typeof offsetY === "number" ? offsetY : 0.5;

            // keep bounds [0.0, 1.0]
            if (offsetX < 0) offsetX = 0;
            if (offsetY < 0) offsetY = 0;
            if (offsetX > 1) offsetX = 1;
            if (offsetY > 1) offsetY = 1;

            var iw = img.width,
                ih = img.height,
                r = Math.min(w / iw, h / ih),
                nw = iw * r,   // new prop. width
                nh = ih * r,   // new prop. height
                cx, cy, cw, ch, ar = 1;

            // decide which gap to fill    
            if (nw < w) ar = w / nw;
            if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
            nw *= ar;
            nh *= ar;

            // calc source rectangle
            cw = iw / (nw / w);
            ch = ih / (nh / h);

            cx = (iw - cw) * offsetX;
            cy = (ih - ch) * offsetY;

            // make sure source rectangle is valid
            if (cx < 0) cx = 0;
            if (cy < 0) cy = 0;
            if (cw > iw) cw = iw;
            if (ch > ih) ch = ih;

            // fill image in dest. rectangle
            ;
            ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
        }
    }

    createImgCanvases(callback) {
        let that = this;

        if (this.state.imgBg && this.state.imgOver && this.state.showBg) {
            console.log('valid img sources', this.state.imgBg, this.state.imgOver);
            var div = d3.select('#heatmap-container');
            var domCanvasBg = div.append('canvas').attr('id', 'imgBg').attr('width', this.props.width).attr('height', this.props.height);
            let canvasBg = domCanvasBg.node();
            let contextBg = canvasBg.getContext('2d');

            let imageBg = new Image();
            imageBg.src = this.state.imgBg;
            imageBg.onload = function () {
                drawImageProp(contextBg, imageBg, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
            }

            let domCanvasOver = div.append('canvas').attr('id', 'imgOver').attr('width', this.props.width).attr('height', this.props.height);
            let canvasOver = domCanvasOver.node();
            let contextOver = canvasOver.getContext('2d');

            let imageOver = new Image();
            imageOver.src = this.state.imgOver;
            imageOver.onload = function () {
                drawImageProp(contextOver, imageOver, 0, 0, that.props.width, that.props.height, 0.5, 0.5);
                if (callback) {
                    callback();
                }
            }
            function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

                if (arguments.length === 2) {
                    x = y = 0;
                    w = ctx.canvas.width;
                    h = ctx.canvas.height;
                }

                // default offset is center
                offsetX = typeof offsetX === "number" ? offsetX : 0.5;
                offsetY = typeof offsetY === "number" ? offsetY : 0.5;

                // keep bounds [0.0, 1.0]
                if (offsetX < 0) offsetX = 0;
                if (offsetY < 0) offsetY = 0;
                if (offsetX > 1) offsetX = 1;
                if (offsetY > 1) offsetY = 1;

                var iw = img.width,
                    ih = img.height,
                    r = Math.min(w / iw, h / ih),
                    nw = iw * r,   // new prop. width
                    nh = ih * r,   // new prop. height
                    cx, cy, cw, ch, ar = 1;

                // decide which gap to fill    
                if (nw < w) {
                    ar = w / nw;
                }
                if (Math.abs(ar - 1) < 1e-14 && nh < h) {
                    ar = h / nh;  // updated
                }
                nw *= ar;
                nh *= ar;

                // calc source rectangle
                cw = iw / (nw / w);
                ch = ih / (nh / h);


                // MY SHIT
                // if( cw > w ) {
                //     cw = w / 2;
                // }
                // if( ch > h ) {
                //     ch = h / 2;
                // }


                cx = (iw - cw) * offsetX;
                cy = (ih - ch) * offsetY;

                // make sure source rectangle is valid
                if (cx < 0) cx = 0;
                if (cy < 0) cy = 0;
                if (cw > iw) cw = iw;
                if (ch > ih) ch = ih;

                // My stuff

                if (iw > ih) {
                    // x is offset
                    // y is 0/max height
                    cx = 0;
                    cw = iw;

                    cy = 0;
                    ch = ih;

                    x = 100;
                    w = w - 100;
                }
                else {
                    // x is 0/max height
                    // y is offset
                    cx = 0;
                    cw = iw;

                    cy = 0;
                    ch = ih;

                    // x = 0; // change me ratio calc
                    // w = w; // change me ratio calc

                    // let fixRatio = 

                    x = (w - (iw * r)) * 0.5;
                    w = iw * r;

                    y = 0;
                    h = h;
                }

                // cy = 0;
                // cw = w;
                // ch = h;
                // w -= 100
                // h -= 100;

                // cx -= 100;
                // cw += 100;

                // fill image in dest. rectangle
                console.log('draw img', cx, cy, cw, ch, x, y, w, h);
                ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
                // ctx.drawImage(img, 0.1, 0.1, cwidth, cheight, x, y, w, h);
            }

        }
        else {
            console.log('invalid img sources', this.state.imgBg, this.state.imgOver);
            if (callback) {
                callback();
            }
        }
    }

    processPoints2(zones) {
        // connsole.log('processPoints2');
        let that = this;
        let ratio = that.props.width / that.props.height;
        if (zones && zones.length > 0) {
            for (let z = 0; z < zones.length; z++) {
                let zone = zones[z];
                for (let i = 0; i < zone.points.length; i++) {
                    let point = zone.points[i];

                    let x = 0;
                    let xRatio = (1130 / 1000) * that.props.width;
                    let yRatio = (that.props.width);
                    // let x = points[i].injection_x_point * (that.props.width);
                    // let xRatio = points[i].injection_x_point * that.props.width - xOffset;

                    // let x = point.x * (that.props.width);
                    // let xRatio = point.x * that.props.width - xOffset;

                    // if( point.x < 0.5 ) {
                    //     x = point.x * xRatio;
                    // }
                    // else {
                    //     x = point.x * yRatio;
                    // }

                    x = point.x * yRatio;
                    // console.log('before', x);
                    // console.log('after', xRatio);

                    // Add new ratio to this
                    point.x = x;
                    point.y = point.y * that.props.height;

                    // layer.points[i] = 

                    zone.points[i] = [point.x, point.y, point.z]
                }
                zones[z] = zone;
            }
        }
        return zones;
    };

    checkCursorValue() {
        // console.log('checkCursorValue');

        const mouse = this.state.rawPos;
        // const mouse = this.state.cursorPos;

        // console.log(this.state);

        const zones = this.state.points;

        let closestDistance = null;
        let closestPoint = null;
        if( zones && zones.length > 0 ) {
            for( let z = 0; z < zones.length; z++ ) {
                const zone = zones[z];
                for( let p = 0; p < zone.points.length; p++ ) {
                    const point = zone.points[p];                
                    let a = mouse.posX - point[0];
                    let b = mouse.posY - point[1];
                    let distance = Math.sqrt(a * a + b * b);

                    // console.log('distance', distance, closestDistance);

                    if( closestDistance === null || closestDistance > distance ) {
                        // console.log('replace', distance, closestDistance )
                        closestDistance = distance;
                        closestPoint = point;
                    }
                }
            }
        }

        console.log('mouse point', mouse);
        console.log('closest point', closestPoint);

        if( closestPoint ) {
            let container = document.getElementById('heatmap-container');
            let label = document.getElementById('heatmap-label');

            label.style.left = closestPoint[0] + container.offsetLeft;
            label.style.top = closestPoint[1] + container.offsetTop;
        }


    }


    processPoints() {
        console.log('processPoints');
        let that = this;
        var data = [];


        // canvas width / image width
        // let ratio = that.props.width / 1000;
        let ratio = that.props.width / that.props.height;
        // let ratio = that.props.height / that.props.width;
        // x = (w - ( iw * r )) * 0.5;
        // w = iw * r;

        // canvas width * 

        if (this.state.rawPoints && this.state.rawPoints.length > 0) {
            for (let i = 0; i < this.state.rawPoints.length; i++) {

                let point = {
                    x: 0,
                    y: 0,
                    z: 1,
                }

                let xOffset = (that.props.width - (1000 * ratio)) * 0.5;


                let x = this.state.rawPoints[i].injection_x_point * (that.props.width);
                let xRatio = this.state.rawPoints[i].injection_x_point * that.props.width - xOffset;

                console.log('before', x);
                console.log('after', xRatio);

                // Add new ratio to this
                point.x = x;
                point.y = this.state.rawPoints[i].injection_y_point * that.props.height;

                data.push([point.x, point.y, point.z]);
            }
            // console.log('points', data);

            that.setState({ points: data }, that.checkPointDistance);
        }
    };

    checkPointDistance() {
        let that = this;

        this.clearHeatmap();

        // append image canvases
        this.createImgCanvases(function () {
            let data = that.state.points;
            let dataRadius = [];
            let dataFull = data.slice(0);
            let dataTotal = data.length;

            // radius check 
            let tempRadius = [];
            for (let i = 0; i < data.length; i++) {
                let point1 = data[i];
                let add = false;
                for (let j = 0; j < data.length; j++) {
                    if (i !== j) {
                        let point2 = data[j];
                        let a = point1[0] - point2[0];
                        let b = point1[1] - point2[1];

                        let distance = Math.sqrt(a * a + b * b);
                        if (distance <= that.state.distance) {
                            add = true;

                        }
                    }
                }
                if (add) {
                    tempRadius.push(point1);
                }
            }
            dataRadius = tempRadius.slice(0);

            let groups = [];
            let newPoints = data.slice(0);
            ;
            while (newPoints.length > 0) {
                let point1 = newPoints[0];
                let add = false;
                // console.log('point1', point1);


                ///
                let lowDist = null;
                let lowGroupI = null;


                for (let i = 0; i < groups.length; i++) {
                    for (let j = 0; j < groups[i].length; j++) {
                        let point2 = groups[i][j];
                        // console.log('point2', point2);
                        let a = point1[0] - point2[0];
                        let b = point1[1] - point2[1];
                        let distance = Math.sqrt(a * a + b * b);
                        if (distance <= that.state.distance) {
                            add = true;
                            if (distance < lowDist || lowDist === null) {
                                lowDist = distance;
                                // console.log('lowGroupI before', i);
                                lowGroupI = i;
                            }
                        }
                    }
                }
                if (add) {
                    // console.log('lowGroupI after', lowGroupI);
                    groups[lowGroupI].push(point1);
                    newPoints = newPoints.slice(1, newPoints.length);
                }
                else {
                    let temp = [];
                    temp.push(point1);
                    groups.push(temp);
                    newPoints = newPoints.slice(1, newPoints.length);
                }
            }



            // console.log('groups', groups);

            let finalGroups = [];
            for (let i = 0; i < groups.length; i++) {
                let dataPercentage = (groups[i].length / that.state.points.length) * 100;
                finalGroups.push({
                    points: groups[i],
                    gradient: null,
                    percentage: dataPercentage,
                });
            }
            // console.log('final group before', finalGroups);
            finalGroups = finalGroups.sort(function (a, b) {
                let ap = a.percentage;
                let bp = b.percentage;

                if (ap < bp) {
                    return 1;
                }
                if (ap > bp) {
                    return -1;
                }
                // names must be equal
                return 0;
            });
            // console.log('final group after', finalGroups);

            if (finalGroups.length > 0) {

                let finalMin = finalGroups[0].percentage;
                let finalMax = finalGroups[finalGroups.length - 1].percentage;


                let colours = [];
                let colourRange = [
                    '0000FF',
                    '61e139',
                    'eeee33',
                    'fe1612'
                ];
                // #fe1612,#eeee33,#61e139,#0000FF 

                let colorMax = (finalGroups.length + 3) * 3;
                if (colorMax > 10) {
                    colorMax = 10;
                }
                else if (colorMax < 10) {
                    colorMax = 10;
                }
                // console.log(colorMax);

                let colours3 = colourGradient.generateColor('#' + colourRange[3], '#' + colourRange[2], colorMax);
                let colours2 = colourGradient.generateColor('#' + colourRange[2], '#' + colourRange[1], colorMax);
                let colours1 = colourGradient.generateColor('#' + colourRange[1], '#' + colourRange[0], colorMax);


                colours.push(colourRange[0]);
                colours = colours.concat(colours1);
                colours.push(colourRange[1]);
                colours = colours.concat(colours2);
                colours.push(colourRange[2]);
                colours = colours.concat(colours3);
                colours.push(colourRange[3]);

                // console.log(colours);
                ;
                // generateColor('#000000','#ff0ff0',10);

                let domRange = document.getElementById('color-range');
                domRange.innerHTML = '';
                ;
                for (let i = 0; i < colours.length; i++) {
                    let colorDiv = document.createElement('div');
                    colorDiv.classList.add('color-div');
                    colorDiv.style.backgroundColor = '#' + colours[i];
                    colorDiv.innerHTML = i + "° - #" + colours[i];
                    // domRange.appendChild(colorDiv);
                    // $('#result_show').append("<div style='padding:8px;color:#FFF;background-color:#"+tmp[cor]+"'>COLOR "+cor+"° - #"+tmp[cor]+"</div>")
                }


                // console.log('finalGroups.length', finalGroups.length);
                // console.log('colours.length', colours.length);
                ;

                // if( ) {

                // }

                for (let i = 0; i < finalGroups.length; i++) {
                    let colourI = 0

                    //((input - min) * 100) / (max - min)
                    // colourI = ((finalGroups[i].percentage - finalMin) * 100) / (finalMax - finalMin)
                    // console.log('colourI percentage', colourI);
                    // console.log('finalGroups[i].percentage', finalGroups[i].percentage);
                    // console.log('finalMin', finalMin);
                    // console.log('finalMax', finalMax);


                    colourI = Math.round((finalGroups[i].percentage / 100) * colours.length);
                    // console.log('colourI before', colourI);
                    // // max-(min-input);

                    // colourI = colours.length - ( 0 - colourI);

                    // console.log('colourI after', colourI);
                    colourI = Math.round(colourI);
                    let colourILess = colourI - 5;

                    if (colourI < 0) {
                        colourI = 0;
                    }
                    else if (colourI > colours.length - 1) {
                        colourI = colours.length - 1;
                    }
                    if (colourILess < 0) {
                        colourILess = 0;
                    }
                    else if (colourILess > colours.length - 1) {
                        colourILess = colours.length - 1;
                    }

                    finalGroups[i].gradient = { 0: '#000000', 0.5: '#' + colours[colourILess], 1: '#00FF00' };
                    // finalGroups[i].gradient = { 0: '#000000', 0.5: '#' + colours[colourILess], 1: '#' + colours[colourI] };
                    // finalGroups[i].gradient = { 0:'#'+colours[colourILess], 1: '#'+colours[colourI] };

                    if (finalGroups[i].points.length > 0) {
                        ;
                        that.createHeatmap(finalGroups[i].points, finalGroups[i].gradient);
                    }
                }
            }
            that.mergeCanvases();
        });
        // this.createRadiusHeatmap(dataRadius);
        // this.createFullHeatmap(dataFull);
    };

    createFullHeatmap(data) {
        // console.log('createFullHeatmap');
        let that = this;
        // console.log(data);

        // let heatmap = d3.select("canvas#heatmap-full").html("");

        let domCanvas = d3.select("canvas#heatmap-full").attr('width', this.props.width).attr('height', this.props.height);

        let canvas = domCanvas.node();
        let context = canvas.getContext('2d');

        // console.log(domCanvas);

        d3Queue.queue().await(main);
        function main(error) {
            // console.log('createFullHeatmap', 'main');
            let heat = simpleheat(canvas);
            heat.data(data);
            // set point radius and blur radius (25 and 15 by default)
            heat.radius(that.state.radius, that.state.blur);
            // optionally customize gradient colors, e.g. below
            // (would be nicer if d3 color scale worked here)
            // heat.gradient({0: '#0000ff', 0.5: '#00ff00', 1: '#ff0000'});
            // set maximum for domain
            // heat.max(d3.max(dests, d => +d.watches));
            heat.max(that.state.max);
            // draw into canvas, with minimum opacity threshold
            heat.draw(0.05);
        }

    }

    createRadiusHeatmap(data) {
        // console.log('createRadiusHeatmap');
        let that = this;
        // console.log(data);

        // let heatmap = d3.select("canvas#heatmap-full").html("");

        let domCanvas = d3.select("canvas#heatmap-radius").attr('width', this.props.width).attr('height', this.props.height);
        let canvas = domCanvas.node();
        let context = canvas.getContext('2d');

        // console.log(domCanvas);

        d3Queue.queue().await(main);
        function main(error) {
            // console.log('createRadiusHeatmap', 'main');
            let heat = simpleheat(canvas);
            heat.data(data);
            // set point radius and blur radius (25 and 15 by default)
            heat.radius(that.state.radius, that.state.blur);
            // optionally customize gradient colors, e.g. below
            // (would be nicer if d3 color scale worked here)
            // heat.gradient({0: '#0000ff', 0.5: '#00ff00', 1: '#ff0000'});
            // set maximum for domain
            // heat.max(d3.max(dests, d => +d.watches));
            heat.max(that.state.max);
            // draw into canvas, with minimum opacity threshold
            heat.draw(0.05);
        }

    }

    createHeatmap(data, gradient) {
        // console.log('createHeatmap');
        let that = this;
        ;

        // this.clearHeatmap();
        let radius = this.state.radius;
        let blur = this.state.blur;
        let max = this.state.max;


        // console.log(data);

        // let domCanvas = d3.select("canvas#heatmap").attr('width', this.props.width).attr('height', this.props.height);
        var div = d3.select('#heatmap-container');
        var domCanvas = div.append('canvas').attr('id', 'heatmap').attr('width', this.props.width).attr('height', this.props.height);

        let canvas = domCanvas.node();
        let context = canvas.getContext('2d');
        // context.fillStyle = "rgba(255, 255, 255, 0.5)";
        // console.log(domCanvas);


        d3Queue.queue().await(main);
        function main(error) {
            // console.log('createHeatmap', 'main');

            let heat = simpleheat(canvas);
            heat.data(data);
            // set point radius and blur radius (25 and 15 by default)
            heat.radius(radius, blur);
            // optionally customize gradient colors, e.g. below
            // (would be nicer if d3 color scale worked here)

            heat.gradient(gradient);

            // console.log('total', total);
            // console.log('data length', data.length);

            // let dataPercentage = (data.length/total) * 100;
            // console.log('canvas 1 percentage', dataPercentage);


            // if( dataPercentage > 50 ) {
            //     // heat.gradient({0: '#f44242', 1: '#ff0000'});
            // }
            // else if( dataPercentage > 30 ) {
            //     // heat.gradient({0: '#38ff35', 1: '#00ff00'});
            // }
            // else {
            //     // heat.gradient({0: '#345dff', 1: '#0000ff'});
            // }

            // heat.gradient({0: '#0000ff', 0.5: '#00ff00', 1: '#ff0000'});
            // set maximum for domain
            // heat.max(d3.max(dests, d => +d.watches));
            heat.max(max);
            // draw into canvas, with minimum opacity threshold
            heat.draw(0.05);
        }

    };
    clearHeatmap() {
        let heatmap = d3.select("div#heatmap-container").html("");
    }

    updateValue() {

        asdas
        // let radius = document.getElementById('points-radius').value;
        // let blur = document.getElementById('heatmap-blur').value;
        // let radius = document.getElementById('heatmap-radius').value;
        // let heatmapMaximum = document.getElementById('heatmap-max').value;

        // console.log('heatmap radiuus', radius);

        // this.setState({ distance: radius, blur: blur, radius: radius, heatmapMaximum: heatmapMaximum }, this.checkPointDistance);
    }

    setValues() {
        // let radius = document.getElementById('points-radius');
        // let blur = document.getElementById('heatmap-blur');
        // let radius = document.getElementById('heatmap-radius');
        // let heatmapMaximum = document.getElementById('heatmap-max');

        // if (radius) {
        //     radius.value = this.state.distance;
        // }
        // if (blur) {
        //     blur.value = this.state.blur;
        // }
        // if (radius) {
        //     radius.value = this.state.radius;
        // }
        // if (heatmapMaximum) {
        //     heatmapMaximum.value = this.state.heatmapMaximum;
        // }
    }

    render() {

        return (
            <div id="cmp-heatmap" className="component-heatmap">
               
                <div id="heatmap-overlay" className="heatmap-overlay">
                    <div className="">
                        <label>
                            <input type="checkbox" onClick={this.onToggleSliders} /> Toggle sliders
                            <p> Cursor value: {this.state.cursorValue} </p>
                            <p> Raw pos: {this.state.rawPos.posX} {this.state.rawPos.posY} </p>
                            <p> Cursor pos: {this.state.cursorPos.posX} {this.state.cursorPos.posY} </p>
                        </label>
                    </div>
                </div>
                <div id="color-range"> </div>
                <div id="heatmap-container" className="canvas-parent"></div>
            </div>
        )
    }
}