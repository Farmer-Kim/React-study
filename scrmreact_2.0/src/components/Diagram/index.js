import React from 'react';
import * as RJD from './components/main';
import './components/sass.scss';
import {BasicButton as Button, ComponentPanel, FlexPanel} from 'components';
import _ from 'lodash';

class Diagram extends React.Component {
    constructor(props) {
        super(props);
    
        // Setup the diagram engine
        this.engine = new RJD.DiagramEngine();
        this.engine.registerNodeFactory(new RJD.CustomNodeFactory());
        this.engine.registerLinkFactory(new RJD.DefaultLinkFactory());
        this.engine.registerInstanceFactory(new RJD.CustomNodeInstanceFactory());
        this.engine.registerInstanceFactory(new RJD.DefaultPortInstanceFactory());
        this.engine.registerInstanceFactory(new RJD.LinkInstanceFactory());
        // Setup the diagram model
        this.model = new RJD.DiagramModel();
        this.state ={
            engineReady : false
        }
    }
    
    
    componentDidMount() {
        const { engine, model } = this;
                
        // // Create first node and port
        // const node1 = this.createNode({
        //     name: '시작',
        //     color: 'rgb(166 227 247)',
        //     x: 100,
        //     y: 100,
        //     tp: 'start',
        //     tts: '1'
        // });

        // const port1 = this.createPort(node1, {
        //     isInput: false,
        //     id: 'out-1',
        //     name: 'Out'
        // });

        // // Create second node and port
        // const node2 = this.createNode({
        //     name: 'Node 2',
        //     color: 'rgb(192, 255, 0)',
        //     x: 400,
        //     y: 100,
        //     tp: 'yn'
        // });

        // const port2 = this.createPort(node2, {
        //     isInput: true,
        //     id: 'in-1',
        //     name: 'In'
        // });

        // const node3 = this.createNode({
        //     name: 'Node 3',
        //     color: 'rgb(0, 192, 255)',
        //     x: 100,
        //     y: 300,
        //     tp: 'end'
        // });
        // const port3 = this.createPort(node3, {
        //     isInput: true,
        //     id: 'in-1',
        //     name: '성공'
        // });
        // const port4 = this.createPort(node3, {
        //     isInput: false,
        //     id: 'out-1',
        //     name: '인입',
        //     data: 'sss'
        // });
        // const port5 = this.createPort(node3, {
        //     isInput: true,
        //     id: 'in-2',
        //     name: '실패'
        // });

        // // Add the nodes and link to the model
        // model.addNode(node1);
        // model.addNode(node2);
        // model.addNode(node3);        
        
        // model.addLink(this.linkNodes(port1, port2));

        // // // Load the model into the diagram engine
        // engine.setDiagramModel(model);
        this.setState({engineReady : true});
        // setTimeout(() => {
        // this.testSerialization();
        // }, 1000);
    }

    componentDidUpdate (prevProps, prevState) {
        if (this.props.dsSnroList.length !== 0 ) {
            const { engine } = this;

            let newModel = new RJD.DiagramModel();
            
            let newNode = [];
            let propsNode = this.props.dsSnroList.node;

            let newLink = []; 
            let propsLink = this.props.dsSnroList.link;

            for (let i = 0; i < propsNode.length; i ++) {
                newNode.push({color:"", extras: {}, id: "", name: "", ports: "", selected: false, tp: "", tts: undefined, type: "default", x:0, y:0, _class: "CustomNodeModel", rowtype:'r'});
                newNode[i].color  = propsNode[i].ND_COLOR;
                newNode[i].id     = propsNode[i].ND_UUID;
                newNode[i].name   = propsNode[i].ND_NM;
                newNode[i].ports  = JSON.parse(propsNode[i].ND_PORTS);
                newNode[i].tp     = propsNode[i].ND_PROC_ID;
                newNode[i].tts    = propsNode[i].ND_TTS_ID;
                newNode[i].x      = propsNode[i].ND_X;
                newNode[i].y      = propsNode[i].ND_Y;
                newNode[i].kwdSco = propsNode[i].ND_KWD_SCO;
                newNode[i].rowtype= propsNode[i].rowtype;
            }

            for (let i = 0; i < propsLink.length; i ++) {
                newLink.push({extras: {}, id: "", points: "", selected: false, source: "", sourcePort: "", target: "", targetPort: "", type: "default", _class: "LinkModel", rowtype:'r'});
                newLink[i].id         = propsLink[i].LK_UUID;
                newLink[i].points     = JSON.parse(propsLink[i].LK_POINT);
                newLink[i].source     = propsLink[i].LK_ST_ND;
                newLink[i].sourcePort = propsLink[i].LK_ST_ND_PORT;
                newLink[i].target     = propsLink[i].LK_EN_ND;
                newLink[i].targetPort = propsLink[i].LK_EN_ND_PORT;
                newLink[i].rowtype    = propsLink[i].rowtype;
            }
         
           
            _.forEach(newNode, node => {
                const nodeOb = engine.getInstanceFactory(node._class).getInstance();
                nodeOb.deSerialize(node);
          
                // Deserialize ports
                _.forEach(node.ports, port => {
                  const portOb = engine.getInstanceFactory(port._class).getInstance();
                  portOb.deSerialize(port);
                  nodeOb.addPort(portOb);
                });
          
                newModel.addNode(nodeOb);
            });

            _.forEach(newLink, link => {
                const linkOb = engine.getInstanceFactory(link._class).getInstance();
                linkOb.deSerialize(link);
          
                if (link.target) {
                  linkOb.setTargetPort(newModel.getNode(link.target).getPortFromID(link.targetPort));
                }
          
                if (link.source) {
                  linkOb.setSourcePort(newModel.getNode(link.source).getPortFromID(link.sourcePort));
                }
          
                newModel.addLink(linkOb);
            });
 
            engine.setDiagramModel(newModel);      
            this.model = newModel;
            

        }
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
        const { isInput, id, name, data } = options;
        return node.addPort(new RJD.DefaultPortModel(isInput, id, name, data));
    }

