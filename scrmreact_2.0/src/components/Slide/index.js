import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Slider from "react-slick";
import axios from 'axios';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import {newScrmObj, ComLib} from 'common';

class SlidePreview extends React.Component {
	static defaultProps = {
		open: false,
		filepath : '',
		onClose : () => {return false;}
	};
	static propTypes = {
		open : PropTypes.bool.isRequired,
		onClose: PropTypes.func.isRequired
	};
	onClick = () => { this.props.onClose();};
	render () {
		return (
		   <div className='scrm-slide-preview modal' style={{display: (this.props.open) ? 'block' : 'none'}}>
				<span className="scrm-slide-preview close" onClick ={this.onClick}>&times;</span>
				<img className="scrm-slide-preview img" src={process.env.API_URL + '/img/' + this.props.name} alt=''/>
				<div id="scrm-slide-preview caption">{}</div>
		   </div> 
		)
	}
}

class SlideContainer extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			ext : {
				doc : ['doc', 'docx', 'hwp', 'txt'],
				xls : ['xls', 'xlsx'],
				ppt : ['ppt', 'pptx'],
				pdf : ['pdf'],
				img : ['gif', 'bmp', 'png', 'jpg', 'jpeg', 'jp2', 'j2c', 'jpx', 'jpf', 'jpc', 'j2k', 'tif']
			}
		}
		this.onDownload = this.onDownload.bind(this);
		this.onPreview = this.onPreview.bind(this);
	}
	onDownload = async() => {
		const reqOptions = {
			method: 'get',
			url: process.env.API_URL + '/scrm/mfu/files/' + this.props.name,
			headers: { 
				"Content-Type": "application/json",
			},
			responseType: 'blob'
		};
		try {
			const resData = await axios(reqOptions);
			const url = window.URL.createObjectURL(new Blob([resData.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', this.props.name); //or any other extension
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (err) {
			ComLib.openDialog('A', 'SYSI0010', ['서버 오류 발생\n로그를 확인하십시오.']);
			return false;
		}
	}
	onPreview = () => {
		if ( document.getElementById(newScrmObj.constants.mdi.DIALOG) === undefined || document.getElementById(newScrmObj.constants.mdi.DIALOG) === null ) {
			let dialog = document.createElement('div');
			dialog.id = newScrmObj.constants.mdi.DIALOG;
			document.body.appendChild(dialog);
		}
		ReactDOM.render(
			<SlidePreview   open={true} url={this.props.url} name={this.props.name} onClose={ () => { ReactDOM.unmountComponentAtNode(document.getElementById(newScrmObj.constants.mdi.DIALOG));} }/>
						,   document.getElementById(newScrmObj.constants.mdi.DIALOG) 
		);
	}
	render () {
		return (
			<React.Fragment>
				<div className ='scrm-slide-container' style={{padding: '1px', width: (this.props.height * 0.9)+ 'px', height: (this.props.height * 0.9)+ 'px'}}>
					<div className ='scrm-slide-main'  onClick = {this.onPreview} style={{height: ((this.props.height * 0.9) - 20)+ 'px'}}>
						<span>{this.props.name}</span>
					</div>
					<div className="scrm-slider-download" onClick = {this.onDownload} style={{height: '20px'}}>
						<img id='imgDownload' src={'/images/download.png'} alt='' width="20px"/>
						<span>DOWNLOAD</span>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

class CustomSlide extends React.Component {
	constructor (props) {
		super(props);
		this.onSelectPrev = this.onSelectPrev.bind(this);
		this.onSelectNext = this.onSelectNext.bind(this);
	}
	static defaultProps = { height: 200 }
	setSlideInfo = (props) => {
		let info = [];
		return info;
	}
	setSlideContent = (item) => {
		return (
			item.map((data, idx) => {
				return <SlideContainer key={'_slidsContainer_' + idx} name={data.FILE_NM} url={ process.env.API_URL + 'img/' + data.FILE_NM } height={this.props.height}/>
			})
		);
	}
	onDownloadAll = () => {
	}
	onSelectPrev = () => { this.slider.slickPrev(); }
	onSelectNext = () => { this.slider.slickNext(); }
	render() {
		const settings = {
				dots: true
			,   slidesToShow: Number(this.props.data.length) <= 5 ? this.props.data.length : 5
			,   slidesToScroll: 1
			,   initialSlide: 0
			,   speed: 500 
			,   responsive: [
					{ breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true, dots: true}}
				,   { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1 }}
				,   { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 }}
			  ]
		};
		return (
			<React.Fragment>
				<div style={{display : 'flex', width: '100%', height: this.props.height + 'px'}}>
					<div className='scrm-slide-prev' style={{width : "10%", textAlign: 'center', top: '50%', left: '50%'}} onClick = {this.onSelectPrev}>
						<h1>&#10094;</h1>
					</div>
					<div style={{width : "80%"}}>
						<Slider ref={c => (this.slider = c)} {...settings}>
							{this.setSlideContent(this.props.data)}
						</Slider>
					</div>
					<div className='scrm-slide-next' style={{width : "10%", textAlign: 'center', top: '50%', left: '50%'}} onClick = {this.onSelectNext}>
						<h1>&#10095;</h1>
					</div>
				</div>
			</React.Fragment>
		);
	}
}
export default CustomSlide;