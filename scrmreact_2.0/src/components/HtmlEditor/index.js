import React from 'react';
import Style from 'style-it';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 

class HtmlEditor extends React.Component {
	constructor (props) {
		super(props);
		this.state = { }
		this.onChange  = this.onChange.bind(this);
	}
	static defaultProps = {
		toolbarHidden : false,
		readOnly : false,
		onChange : () => {return;}
	}
	modules = {
		toolbar : (!this.props.toolbarHidden) ? [
			["bold", "italic", "underline", "strike", "blockquote"],
			[{ size: ["small", false, "large", "huge"] }, { font: [] }, { color: [] }, { background: [] }],
			[{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }, { align: [] }],
			["clean"]
		] : false,
		clipboard: { matchVisual: false }
	};
	formats = [ "header", "bold", "italic", "underline", "strike", "blockquote", "size", "color", "list", "bullet", "indent", "link", "image", "video", "align", "background", "code"];

	onChange = (e) => { this.props.onChange({ id: this.props.id, value : e}); }
	render (){
		return (
			<React.Fragment>
				<Style>
					{`
						.scrm-editor-contnents { width: 100%; box-sizing: border-box; }
						.scrm-editor-contnents .ql-editor{ width:  100%; height: ${this.props.height}px; overflow-y: auto; overflow-x: auto; }
					`}
				</Style>
				<ReactQuill theme = 'snow'
							id = {this.props.id}
							value = {this.props.value}
							onChange = {this.onChange}
							modules={this.modules}
							formats={this.formats}
							placeholder={'내용을 입력하세요.'}
							readOnly={this.props.readOnly}
							className = 'scrm-editor-contnents'
				/>
			</React.Fragment>
		);
	}
}
export default HtmlEditor;