    linkNodes(port1, port2) {
        const link = new RJD.LinkModel();
        link.setSourcePort(port1);
        link.setTargetPort(port2);
        return link;
    }

    serializationSave = () => {
        const { engine, model } = this;
        // We need this to help the system know what models to create form the JSON
       
        // Serialize the model
        const str = JSON.stringify(model.serializeDiagram());
        // console.log(str);

        let diagramNode  = JSON.parse(str).nodes;
        let diagramlinks = JSON.parse(str).links;
        let saveNode = [];
        for (let i = 0; i < diagramNode.length; i ++) {
            saveNode.push({EXTRAS    : {}
                         , ND_COLOR  : diagramNode[i].color
                         , ND_UUID   : diagramNode[i].id
                         , ND_KWD_SCO: diagramNode[i].kwdSco
                         , ND_NM     : diagramNode[i].name 
                         , ND_PORTS  : JSON.stringify(diagramNode[i].ports) 
                         , ND_PROC_ID: diagramNode[i].tp 
                         , ND_TP     : diagramNode[i].type 
                         , ND_TTS_ID : diagramNode[i].tts 
                         , ND_X      : diagramNode[i].x   
                         , ND_Y      : diagramNode[i].y  
                         , rowtype   : diagramNode[i].rowtype   })
        }
        let saveLink = [];
        for (let i = 0; i < diagramlinks.length; i ++) {
            saveLink.push({LK_EN_ND     : diagramlinks[i].source
                         , LK_EN_ND_PORT: diagramlinks[i].sourcePort
                         , LK_POINT     : JSON.stringify(diagramlinks[i].points) 
                         , LK_ST_ND     : diagramlinks[i].target 
                         , LK_ST_ND_PORT: diagramlinks[i].targetPort 
                         , LK_TP        : diagramlinks[i].type 
                         , LK_UUID      : diagramlinks[i].id
                         , rowtype      : diagramlinks[i].rowtype  })
        }

        
        model.deSerializeDiagram(JSON.parse(str),engine);             
        engine.setDiagramModel(model);

        this.props.onSave({node: saveNode, link: saveLink});
    }

