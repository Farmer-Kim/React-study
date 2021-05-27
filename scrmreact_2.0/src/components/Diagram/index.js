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
        
    }
        
    componentDidUpdate (prevProps, prevState) {
        if (this.props.dsSnroNode.length !== 0 ) {
            const { engine } = this;

            let newModel =      new RJD.DiagramModel();
            
            let newNode = [];
            let propsNode = this.props.dsSnroNode;

            let newLink = []; 
            let propsLink = this.props.dsSnroLink;

            for (let i = 0; i < propsNode.length; i ++) {
                newNode.push({color:"", extras: {}, id: "", name: "", ports: "", selected: false, tp: "", tts: undefined, type: "default", x:0, y:0, _class: "CustomNodeModel", rowtype:'r'});
                newNode[i].color  = propsNode[i].ND_COLOR;
                newNode[i].id     = propsNode[i].ND_UUID;
                newNode[i].name   = propsNode[i].ND_NM;
                newNode[i].ports  = JSON.parse(propsNode[i].ND_PORTS);
                newNode[i].tp     = propsNode[i].ND_TP;
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
                const nodeOb = engine.getInstanceFactory("CustomNodeModel").getInstance();
                nodeOb.deSerialize(node);
                                
                // Deserialize ports
                _.forEach(node.ports, port => {
                  const portOb = engine.getInstanceFactory("DefaultPortModel").getInstance();
                  portOb.deSerialize(port);
                  nodeOb.addPort(portOb);
                });
          
                newModel.addNode(nodeOb);
            });

            _.forEach(newLink, link => {
                const linkOb = engine.getInstanceFactory("LinkModel").getInstance();
                linkOb.deSerialize(link);
                
                if (link.target && newModel.getNode(link.target)) {
                  linkOb.setTargetPort(newModel.getNode(link.target).getPortFromID(link.targetPort));
                }
          
                if (link.source && newModel.getNode(link.source)) {
                  linkOb.setSourcePort(newModel.getNode(link.source).getPortFromID(link.sourcePort));
                }
          
                newModel.addLink(linkOb);
            });
            newModel.setZoomLevel(newModel.getZoomLevel() + (-1000 / 60));
            engine.setDiagramModel(newModel);      
            this.model = newModel;
           
            // engine.enableRepaintEntities([]);
            // this.forceUpdate();
        }
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
                         , ND_TP     : diagramNode[i].tp 
                         , ND_TTS_ID : diagramNode[i].tts 
                         , ND_X      : diagramNode[i].x   
                         , ND_Y      : diagramNode[i].y  
                         , rowtype   : diagramNode[i].rowtype   })
        }
        let saveLink = [];
        for (let i = 0; i < diagramlinks.length; i ++) {

            saveLink.push({LK_EN_ND     : diagramlinks[i].target
                         , LK_EN_ND_PORT: diagramlinks[i].targetPort
                         , LK_POINT     : JSON.stringify(diagramlinks[i].points) 
                         , LK_ST_ND     : diagramlinks[i].source 
                         , LK_ST_ND_PORT: diagramlinks[i].sourcePort 
                         , LK_TP        : diagramlinks[i].type 
                         , LK_UUID      : diagramlinks[i].id
                         , rowtype      : diagramlinks[i].rowtype  })
        }

        this.props.onSave({node: saveNode, link: saveLink});
    }

    onChange(model, action) {
        let propNode = this.props.dsSnroNode;
        let propLink = this.props.dsSnroLink;
        switch(action.type) {
            case 'node-moved':
                for (let i = 0; i < propNode.length; i ++) {
                    if (action.model.id === propNode[i].ND_UUID) {
                        if (action.model.x      === propNode[i].ND_X 
                         && action.model.y      === propNode[i].ND_Y
                         && action.model.kwdSco === propNode[i].ND_KWD_SCO
                         && action.model.name   === propNode[i].ND_NM
                         && action.model.tp     === propNode[i].ND_TP
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
                        // if (action.model.x      === propLink[i].LK_EN_ND 
                        //  && action.model.y      === propLink[i].LK_EN_ND_PORT
                        //  && action.model.kwdSco === propLink[i].LK_POINT
                        //  && action.model.name   === propLink[i].LK_ST_ND
                        //  && action.model.tp     === propLink[i].LK_ST_ND_PORT) {
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
            
            case 'items-moved': 
                // console.log(action.model.id);
                // console.log(model)
                // console.log(action.model.link.id)
                
                // for (let i = 0; i < propLink.length; i ++) {
                //     if (action.model.link.id === propLink[i].LK_UUID) {
                        
                //         action.model.link.rowtype = "u"
                //         break;
                //     }            
                // }
                // for (let i = 0; i < model.nodes.length; i ++) {
                //     if (action.model.id === model.nodes[i].id) {
                //         model.nodes[i].x       = action.model.x;
                //         model.nodes[i].y       = action.model.y;
                //         model.nodes[i].kwdSco  = action.model.kwdSco;
                //         model.nodes[i].name    = action.model.name;
                //         model.nodes[i].tp      = action.model.tp;
                //         model.nodes[i].tts     = action.model.tts;
                //         model.nodes[i].rowtype = action.model.rowtype;
                //         break;
                //     }            
                // }

                break;
            case 'items-deleted':

                break;
            default: break;
        }    
        this.model.deSerializeDiagram(model,this.engine); 
        this.engine.setDiagramModel(this.model);        
    }

    render() {      
        const { engine, model } = this;
        // Render the canvas
        return ( 
                    <FlexPanel>
                        <ComponentPanel>
                            <RJD.DiagramWidget 
                                ref={"test"} 
                                diagramEngine={engine} 
                                width="100%" 
                                height={this.props.height} 
                                tts={this.props.tts} 
                                actions={{deleteItems: false, canvasDrag: true, multiselect: true, multiselectDrag: true, selectAll: false}}                                
                                onChange={this.onChange.bind(this)}
                            />
                        </ComponentPanel>
                        <ComponentPanel width={'20%'}>
                            <div className="basic-btn" 
                                style={{background: "rgb(238 89 78)", marginTop: "0px"}} 
                                draggable 
                                id = "B"
                                onDragStart={(event) => {
                                    event.dataTransfer.setData("Type", event.target.id);
                                    event.dataTransfer.setData("title", "시나리오 추가");
                                    event.dataTransfer.setData("color", "rgb(238 89 78)");
                                    event.dataTransfer.setData("port", 1);
                                }}
                            >
                                <div className="title">
                                    <div className="name">시나리오 추가</div>
                                </div>                                
                            </div>

                            <div className="basic-btn" 
                                style={{background: "rgb(171 198 0)"}} 
                                draggable 
                                id = "F"
                                onDragStart={(event) => {
                                    event.dataTransfer.setData("Type", event.target.id);
                                    event.dataTransfer.setData("title", "Y/N 프로세스");
                                    event.dataTransfer.setData("color", "rgb(171 198 0)");
                                    event.dataTransfer.setData("port", 3);
                                    

                                }}
                            >
                                <div className="title">
                                    <div className="name">Y/N 프로세스</div>
                                </div>                                
                            </div>

                            <div className="basic-btn" 
                                style={{background: "rgb(83, 116, 245)"}} 
                                draggable 
                                id = "S"
                                onDragStart={(event) => {
                                    event.dataTransfer.setData("Type", event.target.id);
                                    event.dataTransfer.setData("title", "선택지 프로세스");
                                    event.dataTransfer.setData("color", "rgb(83, 116, 245)");
                                    event.dataTransfer.setData("port", 4);  
                                }}
                            >
                                <div className="title">
                                    <div className="name">선택지 프로세스</div>
                                </div>                                
                            </div>
                            <div className="basic-btn" 
                                style={{background: "rgb(251 185 0)"}} 
                                draggable 
                                id = "D"
                                onDragStart={(event) => {
                                    event.dataTransfer.setData("Type", event.target.id);
                                    event.dataTransfer.setData("title", "날짜 검출");
                                    event.dataTransfer.setData("color", "rgb(251 185 0)");
                                    event.dataTransfer.setData("port", 2);
                                    

                                }}
                            >
                                <div className="title">
                                    <div className="name">날짜 검출</div>
                                </div>                                
                            </div>

                            <div className="basic-btn" 
                                style={{background: "rgb(210 215 218)"}} 
                                draggable 
                                id = "E"
                                onDragStart={(event) => {
                                    event.dataTransfer.setData("Type", event.target.id);
                                    event.dataTransfer.setData("title", "시나리오 종료");
                                    event.dataTransfer.setData("color", "rgb(210 215 218)");
                                    event.dataTransfer.setData("port", 0);
                                }}
                            >
                                <div className="title">
                                    <div className="name">시나리오 종료</div>
                                </div>                                
                            </div>

                        </ComponentPanel>
                    </FlexPanel>
                );
    }
}

export default Diagram;