import React from 'react';
import _ from 'lodash';
import { DiagramModel } from '../DiagramModel';
import { PointModel, NodeModel, LinkModel, PortModel } from '../Common';
import { SelectingAction, MoveCanvasAction, MoveItemsAction } from './actions';
import { LinkLayerWidget } from './LinkLayerWidget';
import { NodeLayerWidget } from './NodeLayerWidget';
import { Toolkit } from '../Toolkit';
import * as RJD from '../main';

const DEFAULT_ACTIONS = {
  deleteItems: true,
  selectItems: true,
  moveItems: true,
  multiselect: true,
  multiselectDrag: true,
  canvasDrag: true,
  zoom: true,
  copy: true,
  paste: true,
  selectAll: true,
  deselectAll: true
};

export class DiagramWidget extends React.Component {
  static defaultProps = {
    onChange: () => {},
    actions: DEFAULT_ACTIONS
  };

  getActions() {
    if (this.props.actions === null) {
      return {};
    }
    return { ...DEFAULT_ACTIONS, ...(this.props.actions || {}) };
  }

  constructor(props) {
    super(props);
    this.state = {
      action: null,
      actionType: 'unknown',
      renderedNodes: false,
      windowListener: null,
      clipboard: null
    };
  }

  componentWillUnmount() {
    this.props.diagramEngine.setCanvas(null);
    window.removeEventListener('keydown', this.state.windowListener);
  }

  componentWillUpdate(nextProps) {
    if (this.props.diagramEngine.diagramModel.id !== nextProps.diagramEngine.diagramModel.id) {
      this.setState({ renderedNodes: false });
      nextProps.diagramEngine.diagramModel.rendered = true;
    }
    if (!nextProps.diagramEngine.diagramModel.rendered) {
      this.setState({ renderedNodes: false });
      nextProps.diagramEngine.diagramModel.rendered = true;
    }
  }

  componentDidUpdate() {
    if (!this.state.renderedNodes) {
      this.setState({...this.state,
        renderedNodes: true
      });
    }
  }

  componentDidMount() {
    const { diagramEngine, onChange } = this.props;
    diagramEngine.setCanvas(this.refs['canvas']);
    diagramEngine.setForceUpdate(this.forceUpdate.bind(this));
    const { selectAll, deselectAll, copy, paste, deleteItems } = this.getActions();

    // Add a keyboard listener
    this.setState({
      renderedNodes: true,
      windowListener: window.addEventListener('keydown', event => {
        const selectedItems = diagramEngine.getDiagramModel().getSelectedItems();
        const ctrl = (event.metaKey || event.ctrlKey);

        // Select all
        if (event.keyCode === 65 && ctrl && selectAll) {
          this.selectAll(true);
          event.preventDefault();
          event.stopPropagation();
        }

        // Deselect all
        if (event.keyCode === 68 && ctrl && deselectAll) {
          this.selectAll(false);
          event.preventDefault();
          event.stopPropagation();
        }

        // Copy selected
        if (event.keyCode === 67 && ctrl && selectedItems.length && copy) {
          this.copySelectedItems(selectedItems);
        }

        // Paste from clipboard
        if (event.keyCode === 86 && ctrl && this.state.clipboard && paste) {
          this.pasteSelectedItems(selectedItems);
        }

        if ([8, 46].indexOf(event.keyCode) !== -1 && selectedItems.length ) {
          selectedItems.forEach(element => {         
            // 포인트 모델인 경우만 삭제 되도록 변경
            // 노드는 버튼으로 링크는 포트의 X 로 삭제 하도록 변경
            if (element instanceof PointModel) {
              if (!(element.link.getLastPoint().id === element.id) && !(element.link.getFirstPoint().id === element.id)) {
                element.remove();
              }
            }
          });
          onChange(diagramEngine.getDiagramModel().serializeDiagram(), { type: 'items-deleted', items: selectedItems });
          this.forceUpdate();
        }
      })
    });
    window.focus();
  }

