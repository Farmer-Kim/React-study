import _ from 'lodash';
import { NodeModel } from './Common';
import { AbstractInstanceFactory } from './AbstractInstanceFactory';

export class CustomNodeInstanceFactory extends AbstractInstanceFactory {
  constructor() {
    super('CustomNodeModel');
  }

  getInstance() {
    return new CustomNodeModel();
  }
}

export class CustomNodeModel extends NodeModel {
  constructor(name = 'Untitled', color = 'rgb(0,192,255)') {
    super('default');
    this.name = name;
    this.color = color;
    this.tp = "";
    this.tts = "";
    this.kwdSco = null;
    this.rowtype = "c"
  }

  deSerialize(object) {
    super.deSerialize(object);
    this.name  = object.name;
    this.color = object.color;
    this.tp    = object.tp;
    this.tts   = object.tts;
    this.kwdSco= object.kwdSco;
    this.rowtype= object.rowtype;
  }

  serialize() {
    return _.merge(super.serialize(), {
      name  : this.name,
      color : this.color,
      tp    : this.tp,
      tts   : this.tts,
      kwdSco: this.kwdSco,
      rowtype: this.rowtype
    });
  }

  getInPorts() {
    return _.filter(this.ports,(portModel) => portModel.in);
  }

  getOutPorts() {
    return _.filter(this.ports,(portModel) => !portModel.in);
  }
}