    onChange(model, action) {
        let propNode = this.props.dsSnroList.node;
        let propLink = this.props.dsSnroList.link;

        switch(action.type) {
            case 'node-moved':
                for (let i = 0; i < propNode.length; i ++) {
                    if (action.model.id === propNode[i].ND_UUID) {
                        if (action.model.x      === propNode[i].ND_X 
                         && action.model.y      === propNode[i].ND_Y
                         && action.model.kwdSco === propNode[i].ND_KWD_SCO
                         && action.model.name   === propNode[i].ND_NM
                         && action.model.tp     === propNode[i].ND_PROC_ID
                         && action.model.tts    === propNode[i].ND_TTS_ID) {
                            action.model.rowtype = "r"

                        } else {
                            action.model.rowtype = "u"
                            
                        }
                        break;
                    }            
                }
                for (let i = 0; i < model.nodes.length; i ++) {
                    if (action.model.id === model.nodes[i].id) {
                        model.nodes[i].x       = action.model.x;
                        model.nodes[i].y       = action.model.y;
                        model.nodes[i].kwdSco  = action.model.kwdSco;
                        model.nodes[i].name    = action.model.name;
                        model.nodes[i].tp      = action.model.tp;
                        model.nodes[i].tts     = action.model.tts;
                        model.nodes[i].rowtype = action.model.rowtype;
                        break;
                    }            
                }
                
                break;
            case 'link-connected':
                for (let i = 0; i < propLink.length; i ++) {
                    if (action.linkModel.id === propLink[i].LK_UUID) {
                        // if (action.model.x      === propLink[i].ND_X 
                        //  && action.model.y      === propLink[i].ND_Y
                        //  && action.model.kwdSco === propLink[i].ND_KWD_SCO
                        //  && action.model.name   === propLink[i].ND_NM
                        //  && action.model.tp     === propLink[i].ND_PROC_ID
                        //  && action.model.tts    === propLink[i].ND_TTS_ID) {
                        //     action.model.rowtype = "r"
                        // } else {
                        //     action.model.rowtype = "u"
                        // }
                        break;
                    }            
                }
                break;
            case 'point-created':
                
                break;


            default: break;
        }    
        this.model.deSerializeDiagram(model,this.engine); 
        this.engine.setDiagramModel(this.model);        
    }

    render() {
        const { engine, model } = this;
        // Render the canvas
        return ( this.state.engineReady ?
                    <FlexPanel>
                        <ComponentPanel>
                            <RJD.DiagramWidget 
                                ref={"test"} 
                                diagramEngine={engine} 
                                width="100%" 
                                height={this.props.height} 
                                tts={this.props.tts} 
                                actions={{deleteItems: false, canvasDrag: true, multiselect: false, multiselectDrag: false}}                                
                                onChange={this.onChange.bind(this)}
                            />
                        </ComponentPanel>
                        <ComponentPanel width={'20%'}>
                            <div class="basic-node" 
                                style={{background: "rgb(166 227 247)"}} 
                                draggable 
                                id = "start"
                                onDragStart={(event) => {
                                    event.dataTransfer.setData("Type", event.target.id);
                                    event.dataTransfer.setData("title", "시나리오 추가");
                                    event.dataTransfer.setData("color", "rgb(166 227 247)");
                                    event.dataTransfer.setData("port", 1);
                                }}
                            >
                                <div class="title">
                                    <div class="name">시나리오 추가</div>
                                </div>                                
                            </div>

                            <div class="basic-node" 
                                style={{background: "rgb(34 185 15)"}} 
                                draggable 
                                id = "yn"
                                onDragStart={(event) => {
                                    event.dataTransfer.setData("Type", event.target.id);
                                    event.dataTransfer.setData("title", "Y/N 프로세스");
                                    event.dataTransfer.setData("color", "rgb(34 185 15)");
                                    event.dataTransfer.setData("port", 3);
                                    

                                }}
                            >
                                <div class="title">
                                    <div class="name">Y/N 프로세스</div>
                                </div>                                
                            </div>

                            <div class="basic-node" 
                                style={{background: "rgb(192, 255, 0)"}} 
                                draggable 
                                id = "select"
                                onDragStart={(event) => {
                                    event.dataTransfer.setData("Type", event.target.id);
                                    event.dataTransfer.setData("title", "선택지 프로세스");
                                    event.dataTransfer.setData("color", "rgb(192, 255, 0)");
                                    event.dataTransfer.setData("port", 4);  
                                }}
                            >
                                <div class="title">
                                    <div class="name">선택지 프로세스</div>
                                </div>                                
                            </div>

                            <div class="basic-node" 
                                style={{background: "rgb(255 153 0)"}} 
                                draggable 
                                id = "end"
                                onDragStart={(event) => {
                                    event.dataTransfer.setData("Type", event.target.id);
                                    event.dataTransfer.setData("title", "시나리오 종료");
                                    event.dataTransfer.setData("color", "rgb(255 153 0)");
                                    event.dataTransfer.setData("port", 0);
                                }}
                            >
                                <div class="title">
                                    <div class="name">시나리오 종료</div>
                                </div>                                
                            </div>
                        </ComponentPanel>
                    </FlexPanel>
                    :
                    <ComponentPanel>Loading... </ComponentPanel>
                );
    }
}

export default Diagram;