  copySelectedItems(selectedItems) {
    const { diagramEngine, onChange } = this.props;

    // Cannot copy anything without a node, so ensure some are selected
    const nodes = _.filter(selectedItems, item => item instanceof NodeModel);

    // If there are no nodes, do nothing
    if (!nodes.length) {
      return;
    }

    // Deserialize the existing diagramModel
    const flatModel = diagramEngine.diagramModel.serializeDiagram();

    // Create a new diagramModel to hold clipboard data
    const newModel = new DiagramModel();

    // Create map of GUIDs for replacement
    const gMap = {};

    // Track what was copied to send back to onChange
    const copied = [];

    // Iterate the nodes
    _.forEach(flatModel.nodes, node => {
      if (node.selected) {
        // Get the node instance, updated the GUID and deserialize
        const nodeOb = diagramEngine.getInstanceFactory("CustomNodeModel").getInstance();
        node.id = gMap[node.id] = Toolkit.UID();
        nodeOb.deSerialize(node);

        // Deserialize ports
        _.forEach(node.ports, port => {
          const portOb = diagramEngine.getInstanceFactory("DefaultPortModel").getInstance();
          port.id = gMap[port.id] = Toolkit.UID();
          port.links = [];
          portOb.deSerialize(port);
          nodeOb.addPort(portOb);
        });

        nodeOb.setSelected(true);
        newModel.addNode(nodeOb);
        copied.push(nodeOb);
      }
    });

    // Iterate the links
    _.forEach(flatModel.links, link => {
      if (link.selected) {
        const linkOb = diagramEngine.getInstanceFactory("LinkModel").getInstance();
        link.id = gMap[link.id] = Toolkit.UID();

        // Change point GUIDs and set selected
        link.points.forEach(point => {
          point.id = Toolkit.UID();
          point.selected = true;
        });

        // Deserialize the link
        linkOb.deSerialize(link);

        // Only add the target if the node was copied and the target exists
        if (gMap[link.target] && gMap[link.source]) {
          linkOb.setTargetPort(newModel.getNode(gMap[link.target]).getPortFromID(gMap[link.targetPort]));
        }

        // Add the source if it exists
        if (gMap[link.source]) {
          linkOb.setSourcePort(newModel.getNode(gMap[link.source]).getPortFromID(gMap[link.sourcePort]));
          newModel.addLink(linkOb);
          copied.push(linkOb);
        }
      }
    });

    this.setState({ clipboard: newModel });
    onChange(diagramEngine.getDiagramModel().serializeDiagram(), { type: 'items-copied', items: copied });
  }

  pasteSelectedItems() {
    const { diagramEngine, onChange } = this.props;
    const { clipboard } = this.state;
    const pasted = [];

    // Clear existing selections
    diagramEngine.diagramModel.clearSelection();
    this.forceUpdate();

    // Add the nodes to the existing diagramModel
    _.forEach(clipboard.nodes, node => {
      diagramEngine.diagramModel.addNode(node);
      pasted.push(node);
    });
    this.forceUpdate();

    // Add links to the existing diagramModel
    _.forEach(clipboard.links, link => {
      diagramEngine.diagramModel.addLink(link);
      pasted.push(link);
    });
    this.setState({ clipboard: null });

    onChange(diagramEngine.getDiagramModel().serializeDiagram(), { type: 'items-pasted', items: pasted });
  }

  selectAll(select) {
    const { diagramEngine, onChange } = this.props;
    const { nodes, links } = diagramEngine.diagramModel;
    const selected = [];

    // Select all nodes
    _.forEach(nodes, node => {
      node.setSelected(select);
      selected.push(node);
    });

    // Select all links
    _.forEach(links, link => {
      link.setSelected(select);
      // Select all points
      link.points.forEach(point => point.setSelected(select));
      selected.push(link);
    });

    // Repaint
    this.forceUpdate();

    const type = select ? 'items-select-all' : 'items-deselect-all';
    onChange(diagramEngine.getDiagramModel().serializeDiagram(), { type, items: selected });
  }

