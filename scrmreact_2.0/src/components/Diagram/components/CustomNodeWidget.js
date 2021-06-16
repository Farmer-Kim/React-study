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
      name: undefined,
      arrTts: []
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
  addPort() {
    const { node, diagramEngine } = this.props;
    let lastLabel   = node.getOutPorts()[node.getOutPorts().length -1].label;
    let indexOfCom  = lastLabel.indexOf('번');
    let newLabel    = (node.getOutPorts().length + 1) + lastLabel.substring(indexOfCom, lastLabel.length);
   
    const portOb = diagramEngine.getInstanceFactory("DefaultPortModel").getInstance();

    portOb.in    = false;
    portOb.label = newLabel;
    portOb.name  = newLabel;

    node.addPort(portOb);
    
    if (node.rowtype === 'r') {
      node.rowtype = 'u';
    } else if (node.rowtype === 'c') {
      
    } else if (node.rowtype === 'u') {

    }
    diagramEngine.forceUpdate();
  }
  delPort() {
    const { node, diagramEngine } = this.props;
    let port = node.getOutPorts()[node.getOutPorts().length -1];
    node.removePort(port)

    if (node.rowtype === 'r') {
      node.rowtype = 'u';
    } else if (node.rowtype === 'c') {
      
    } else if (node.rowtype === 'u') {

    }

    diagramEngine.forceUpdate();

  }
  componentDidMount () {
		let { node } = this.props;
    let arr = this.props.tts.filter(ele => ele['CODE'] === node.tts);
    let arrTts = this.props.tts.filter(ele => (ele['CODE_TP'] === this.props.node.tp) || (ele['CODE_TP'] === 'N'))
    
    if (arr.length > 0) {      
      this.setState({...this.state, ttsCont: arr[0]['CD_VAL'], name: node.name, arrTts: ComLib.convComboList(arrTts)});
    } 
	}
  componentDidUpdate (prevProps, prevState) {
    if (this.props.node.name !== this.state.name) {
      this.setState({...this.state, name: this.props.node.name}, () => {
        this.props.diagramEngine.getDiagramModel() ;
      })
    }
  }

  getInPorts() {
    const { node } = this.props;
    return node.getInPorts().map((port, i) => <DefaultPortLabel model={port} key={`in-port-${i}`} diagramEngine={this.props.diagramEngine}/>);
  }

  getOutPorts() {
    const { node } = this.props;
    return node.getOutPorts().map((port, i) => <DefaultPortLabel  model={port} key={`out-port-${i}`} portOrd={i} diagramEngine={this.props.diagramEngine}/>);
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
        let param = {id:this.props.node.id, port: "IN", snroTp:"B", name: this.props.node.name};
        let option2 = { width: '600px', height: '830px', modaless: false, callback :  () => {} , param: param}
        ComLib.openPop('BOT010101', '키워드 등록 : ' + this.props.node.name, option2)
      }
    },
    input: {
      onChange: (e) => {
        let { node } = this.props;
        
        node.name = e.target.value;

        if (node.rowtype == "r") {  
          node.rowtype = "u";
        }

        this.setState({...this.state, name: e.target.value});
        
      }
    }
  }

  render() {
    const { node } = this.props;
    return (
      node.tp === 'B' ?
      <div className='basic-node' style={{ background: node.color }}>
        <div className='title'>
          <div className='name'>
            <Textfield
              width       = {200}
              id          = {"iptNdNM_" + node.id}
              name        = {"iptNdNM_" + node.id}
              value       = {node.name}
              placeholder = {""}
              minLength   = {0}
              maxLength   = {20}
              readOnly    = {false}
              disabled    = {false}
              onChange    = {this.event.input.onChange}
              onKeyPress  = {this.event.input.onKeyPress}
            />
          </div>          
          <Button
            color='purple' 
            size ='xs'
            fiiled= {true} innerImage={true} icon = {'trash'}
            id = {"btn_close_" + node.id}
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
            id = {"btn_Kwd_" + node.id}
            value = {"키워드 등록"}
            disabled = {false}
            hidden = {false}
            onClick = {this.event.button.onClick}
          />
          <Label value="TTS"/>
          <Selectbox
            id       = {"sel_TTS_" + node.id}
            value    = {node.tts}
            dataset  = {this.state.arrTts}
            width    = {"200px"}
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
      node.tp === 'S' ?
      <div className='basic-node' style={{ background: node.color }}>
        <div className='title'>
          <div className='name'>
            <Textfield
              width       = {200}
              id          = {"iptNdNM_" + node.id}
              name        = {"iptNdNM_" + node.id}
              value       = {node.name}
              placeholder = {""}
              minLength   = {0}
              maxLength   = {20}
              readOnly    = {false}
              disabled    = {false}
              onChange    = {this.event.input.onChange}
              onKeyPress  = {this.event.input.onKeyPress}
            />
          </div>
          <Button
            color='purple' 
            size ='xs'
            fiiled= {true} innerImage={true} icon = {'add'}
            id = {node.name + "btn_add_" + node.id}
            value = {""}
            disabled = {false}
            hidden = {false}
            tooltip={"선택지 추가"}
            onClick = {this.addPort.bind(this)}
            ml = {5}
          /> 
          <Button
            color='purple' 
            size ='xs'
            fiiled= {true} innerImage={true} icon = {'del'}
            id = {node.name + "btn_del_" + node.id}
            value = {""}
            disabled = {false}
            hidden = {false}
            tooltip={"선택지 삭제"}
            onClick = {this.delPort.bind(this)}
            ml = {5}
          /> 
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
            dataset  = {this.state.arrTts}
            width    = {"200px"}
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
            <Textfield
              width       = {200}
              id          = {"iptNdNM_" + node.id}
              name        = {"iptNdNM_" + node.id}
              value       = {node.name}
              placeholder = {""}
              minLength   = {0}
              maxLength   = {20}
              readOnly    = {false}
              disabled    = {false}
              onChange    = {this.event.input.onChange}
              onKeyPress  = {this.event.input.onKeyPress}
            />
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
            dataset  = {this.state.arrTts}
            width    = {"200px"}
            disabled = {false}
            onChange = {this.event.selectbox.onChange}            
            tooltip     = {true}
            tooltipCont = {this.state.ttsCont}
          />
          {node.tp === 'E'
            ?
              null
            :
              <div className='out'>
                {this.getOutPorts()}
              </div>
          }          
        </div>
      </div>
    );
  }
}
