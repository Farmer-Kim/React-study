import React from 'react';
import PropTypes from 'prop-types';
import 'assets/styles/component.css';

class AppPanel extends React.Component {
	static defaultProps = { width: '100%'}
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return ( <div className = "scrm-app-panel"> {this.props.children} </div>); }
}
class HeadPanel extends React.Component {
	static defaultProps = { width: '100%'}
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return ( <div className = "scrm-head-panel"> {this.props.children} </div>); }
}
class MiddlePanel extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return ( <div className = "scrm-middle-panel"> {this.props.children} </div>); }
}
class SidePanel extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return ( <div className = "scrm-side-panel"> {this.props.children} </div>); }
}
class MainPanel extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return ( <div className = "scrm-main-panel" style={{width: this.props.width}}> {this.props.children} </div>); }
}
class ComponentPanel extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { 
		let className = "";
		(this.props.sizeVar) ? className="scrm-component-size-var-panel" : className="scrm-component-panel";		
		return (
			<div className ={className} style={{width: this.props.width, height: this.props.height}}>
				{this.props.children}
			</div>
		); 
	}
}
class FooterPanel extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return ( <div className = "scrm-footer-panel"> {this.props.children} </div>); }
}
class FlexPanel extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return (<div className = "scrm-flex-panel"> {this.props.children} </div>); }
}
class FullPanel extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return (<div className = "scrm-full-panel" style={{width: this.props.width}}> {this.props.children} </div>); }
}
class SubFullPanel extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return (<div className = "scrm-subfull-panel" style={{width: this.props.width, height: this.props.height}}> {this.props.children} </div>); }
}
class LFloatArea extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return (<div className = "scrm-lfloat-div"> {this.props.children} </div>); }
}
class RFloatArea extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return (<div className = "scrm-rfloat-div"> {this.props.children} </div>); }
}
class RelativeGroup extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return (<div className = "scrm-relative-div" style={{width : this.props.width}}> {this.props.children} </div>); }
}
class TrayPanel extends React.Component {
	static defaultProps = { }
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { 
		return (<div className="scrm-tray-panel" id={this.props.id}> {this.props.children} </div>); }
}
class SearchPanel extends React.Component {
	static propTypes = { children: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.array, PropTypes.object]).isRequired };
	render () { return (<div className = "scrm-search-div"> {this.props.children} </div>); }
}
export { AppPanel, HeadPanel, MiddlePanel, SearchPanel, SidePanel, MainPanel, ComponentPanel, FooterPanel, FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup, TrayPanel} ;