  /**
   * Gets a model and element under the mouse cursor
   */
  getMouseElement(event) {
    const { diagramModel } = this.props.diagramEngine;
    const { target } = event;

    // Look for a port
    let element = target.closest('.port[data-name]');
    if (element) {
      const nodeElement = target.closest('.node[data-nodeid]');
      return {
        model: diagramModel.getNode(nodeElement.getAttribute('data-nodeid')).getPort(element.getAttribute('data-name')),
        element
      };
    }

    
    // Look for a point
    element = target.closest('.point[data-id]');
    if (element) {
      return {
        model: diagramModel.getLink(element.getAttribute('data-linkid')).getPointModel(element.getAttribute('data-id')),
        element
      };
    }

    // Look for a link
    element = target.closest('[data-linkid]');
    if (element) {
      return {
        model: diagramModel.getLink(element.getAttribute('data-linkid')),
        element
      };
    }

    // Look for a node
    element = target.closest('.node[data-nodeid]');
    if (element) {
      return {
        model: diagramModel.getNode(element.getAttribute('data-nodeid')),
        element
      };
    }

    return null;
  }

  onWheel(event) {
    const { diagramEngine } = this.props;
    const actions = this.getActions();
    if (!actions.zoom) {
      return;
    }
    const diagramModel = diagramEngine.getDiagramModel();
    event.preventDefault();
    event.stopPropagation();
    diagramModel.setZoomLevel(diagramModel.getZoomLevel() + (event.deltaY / 60));
    diagramEngine.enableRepaintEntities([]);
    this.forceUpdate();
  }

  onMouseMove(event) {
    const { diagramEngine } = this.props;
    const { action, actionType: currentActionType } = this.state;
    const diagramModel = diagramEngine.getDiagramModel();
    const { left, top } = this.refs.canvas.getBoundingClientRect();
    const { multiselectDrag, canvasDrag, moveItems } = this.getActions();

    // Select items so draw a bounding box
    if (action instanceof SelectingAction && multiselectDrag) {      
      const relative = diagramEngine.getRelativePoint(event.pageX, event.pageY);

      _.forEach(diagramModel.getNodes(), node => {
        if (action.containsElement(node.x, node.y, diagramModel)) {
          node.setSelected(true);
        }
      });

      _.forEach(diagramModel.getLinks(), link => {
        let allSelected = true;
        link.points.forEach(point => {
          if (action.containsElement(point.x, point.y, diagramModel)) {
            point.setSelected(true);
          } else {
            allSelected = false;
          }
        });

        if (allSelected) {
          link.setSelected(true);
        }
      });

      action.mouseX2 = relative.x;
      action.mouseY2 = relative.y;
      this.setState({ action, actionType: 'items-drag-selected' });
    } else if (action instanceof MoveItemsAction && moveItems) {
      // Translate the items on the canvas
      action.selectionModels.forEach(model => {
          if (model.model instanceof NodeModel || model.model instanceof PointModel) {

          model.model.x = model.initialX + (
            (event.pageX - this.state.action.mouseX) / (diagramModel.getZoomLevel() / 100)
          );
          model.model.y = model.initialY + (
            (event.pageY - this.state.action.mouseY) / (diagramModel.getZoomLevel() / 100)
          );
        }
      });

      // Determine actionType, do not override some mouse down
      const disallowed = ['link-created'];
      let actionType = disallowed.indexOf(currentActionType) === -1 ? 'items-moved' : currentActionType;
      if (action.selectionModels.length === 1 && action.selectionModels[0].model instanceof NodeModel) {
        actionType = 'node-moved';
      }
      this.setState({ actionType });
      
    } else if (this.state.action instanceof MoveCanvasAction && canvasDrag) {
      // Translate the actual canvas
      diagramModel.setOffset(
        action.initialOffsetX + (
          (event.pageX - left - this.state.action.mouseX) / (diagramModel.getZoomLevel() / 100)
        ),
        action.initialOffsetY + (
          (event.pageY - top - this.state.action.mouseY) / (diagramModel.getZoomLevel() / 100)
        )
      );
      this.setState({ action, actionType: 'canvas-drag' });
    }
  }

