import React from 'react';
import {
	ResponsiveContainer, RadialBar, Legend, Tooltip, 
	LineChart, CartesianGrid, XAxis,YAxis, Line,
	BarChart , Bar,
	Surface,
	Symbols
} from 'recharts';
// https://recharts.org/en-US/guide <== API site
import _ from "lodash";
import { SubFullPanel
	, FlexPanel
	, ComponentPanel
	, RelativeGroup    } from 'components';
import { max } from 'moment';

const CustomTooltip = (e) => {
	let {label, payload, content} = e;
	if (payload && payload.length && label) {
		let dataKeys = content._owner.memoizedProps.options.dataKey;
		return (
			<div style={{backgroundColor: "white", border: "1px solid #1a1a1a"}}>
				<div className="scrm-label-div" >
					<span>{label}</span>
				</div>
				{payload.map((entry, index) => {
					const { dataKey, stroke, unit, payload } = entry;
					const style = {
						marginRight: 10,
						color: stroke
					};
					let dataname = "";						
					for (let i = 0; i < dataKeys.length; i ++){
						if (dataKeys[i].key === dataKey) {
							dataname = dataKeys[i].name
							break;
						}
					}
					return (
						<div>
							<span
								className="legend-item"
								key={index + "_legend-item"}
								style={style}
							>
								<Surface width={10} height={10} >
									<Symbols cx={5} cy={5} type="circle" size={50} fill={stroke} />
								</Surface>
								<span>{dataname} : {payload[dataKey] + unit}</span>
							</span>
						</div>
					);
				})}			
			</div>
		);
	} else {
		return null;
	}
	
	// return null;
  };

class ScrmLineBarChart extends React.Component {
	constructor (props) {
		super(props);
		this.state = { disabled: []};
		this.dataSet = [];
	}

	handleClick = dataKey => {
		// 사용 안하기로 함

		// if (_.includes(this.state.disabled, dataKey)) {
		// 	this.setState({
		// 		disabled: this.state.disabled.filter(obj => obj !== dataKey)
		// 	});
		// } else {
		//   	this.setState({ disabled: this.state.disabled.concat(dataKey) });
		// }
	};
	onMouseEnter = (e) => {
		
	}
	onMouseMove = (e) => {
		
	}
	onMouseLeave = (e) => {
		
	}
	renderCusomizedLegend = ({ payload }) => {
		return (
			<div className="customized-legend" style={{textAlign: 'center'}}>				
				{payload.map((entry, index) => {
					const { key, color, name } = entry;
					const active = _.includes(this.state.disabled, key);
					const style = {
						marginRight: 10,
						color: active ? "#AAA" : color
					};
					return (
						<span
							className="legend-item"
							key={index + "_legend-item"}
							onClick={() => this.handleClick(key)}
							style={style}
						>
							{/* <Surface width={10} height={10} viewBox="0 0 10 10"></Surface> */}
							<Surface width={10} height={10} >
								<Symbols cx={5} cy={5} type="circle" size={50} fill={color} />
									{active && (
										<Symbols
											cx={5}
											cy={5}
											type="circle"
											size={25}
											fill={"#FFF"}
										/>
									)}
							</Surface>
							<span>{name}</span>
						</span>
					);
				})}
			</div>
		);
	};
	shouldComponentUpdate (nextProps) {
		if (nextProps.data === this.dataSet) {

			return false;
		} else {
			return true;
		}
	}
	componentDidUpdate(prevProps) {
		// let dataMax = this.findMaxData();

		// dataSet = this.props.data;
		
	}

	render () {		
		return (				
					<ResponsiveContainer width="100%" aspect={this.props.aspect}>	
						<LineChart data={this.props.data} margin={{right: 20, left: 20 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey={this.props.options.XAsisKey}  />
							<YAxis allowDecimals = {false} domain={[0, this.props.maxData]}/>
							<Tooltip content={<CustomTooltip />} />
								{
									this.props.options.dataKey.filter(item => !_.includes(this.state.disabled, item.key)).map((item, key) => {
										return <Line type="monotone" dataKey={item.key} key={key} stroke={item.color} unit = {this.props.unit}  activeDot={{onClick: (e)=> {console.log(e)} }}/>
									})
								}
							<Legend
								height={24}
								payload={this.props.options.dataKey}
								content={this.renderCusomizedLegend}
							/>
						</LineChart>				
					</ResponsiveContainer>	
		)
	}
}

class ScrmBarChart extends React.Component{
	render(){
		return(
			<div style={{width: "100%", height: "100%"}}>	
				<ResponsiveContainer width="100%" height="80%">			
					<BarChart  data={this.props.data} layout={this.props.layout} >
						<XAxis type="number" domain={[0, 100]}  /> 
						<YAxis dataKey= {this.props.dailyOptions.YAsisKey} hide reversed type="category" />
						<Tooltip/>
						<Legend/>     
							{
									this.props.dailyOptions.dataKey.map((item, key) => {								
									return <Bar dataKey={item.key} key={key} fill={item.color} unit={'%'} barSize={100}/>
								})
							}
					</BarChart>
				</ResponsiveContainer>	
			</div>			
		)
	}
}



export { ScrmLineBarChart, ScrmBarChart};