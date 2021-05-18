import React from 'react';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';

import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";


import { TransManager, ComLib } from "common";
import {BasicButton as Button } from 'components';

class InputFileUpload extends React.Component {
	constructor (props) {
		super(props);
		this.allFiles = null;
		this.index = 0;
		this.page = 50;
		this.state = {
			id : this.props.id || '',
			files : null,
			uploadPercent: 0,
			uploadStatus: "",
			showProgressbar: false
		}
		this.getUploadParams = this.getUploadParams.bind(this);
		this.onChangeStatus = this.onChangeStatus.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.setProgressPercent = this.setProgressPercent.bind(this);
		this.callback = this.callback.bind(this);
	}
	static defaultProps = {
		height : 200,
		onChangeStatus : () => { return; },
		handleSubmit : () => { return; },
		onUploadComplete  : () => { return; },
		uploadValidation  : () => { return true; }
	}
	getUploadParams = (e) => {
		return { url: 'https://httpbin.org/post' }
	}
	onChangeStatus = ({ meta }, status) => { this.props.onChangeStatus({ id : this.state.id, data : {status : status, mete: meta}}) }
	onUploadComplete = (res, files, savedFileList) => { this.props.onUploadComplete({id : this.props.id, msg : res, files: files, savedFileList}); }
	setProgressPercent = (progressEvent) => {
		this.setState({...this.state, uploadPercent: Math.floor((progressEvent.loaded * 100) / progressEvent.total)});
		if (this.state.uploadPercent === 100) {
			this.setState({ ...this.state, uploadStatus: "success" });
		}
	}
	handleSubmit = (files, allFiles) => {
		console.log("File Upload Handle Submit");
		if (this.validate(files, allFiles)) {
			this.allFiles = allFiles;
			this.setState({...this.state, showProgressbar: false, files: files
			}, () => {
				// let formData = new FormData();
				// Array.from(this.state.files).forEach((f, index) => {
				// 	if (index >= this.index && index < this.index + 10) {
				// 		formData.append("files", f.file)
				// 	}
				// });
				// this.index = this.index + 10;

				// let transManager = new TransManager();
				// transManager.setTransId("_FILEUPLOAD");
				// transManager.setTransUrl(transManager.constants.url.upload);
				// transManager.setCallBack(this.callback);
				// transManager.setTimeout(1000 * 60 * 10);
				// transManager.addConfig({
				// 	crudh: transManager.constants.crudh.upload,
				// 	datasetsend:"fileupload",
				// });
				// formData.append("transdata", JSON.stringify({transdata: transManager.transdata}));
				// transManager.addDataset('fileupload', formData);
				// transManager.agent();
				this.index = 0;
				this.transaction("_FILEUPLOAD");
			});
		}
	}
	transaction = (serviceId) => {
		switch (serviceId) {
		case "_FILEUPLOAD" :
			let formData = new FormData();
			Array.from(this.state.files).forEach((f, index) => {
				if (index >= this.index && index < this.index + this.page) {					
					formData.append("files", f.file)
					
				}
			});
	
			let transManager = new TransManager();
			transManager.setTransId("_FILEUPLOAD");
			transManager.setTransUrl(transManager.constants.url.upload);
			transManager.setCallBack(this.callback);
			transManager.setTimeout(1000 * 60 * 10);
			transManager.addConfig({
				crudh: transManager.constants.crudh.upload,
				datasetsend:"fileupload",
				datasetrecv: "savedFileList",
			});
			formData.append("transdata", JSON.stringify({transdata: transManager.transdata}));
			transManager.addDataset('fileupload', formData);
			transManager.agent();
			break;
		default : break;
		}
	
	}
	callback = (res) => {
		try {
			switch (res.id) {
			case "_FILEUPLOAD":
				console.log(res)
				if (res.result === '0') {
					if ((this.index + this.page) < Array.from(this.state.files).length) {
						this.allFiles.forEach((f, index) => { if (index < this.page) { f.remove() } });
						this.index = this.index + this.page;
						this.transaction(res.id);
					} else {
						this.allFiles.forEach((f) => { f.remove(); });
						this.index = 0;
						this.onUploadComplete(res.result, this.state.files, res.data.savedFileList);
					}
				}
				break;
			default: break;
			}
		} catch (err) {
			console.log(err);
		}
	}
	validate = (files, allFiles) => {
		if (files.length > 50) {
			ComLib.openDialog('A', 'SYSI0010', ['첨부파일의 갯수는 최대 50개로 제한됩니다.']);
			return false;
		}

		let Allsize = 0;
		for (let i = 0; i < files.length; i ++) {
			Allsize += files.size;
		}
		if (Allsize > (1024 * 1024 * 1024)) {
			ComLib.openDialog('A', 'SYSI0010', ['전체 파일 용량이 1GB를 초과 할수 없습니다.']);
			return false;
		}

		if (!this.props.uploadValidation(files)) {
			return false;
		}

		return true;
	}
	valTest = (e) => {
		console.log(e)
		console.log(e.meta.status)
		
		var reader = new FileReader();
		reader.onload = function(event) {
			console.log('File content:', event.target.result);
		};
		reader.readAsText(e.file);
		
		console.log(reader)
		return false;
	}

	  
	render () {
		return  (
			<React.Fragment>
				{ this.state.showProgressbar ? <Progress percent={this.state.uploadPercent} status={this.state.uploadStatus}/> : null }
				<Dropzone
					disabled = {this.props.disabled}
					inputContent="클릭 또는 파일을 드래그 하세요."
					inputWithFilesContent = "파일추가"
					submitButtonContent = "업로드"
					getUploadParams={this.getUploadParams}
					onChangeStatus={this.onChangeStatus}
					LayoutComponent = {Layout}
					onSubmit={this.handleSubmit}
					accept = {".wav, .mp3, .PCM"}
					maxFiles = {50}
					maxSizeBytes = {1024 * 1024 * 100}
					validate={this.valTest}
					styles={{
						dropzone: { height: (this.props.height) ? this.props.height + 'px' : '400px', display: 'block', overflow: 'hidden'} ,
						inputLabel : { fontColor: 'black'}
					}}					
				/>
			</React.Fragment>
		);
	}
}
const Layout = ({ input, previews, submitButton, dropzoneProps, files, extra: { maxFiles } }) => {
	const dzHeight = Number(dropzoneProps.style.height.substring(0, dropzoneProps.style.height.length-2));
	return (
		<React.Fragment>
			<div {...dropzoneProps}>
				<div style={{overflow: 'auto', height : (dzHeight > 100 && files.length > 0) ? (dzHeight - 100) + 'px'  : 'auto'}}>
					{previews}
				</div>
				<div style={{display: (files.length > 0) ? 'flex' : 'block', width: '100%'}}>
					<div>
						{files.length < maxFiles && input}
					</div>
					<div style={{position:'absolute', display:'flex', float:'right', bottom: '0px', width: '100%'}}>
						<div className="dzu-submitButtonContainer" style={{ right: '100px'}}>
							{files.length > 0 && <Button mt={24} mr={10} value='전체삭제' onClick={(e) => {files.forEach(f => f.remove())}}/>}
						</div>
						{files.length > 0 && submitButton}
					</div>
				</div>
			</div>
		</React.Fragment>
	)
}
class MultiFileUpload extends React.Component {
	render () {
		return  (
			<React.Fragment></React.Fragment>
		);
	}
}

class IconFileUpload extends React.Component {
	render () {
		return  (
			<React.Fragment></React.Fragment>
		);
	}
}


export {InputFileUpload, MultiFileUpload, IconFileUpload}