  onMouseDown(event) {
    const { diagramEngine } = this.props;
    const diagramModel = diagramEngine.getDiagramModel();
    const model = this.getMouseElement(event);
    const { selectItems, multiselect, multiselectDrag } = this.getActions();
    
    diagramEngine.clearRepaintEntities();
    // Check if this is the canvas
    if (model === null) {
      // Check for a multiple selection
      if (event.shiftKey && multiselectDrag) {
        const relative = diagramEngine.getRelativePoint(event.pageX, event.pageY);
        this.setState({
          action: new SelectingAction(
            relative.x, relative.y
          ),
          actionType: 'canvas-shift-select'
        });
      } else {
        // This is a drag canvas event
        const relative = diagramEngine.getRelativePoint(event.pageX, event.pageY);
        diagramModel.clearSelection();

        this.setState({
          action: new MoveCanvasAction(relative.x, relative.y, diagramModel),
          actionType: 'canvas-click'
        });
        
      }
      
    } else if (model.model instanceof PortModel) {
      const { linkInstanceFactory } = diagramEngine;

      // This is a port element, we want to drag a link
      const relative = diagramEngine.getRelativeMousePoint(event);
      const link = linkInstanceFactory && linkInstanceFactory.getInstance() || new LinkModel();
   
      link.setSourcePort(model.model);

      link.getFirstPoint().updateLocation(relative);
      link.getLastPoint().updateLocation(relative);

      diagramModel.clearSelection();
      link.getLastPoint().setSelected(true);

      diagramModel.addLink(link);
      
      this.setState({
        action: new MoveItemsAction(event.pageX, event.pageY, diagramEngine),
        actionType: 'link-created'
      });
          
    } else if (selectItems && model.model !== null) {
      // It's a direct click selection
      let deselect = false;
      const isSelected = model.model.isSelected();

      // Clear selections if this wasn't a shift key or a click on a selected element
      if (!event.shiftKey && !isSelected || !multiselect && !isSelected) {
        diagramModel.clearSelection(false, true);
      }

      // Is this a deselect or select?
      if (event.shiftKey && model.model.isSelected()) {
        model.model.setSelected(false);
        deselect = true;
      } else {
        model.model.setSelected(true);
        diagramModel.nodeSelected(model);
      }

      // Get the selected items and filter out point model
      const selected = diagramEngine.getDiagramModel().getSelectedItems();
      const filtered = _.filter(selected, item => !(item instanceof PointModel));
      const isLink = model.model instanceof LinkModel; 
      const isNode = model.model instanceof NodeModel;
      const isPoint = model.model instanceof PointModel;

      // Determine action type
      let actionType = 'items-selected';
      if (deselect && isLink) {
        actionType = 'link-deselected';
      } else if (deselect && isNode) {
        actionType = 'node-deselected';
      } else if (deselect && isPoint) {
        actionType = 'point-deselected';
      } else if ((selected.length === 1 || selected.length === 2 && filtered.length === 1) && isLink) {
        actionType = 'link-selected';
      } else if (selected.length === 1 && isNode) {
        actionType = 'node-selected';
      } else if (selected.length === 1 && isPoint) {
        actionType = 'point-selected';
        return
      }

      this.setState({
        action: new MoveItemsAction(event.pageX, event.pageY, diagramEngine),
        actionType
      });
    }
  }

