import React from 'react';
import { PortWidget } from '../widgets/PortWidget';
import { Label } from 'components';
import {BasicButton as Button} from 'components';
import {ComLib} from 'common';

export class DefaultPortLabel extends React.Component {
  static defaultProps = {
    in: true,
    label: 'port'
  };

  event = {
    button: {
      onClick: (e) => {
        const { model } = this.props;
        // console.log(model.getParent().id)
        // console.log(model)
        // console.log(model.getParent().getOutPorts())
        // 저장이 되있는 경우에만 할수 있도로 validation 추가 필요
        let param = {id:model.getParent().id, name: model.getParent().name, kwdSco: model.getParent().kwdSco, port: model.id};
        let option2 = { width: '600px', height: '830px', modaless: false, callback :  () => {} , param: param}
        ComLib.openPop('BOT010101', '키워드 등록 : ' + model.getParent().name + " " + model.label, option2)
      }
    },
  }

  render() {
    const { model, portOrd } = this.props;
    const port = (
      <PortWidget name={model.name} node={model.getParent()} port={model} diagramEngine={this.props.diagramEngine}/>
    );

    const label = (
      (model.getParent().tp === 'S') && (!model.in)
        ?
          <Button
              color='purple' 
              fiiled= {true} innerImage={true} icon = {'eye'}
              id = {model.getParent().id}
              value = {"키워드"}
              disabled = {false}
              hidden = {false}
              onClick = {this.event.button.onClick}
              ml={5}
          />
        :
          model.getParent().tp === 'B'
            ?
              null
            :
              <Label value={model.label}/>
    );
    
    return (
      
      <div className={`${(model.in ? 'in' : 'out')}-port`}>
        {model.in ? port : label}
        {model.in ? null : port}
      </div>
    );
  }
}
