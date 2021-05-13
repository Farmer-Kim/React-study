import React from 'react';
import { PortWidget } from '../widgets/PortWidget';
import { Label } from 'components';

export class DefaultPortLabel extends React.Component {
  static defaultProps = {
    in: true,
    label: 'port'
  };

  render() {
    const { model } = this.props;
    const port = (
      <PortWidget name={model.name} node={model.getParent()} port={model} diagramEngine={this.props.diagramEngine}/>
    );
    const label = (
      <Label value={model.label}/>
    );
    
    return (
      
      <div className={`${(model.in ? 'in' : 'out')}-port`}>
        {model.in ? port : label}
        {model.in ? label : port}
      </div>
    );
  }
}
