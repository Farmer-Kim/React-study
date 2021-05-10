import React from 'react';
import { DefaultPortLabel } from './defaults/DefaultPortLabelWidget';
import {BasicButton as Button} from 'components';
import { Selectbox, Label, Textfield } from 'components';
import {ComLib} from 'common';

export class CustomNodeWidget extends React.Component { 
  constructor() {
    super();
    this.state ={      
      ttsCont: "",
      kwdSco: undefined
    }
  }
  static defaultProps = {
    node: null,
  };

  onRemove() {
    const { node, diagramEngine } = this.props;
    node.remove();
    diagramEngine.forceUpdate();
  }

  componentDidMount () {
		let { node } = this.props;
    let arr = this.props.tts.filter(ele => ele['CODE'] === node.tts);
    
    if (arr.length > 0) {      
      this.setState({...this.state, ttsCont: arr[0]['CD_VAL'], kwdSco: node.kwdSco});
    } 
	}
  componentDidUpdate (prevProps, prevState) {
    if (this.props.node.kwdSco !== this.state.kwdSco) {
      this.setState({...this.state, kwdSco: this.props.node.kwdSco}, () => {
        this.props.diagramEngine.getDiagramModel() ;
      })
    }
  }

  getInPorts() {
    const { node } = this.props;
    return node.getInPorts().map((port, i) => <DefaultPortLabel model={port} key={`in-port-${i}`} />);
  }

  getOutPorts() {
    const { node } = this.props;
    return node.getOutPorts().map((port, i) => <DefaultPortLabel model={port} key={`out-port-${i}`} />);
  }
  event = {
		selectbox: {
			onChange: (e) => {
        let { node } = this.props;
        node.tts = e.target.value;
        
        let arr = this.props.tts.filter(ele => ele['CODE'] === e.target.value);
        
        this.setState({...this.state, ttsCont: arr[0]['CD_VAL']});
       
      }
    },
    button: {
      onClick: (e) => {
        // 저장이 되있는 경우에만 할수 있도로 validation 추가 필요
        let param = {id:this.props.node.id, name: this.props.node.name, kwdSco: this.props.node.kwdSco};
        let option2 = { width: '600px', height: '830px', modaless: false, callback :  () => {} , param: param}
        ComLib.openPop('BOT010101', '키워드 등록 : ' + this.props.node.name, option2)
      }
    },
    input: {
      onChange: (e) => {
        let { node } = this.props;
        node.kwdSco = e.target.value;
        this.setState({...this.state, kwdSco: e.target.value});
        
      }
    }
  }

  

  render() {
    const { node } = this.props;
    return (
      node.tp === 'start' ?
      <div className='basic-node' style={{ background: node.color }}>
        <div className='title'>
          <div className='name'>
            {node.name}
          </div>          
          <Button
            color='purple' 
            size ='xs'
            fiiled= {true} innerImage={true} icon = {'trash'}
            id = {node.name + "btn_close_" + node.id}
            value = {""}
            disabled = {false}
            hidden = {false}
            onClick = {this.onRemove.bind(this)}
            ml = {5}
          />          
        </div>
        <div className='ports'>
          <Button
            color='purple' 
            fiiled= {true} innerImage={true} icon = {'eye'}
            id = {node.name + "btn_Kwd_" + node.id}
            value = {"키워드 등록"}
            disabled = {false}
            hidden = {false}
            onClick = {this.event.button.onClick}
          />
          <Label value="TTS"/>
          <Selectbox
            id       = {node.name + "sel_TTS_" + node.id}
            value    = {node.tts}
            dataset  = {ComLib.convComboList(this.props.tts)}
            width    = {"100px"}
            disabled = {false}
            onChange = {this.event.selectbox.onChange}            
            tooltip     = {true}
            tooltipCont = {this.state.ttsCont}
          />
          <div className='out'>
            {this.getOutPorts()}
          </div>
        </div>
      </div>
      :
      node.tp === 'select' ?
      <div className='basic-node' style={{ background: node.color }}>
        <div className='title'>
          <div className='name'>
            {node.name}
          </div>
          <Button
            color='purple' 
            size ='xs'
            fiiled= {true} innerImage={true} icon = {'trash'}
            id = {node.name + "btn_close_" + node.id}
            value = {""}
            disabled = {false}
            hidden = {false}
            onClick = {this.onRemove.bind(this)}
            ml = {5}
          />   
        </div>
        <div className='ports'>
          <div className='in'>
            {this.getInPorts()}
          </div>
          <Label value="TTS"/>
          <Selectbox
            id       = {node.name + "sel_TTS_" + node.id}
            value    = {node.tts}
            dataset  = {ComLib.convComboList(this.props.tts)}
            width    = {"100px"}
            disabled = {false}
            onChange = {this.event.selectbox.onChange}            
            tooltip     = {true}
            tooltipCont = {this.state.ttsCont}
          />
          <div className='out'>            
            {this.getOutPorts()}
          </div>
        </div>
      </div>
      :
      <div className='basic-node' style={{ background: node.color }}>
        <div className='title'>
          <div className='name'>
            {node.name}
          </div>
          <Button
            color='purple' 
            size ='xs'
            fiiled= {true} innerImage={true} icon = {'trash'}
            id = {node.name + "btn_close_" + node.id}
            value = {""}
            disabled = {false}
            hidden = {false}
            onClick = {this.onRemove.bind(this)}
            ml = {5}
          />   
        </div>
        <div className='ports'>
          <div className='in'>
            {this.getInPorts()}
          </div>
          <Label value="TTS"/>
          <Selectbox
            id       = {node.name + "sel_TTS_" + node.id}
            value    = {node.tts}
            dataset  = {ComLib.convComboList(this.props.tts)}
            width    = {"100px"}
            disabled = {false}
            onChange = {this.event.selectbox.onChange}            
            tooltip     = {true}
            tooltipCont = {this.state.ttsCont}
          />
          <div className='out'>
            {this.getOutPorts()}
          </div>
        </div>
      </div>
    );
  }
}
