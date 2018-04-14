import React, { Component, Button, Image } from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import license from './download.jpg';
import './App.css';
require('./wheelzoom.js');

var rotation = 90;

class ZoomPanel extends Component {
  constructor(props) {
    super();

    this.getStyles = this.getStyles.bind(this);
    this.getWidth = this.getWidth.bind(this);
    this.onWheel = this.onWheel.bind(this);
    
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.previousDragEvent = null;

    this.state = {
      loaded: false,
      image: props.image,
      element: null,
      rotation: 0,
      size: { x: null, y: null },
      originalZoom: null,
      zoom: 0,
      translate: {x: 0, y: 0}
    };
  }

  getWidth() {
      return this.state.size.x;
  }

  getStyles() {
    return {
      transform: "translate(" + this.state.translate.x + "px," + this.state.translate.y + "px)"
    };
  }

  onWheel(e){
    e.preventDefault();
    const zoom = Math.max(this.state.minimumZoom, this.state.zoom * (1 - e.deltaY / 1000));

    const newSize = {
      x: this.state.element.firstChild.naturalWidth * zoom,
      y: this.state.element.firstChild.naturalHeight * zoom
    };
    
    const changeInSizeX = newSize.x - this.state.size.x;
    const changeInSizeY = newSize.y - this.state.size.y;

    const changeInTranslateX = -(e.offsetX / this.state.element.firstChild.clientWidth) * changeInSizeX;
    const changeInTranslateY = -(e.offsetY / this.state.element.firstChild.clientHeight) * changeInSizeY;

    this.setState({
      zoom: zoom,
      translate: {
        x: Math.min(0, Math.max(-newSize.x + this.state.element.offsetWidth, this.state.translate.x + changeInTranslateX)),
        y: Math.min(0, Math.max(-newSize.y + this.state.element.offsetHeight, this.state.translate.y + changeInTranslateY))
      },
      size: newSize
    });
  }

  onMouseDown(e) {
    e.preventDefault();
    this.previousDragEvent = e;

    document.addEventListener("mousemove", this.onDrag);
    document.addEventListener("mouseup", this.onDragEnd)
  }

  onDrag(e) {
    e.preventDefault();
    const changeInTranslateX = e.pageX - this.previousDragEvent.pageX;
    const changeInTranslateY = e.pageY - this.previousDragEvent.pageY;

    this.previousDragEvent = e;

    this.setState({
      translate: {
        x: Math.min(0, Math.max(-this.state.size.x * this.state.zoom + this.state.element.offsetWidth, this.state.translate.x + changeInTranslateX)),
        y: Math.min(0, Math.max(-this.state.size.y * this.state.zoom + this.state.element.offsetHeight, this.state.translate.y + changeInTranslateY))
      }
    });
  }

  onDragEnd(e) {
    document.removeEventListener('mouseup', this.onDragEnd);
    document.removeEventListener('mousemove', this.onDrag);
  }

  componentDidMount() {
    const element = ReactDOM.findDOMNode(this);
    element.addEventListener("wheel", this.onWheel);
    element.addEventListener("mousedown", this.onMouseDown)
    element.firstChild.onload = () =>
    {
        const widthPercentage = element.clientWidth / element.firstChild.naturalWidth;
        const heightPercentage = element.clientHeight / element.firstChild.naturalHeight;
        const minimumZoom = Math.min(widthPercentage, heightPercentage);
        const zoomLevel = Math.max(this.state.zoom, minimumZoom);

        console.log(zoomLevel);
        this.setState({
          loaded: true,
          element: element,
          size: {
            x: element.firstChild.naturalWidth * zoomLevel,
            y: element.firstChild.naturalHeight * zoomLevel
          },
          minimumZoom: minimumZoom,
          zoom: zoomLevel
        });
    };
  }

  createCanvas() {
    var canvas = document.createElement("canvas");
    var container = document.getElementById("canvasContainer");
    container.appendChild(canvas);

    return canvas;
  }
  rotate(angle) {
    console.log(this.state);

    const canvas = this.createCanvas();
    canvas.width = this.state.element.firstChild.naturalHeight;
    canvas.height = this.state.element.firstChild.naturalWidth;


    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle*Math.PI/180);
    ctx.drawImage(this.state.element.firstChild, canvas.height / -2, canvas.width / -2);
    ctx.restore();
    
    this.setState({
      image: canvas.toDataURL()
    });
  }

  render() {
    console.log("rendering");
    console.log(this.getWidth());
    return (
      <div className="zoom-panel">
        <img src={this.state.image} width={this.getWidth()} style={this.getStyles()} />
        <div className="zoom-panel-controls">
          <img src={(require("./Rotate Left.png"))} onClick={() => this.rotate(-90)} />
          <img src={(require("./Rotate Right.png"))} onClick={() => this.rotate(90)}/>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="aspect-ratio-wrapper drivers-license">
          <ZoomPanel image={license} />
        </div>
        <div id="canvasContainer"></div>
      </div>
    );
  }
}

export default App;
