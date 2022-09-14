import React from 'react';
import PropTypes from 'prop-types';


class Tabs extends React.Component {
	static propTypes = {
		onClick : PropTypes.func.isRequired,
	}
	constructor(props) {
		super(props);
		this.state = { 
			active: (React.Children.toArray(this.props.children).length === 0) 
					? 0 
					: React.Children.toArray(this.props.children).filter(child => child.props.display !== 'none')[0].props.index };
	}
	static defaultProps = {
		onClick : (e) => {return false;}
	}
	onClickTab = (index) => {
		this.setState({ active: index });
		this.props.onClick(index);
	}
	render () {
		return (
			<React.Fragment>
				<div style={{marginBottom: '50px'}}>
					<ul className ='scrm-tabs-ul'>
						{
							React.Children.toArray(this.props.children).filter(child => child.props.display !== 'none').map((tab) => {
									return (
										<Tab id={this.props.id} tabWidth= {this.props.tabWidth} active ={this.state.active} key ={tab.props.index} index= {tab.props.index} label = {tab.props.label} onClick = {this.onClickTab}/>
									)
							})

						}
					</ul>
				</div>
				
					{   
						React.Children.toArray(this.props.children).filter(child => child.props.display !== 'none').map((child, index) => {
							let display = "block";
							if (child.props.index !== this.state.active) {
								display = "none";
							}
							return <div key={index} className='scrm-tab-container' style={{height: this.props.height, display: display}}>{child.props.children}</div>;
						})
					}
				
			</React.Fragment>
		);
	}
} 
class Tab extends React.Component {
	static propTypes = {
		active: PropTypes.number.isRequired,
		label: PropTypes.string.isRequired,
		onClick: PropTypes.func.isRequired,
		tabWidth: PropTypes.string.isRequired
	};
	onClick = () => {
		this.props.onClick(this.props.index);
	}
	render () {
		let className = 'scrm-tabs-ul-li';
		if (this.props.active === this.props.index) {
			className += ' scrm-tabs-ul-li-active'
		}
		return (
			<li className ={className} style={{width: this.props.tabWidth}} onClick ={this.onClick}> {this.props.label} </li>
		);
	}
}
class TabPanel extends React.Component {
	static defaultProps = {
		index : 0,
		label : 'TAB'
	}; 
	render () {
		return ( <div id={this.props.id} className='scrm-tab-panel'> {this.props.children} </div> )
	}
}
export { Tabs, Tab, TabPanel };