  onMouseUp(event) {    
    const { diagramEngine, onChange } = this.props;
    const { action, actionType } = this.state;
    const element = this.getMouseElement(event);
    const actionOutput = {
      type: actionType
    };

    // console.log("onMouseUp")
    // console.log(action)
    // console.log(actionType)
    // console.log(element)
    if (element === null) {
      // No element, this is a canvas event
      // actionOutput.type = 'canvas-event';
      actionOutput.event = event;
    } else if (action instanceof MoveItemsAction) {
      // Add the node model to the output
      actionOutput.model = element.model;

      // Check if we going to connect a link to something
      action.selectionModels.forEach(model => {
        // Only care about points connecting to things or being created
        if (model.model instanceof PointModel) {
          // Check if a point was created
          let link = model.model.getLink();

          let pointDelete = false;
          if (element.element.tagName === 'circle' && actionOutput.type !== 'link-created') {           
            pointDelete = true
            
          } 

          // 타겟 포트가 없는 링크 생성시 삭제
          if (element.element.tagName === 'circle' && actionOutput.type === 'link-created') {     
            if (link.targetPort === null) {
              model.model.getLink().remove();
            }            
          }
       
          if (element.model instanceof PortModel && !pointDelete) {
            let links = diagramEngine.diagramModel.links;
            let ignoreLink = false;
            
            // 동일 노드 내에서 링크 생성 확인
            if (link.sourcePort.parentNode.id === element.model.parentNode.id) {
              ignoreLink = true; 
            }

            // Connect the link
            model.model.getLink().setTargetPort(element.model);

            if (!ignoreLink) {
              // 동일한 링크가 생기는것 막기    
              _.forEach(links, links => {              
                if (((links.sourcePort.id === link.sourcePort.id && links.targetPort.id === link.targetPort.id)
                || (links.targetPort.id === link.sourcePort.id && links.sourcePort.id === link.targetPort.id))
                &&  links.id !== link.id){
                  ignoreLink = true;  
                  return false;
                }
              });
              
              let oPid = "";
              if (!element.model.in) {
                oPid = element.model.id;
              } else {
                oPid = link.sourcePort.id;

              }
              
              // out 포트 1개만 생기게 막기
              if (!ignoreLink) {
                let eleLinks = links;

                _.forEach(eleLinks, links => {    
                  if (link.id !== links.id) {
                    let sP = links.sourcePort;
                    let tP = links.targetPort;
                    
                    if (oPid === sP.id) {
                      if (!sP.in) {
                        ignoreLink = true;  
                        
                        return false;
                      }
                    } else if (oPid === tP.id) {
                      if (!tP.in) {
                        ignoreLink = true;  

                        return false;
                      }
                    }
                  }
                });
              }
            }
            

            // in <-> out 만 연결 되도록 수정 + 동일한 링크가 생기는것 막기 + 동일 노드내 링크 막기
            if (ignoreLink || model.model.getLink().sourcePort.in === model.model.getLink().targetPort.in) {
              model.model.getLink().remove();
              this.setState({ action: null, actionType: 'unknown' });

            } else {
              // Link was connected to a port, update the output
              actionOutput.type = 'link-connected';
              delete actionOutput.model;
              actionOutput.linkModel = model.model.getLink();
              actionOutput.portModel = element.model;

              // 링크 생성후 바로 del 키 입력시 포인트가 삭제되는 에러 막기
              model.model.setSelected(false);

            }            
          }
          
          if (element.model instanceof NodeModel) {
             // 포트끼리가 아니라 노드에 연결 시도시 삭제
            if (actionOutput.type === 'link-created') {
              model.model.getLink().remove();
            } 
          }
        }
      });
    }

    const attachItems = ['items-selected', 'items-drag-selected', 'items-moved', 'node-deselected', 'link-deselected'];
    if (attachItems.indexOf(actionType) !== -1) {
      actionOutput.items = _.filter(diagramEngine.getDiagramModel().getSelectedItems(),
        item => !(item instanceof PointModel));
    }
    
    // if (actionType === 'items-moved') {
    //   delete actionOutput.model;
    // }

    diagramEngine.clearRepaintEntities();
    
    if (actionOutput.type !== 'unknown') {
      onChange(diagramEngine.getDiagramModel().serializeDiagram(), actionOutput);
    }
    this.setState({ action: null, actionType: 'unknown' });
  }

  renderLinkLayerWidget() {
    const { diagramEngine } = this.props;
    const diagramModel = diagramEngine.getDiagramModel();

    return (
      <LinkLayerWidget
        diagramEngine={diagramEngine}
        pointAdded={(point, event) => {

          event.stopPropagation();
          diagramModel.clearSelection(point);
          this.setState({
            action: new MoveItemsAction(event.pageX, event.pageY, diagramEngine)
          });
        }}
      />
    );
  }

