import React from 'react';
import _ from 'lodash';

export class PortWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false
    };
  }

  onClick =() => {    
    _.map(this.props.port.links, link => {
      link.remove();
      this.props.diagramEngine.forceUpdate();
    })
  }

  render() {
    const { name, node } = this.props;
    let cnt = 0;
    _.map(this.props.port.links, link => {
      cnt ++;
    })

    return (
      <div
        className={`port${(this.state.selected ? ' selected' : '')}`}
        onMouseEnter={() => this.setState({ selected: true })}
        onMouseLeave={() => this.setState({ selected: false })}
        data-name={name}
        data-nodeid={node.getID()}
        onClick={this.onClick.bind(this)}
      >{cnt > 0 ? "X" : null}</div>
    );
  }
}
