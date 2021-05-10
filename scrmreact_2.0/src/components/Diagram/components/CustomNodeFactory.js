import React from 'react';
import { NodeWidgetFactory } from './WidgetFactories';
import { CustomNodeWidget } from './CustomNodeWidget';

export class CustomNodeFactory extends NodeWidgetFactory {
  constructor() {
    super('default');
  }

  generateReactWidget(diagramEngine, node, tts) {
    return (
      <CustomNodeWidget node={node} diagramEngine={diagramEngine} tts={tts}/>
    );
  }
}