  renderSelector() {
    const { action } = this.state;
    const offsetWidth = this.refs.canvas && this.refs.canvas.offsetWidth || window.innerWidth;
    const offsetHeight = this.refs.canvas && this.refs.canvas.offsetHeight || window.innerHeight;

    if (!(action instanceof SelectingAction)) {
      return null;
    }

    const style = {
      width: Math.abs(action.mouseX2 - action.mouseX),
      height: Math.abs(action.mouseY2 - action.mouseY),
    };

    if ((action.mouseX2 - action.mouseX) < 0) {
      style.right = offsetWidth - action.mouseX;
    } else {
      style.left = action.mouseX;
    }

    if ((action.mouseY2 - action.mouseY) < 0) {
      style.bottom = offsetHeight - action.mouseY;
    } else {
      style.top = action.mouseY;
    }

    return (
      <div
        className='selector'
        style={style}
      />
    );
  }

  createNode(options) {
    const { name, color, x, y, tp, tts } = options;
    var node = new RJD.CustomNodeModel(name, color, tp, tts);
    node.x = x;
    node.y = y;
    node.tp = tp;
    node.tts = tts
    return node;
  }

  createPort(node, options) {
    const { isInput, name, label, data } = options;

    return node.addPort(new RJD.DefaultPortModel(isInput, name, label, data));
  }

  onDrop(event) {
    event.preventDefault();

    const { diagramEngine, onChange } = this.props;
    const relative = diagramEngine.getRelativePoint(event.pageX, event.pageY);
    const diagramModel = diagramEngine.getDiagramModel();
    
    let nodeTp    = event.dataTransfer.getData('Type');
    let nodeName  = event.dataTransfer.getData('title');
    let nodeColor = event.dataTransfer.getData('color');
    let nodeOutpt = event.dataTransfer.getData('port');
    
    let nodeOption = {
      color: nodeColor,
      kwdSco: 0,
      name: nodeName,
      tp: nodeTp,
      tts: "0",
      x: (relative.x / (diagramModel.getZoomLevel() / 100))  - diagramModel.offsetX,
      y: (relative.y / (diagramModel.getZoomLevel() / 100))  - diagramModel.offsetY
    }

    const nextNode =  this.createNode(nodeOption)
    
    if (nodeTp === "F") {
      this.createPort(nextNode, {
        isInput: false,
        name: "네"
      })
      this.createPort(nextNode, {
        isInput: false,
        name: "아니요"
      })            
    } else if (nodeTp === "B") {
      this.createPort(nextNode, {
        isInput: false,
        name: "인식"
      });
    } else if (nodeTp === "D") {
      this.createPort(nextNode, {
        isInput: false,
        name: "날짜검출"
      });
    } else {
      for (let i = 0; i < nodeOutpt; i ++) {  
        this.createPort(nextNode, {
          isInput: false,
          name: (i + 1) + "번 인식"
        });              
      }
    }

    

    this.createPort(nextNode, {
      isInput: true,
      name: 'In'
    });

    diagramEngine.diagramModel.addNode(nextNode);

    diagramEngine.clearRepaintEntities();
    onChange(diagramEngine.getDiagramModel().serializeDiagram(), { type: 'items-added', items: nextNode });
    this.setState({ action: null, actionType: 'unknown' });

  }
  render() {
    const { diagramEngine } = this.props;
    return (
      <div       
        onDrop={this.onDrop.bind(this)}
        onDragOver={(event) => { event.preventDefault();}}
      >
        <div
          ref='canvas'
          className='react-js-diagrams-canvas'
          onWheel={this.onWheel.bind(this)}
          onMouseMove={this.onMouseMove.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
          style={{width:this.props.width, height:this.props.height}}
        >
          {
            !this.state.renderedNodes ?
            null
            :
            this.renderLinkLayerWidget()
          }
          <NodeLayerWidget diagramEngine={diagramEngine} tts={this.props.tts}/>        
          {this.renderSelector()}
        </div>
      </div>      
    );
  }
}
