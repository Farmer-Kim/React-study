import { PortModel } from '../Common';
import { AbstractInstanceFactory } from '../AbstractInstanceFactory';

export class DefaultPortInstanceFactory extends AbstractInstanceFactory {
  constructor() {
    super('DefaultPortModel');
  }

  getInstance() {
    return new DefaultPortModel(true, 'unknown');
  }
}

export class DefaultPortModel extends PortModel {
  constructor(isInput, name, label, data = null) {
    super(name);
    this.in = isInput;
    this.label = label || name;
    this.data = data;
  }

  deSerialize(object) {
    super.deSerialize(object);
    this.in = object.in;
    this.label = object.label;
    this.data  = object.data;
  }

  serialize() {
    return {
      ...super.serialize(),
      in: this.in,
      label: this.label,
      data: this.data
    };
  }
}
