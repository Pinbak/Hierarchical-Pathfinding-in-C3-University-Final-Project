import Globals from "./globals.js";
import * as Ut from "./ut.js";

export function buildEdges(runtime){
    defineNodes(runtime);
    for (const building of runtime.objects.sprBuilding.getAllInstances()){
        // add building to list of buildings
        for (const lift of runtime.objects.sprLiftShaft.getAllInstances()){
            // if a building is overlapping a lift
            if (building.testOverlap(lift)){
                Globals.edges.push([String(building.uid),String(lift.uid),Ut.distanceTo(building.x,building.y,lift.x,lift.y)]);
            }
            // otherwise just put it on the graph with no connections
            else{Globals.graph[String(building.uid)] = [[],[]]}
        }

        // testing if a room overlaps a building (to know what building the room is in)
        for (const room of runtime.objects.sprRoom.getAllInstances()){
            if (room.testOverlap(building)){
                Globals.subEdges.push([String(room.uid),String(building.uid)]);
            }
        }

        // testing for ground overlap
        const groundInstance = runtime.objects.sprGroundFloor.getFirstInstance();
        if (building.testOverlap(groundInstance)){
            Globals.edges.push([String(groundInstance.uid),String(building.uid),Ut.distanceTo(building.x,building.y,groundInstance.x,groundInstance.y)]);
        }
    }
    //console.log(Globals.edges, Globals.subEdges, Globals.nodes);
}

function defineNodes(runtime){
    for (const building of runtime.objects.famBuilding.getAllInstances()){
        if (building.objectType.name === "sprRoom"){
            addToNodes(building.uid, "room", building.x, building.y);
        }else if (building.objectType.name === "sprBuilding"){
            addToNodes(building.uid, "building", building.x, building.y);
        }else if (building.objectType.name === "sprLiftShaft"){
            addToNodes(building.uid, "lift", building.x, building.y);
        }else if (building.objectType.name === "sprGroundFloor"){
            addToNodes(building.uid, "groundFloor", building.x, building.y);
        }
    }
}

function addToNodes(node, type, localX, localY){
    if (!Globals.nodes.hasOwnProperty(node)){
        Globals.nodes[node] = [];
    }
    Globals.nodes[node].push(type, localX, localY);
}

export function buildGraphs(){
    populateGraph(Globals.edges, Globals.graph, true);
    populateGraph(Globals.subEdges, Globals.subGraph, false);
}

function populateGraph(localEdge, graph, cost){
    // loop through every edge
    for (const edge of localEdge){
        let a = edge[0];
        let b = edge[1];
        
        // if doesn't exist, initialize
        if (!graph.hasOwnProperty(a)){
            if (cost){graph[a] = [[],[]];}
            else{graph[a] = [];}
        }
        if (!graph.hasOwnProperty(b)){
            if (cost){graph[b] = [[],[]];}
            else{graph[b] = [];}
        }
        
        // adding cost to the graph
        if (cost){
            // creating the adjacency list
            graph[a][0].push(b);
            graph[b][0].push(a);
            // adding cost
            graph[a][1].push(Math.round(edge[2]));
            graph[b][1].push(Math.round(edge[2]));
        }else {
            // creating the adjacency list
            graph[a].push(b);
            graph[b].push(a);     
        }
    }
    //console.log(graph);
}

export function visualizeNodes(runtime, showSubGraph){
    
    // creating the visualizatoin of the connectors (edges)
    for (const edge of Globals.edges){
        for (const building of runtime.objects.famBuilding.getAllInstances()){
            if (String(building.uid) === edge[0]){
                const lastConnectorInstance = runtime.objects.sprNodeConnector.createInstance("rooms",building.x,building.y,false);
                for (const secondBuilding of runtime.objects.famBuilding.getAllInstances()){
                    if (String(secondBuilding.uid) === edge[1]){
                        lastConnectorInstance.width = Ut.distanceTo(building.x, building.y, secondBuilding.x, secondBuilding.y);
                        lastConnectorInstance.angle = Ut.angleTo(building.x, building.y, secondBuilding.x, secondBuilding.y);

                        // cost label
                        if (building.x < secondBuilding.x){
                            const lastConnectorTextInstance = runtime.objects.txtLabel.createInstance("rooms",building.x,building.y,false);
                            lastConnectorTextInstance.width = Ut.distanceTo(building.x, building.y, secondBuilding.x, secondBuilding.y);
                            lastConnectorTextInstance.angle = Ut.angleTo(building.x, building.y, secondBuilding.x, secondBuilding.y);
                            lastConnectorTextInstance.fontColor = [.4,.2,.4];
                            lastConnectorTextInstance.horizontalAlign = "center";
                            lastConnectorTextInstance.text = String(Math.round(edge[2]));
                        }else {
                            const lastConnectorTextInstance = runtime.objects.txtLabel.createInstance("rooms",secondBuilding.x,secondBuilding.y,false);
                            lastConnectorTextInstance.width = Ut.distanceTo(secondBuilding.x, secondBuilding.y, building.x, building.y);
                            lastConnectorTextInstance.angle = Ut.angleTo(secondBuilding.x, secondBuilding.y, building.x, building.y);
                            lastConnectorTextInstance.fontColor = [.4,.2,.4];
                            lastConnectorTextInstance.horizontalAlign = "center";
                            lastConnectorTextInstance.text = String(Math.round(edge[2]));
                        }


                    }
                }
            }
        }
    }

    // creating the visualizatoin of the connectors (edges) for the rooms
    if (showSubGraph){
        for (const subEdge of Globals.subEdges){
            for (const building of runtime.objects.sprBuilding.getAllInstances()){
                if (String(building.uid) === subEdge[1]){
                    const lastConnectorInstance = runtime.objects.sprNodeConnector.createInstance("rooms",building.x,building.y,false);
                    lastConnectorInstance.colorRgb = [0,0,1];
                    lastConnectorInstance.opacity = .5;
                    for (const room of runtime.objects.sprRoom.getAllInstances()){
                        if (String(room.uid) === subEdge[0]){
                            lastConnectorInstance.width = Ut.distanceTo(building.x, building.y, room.x, room.y);
                            lastConnectorInstance.angle = Ut.angleTo(building.x, building.y, room.x, room.y);                      
                        }
                    }
                }
            }
        }
    }
    
    // creating the visualization of the nodes
    for (const building of runtime.objects.famBuilding.getAllInstances()){
        const lastNodeInstance = runtime.objects.sprNodeVisualizer.createInstance("rooms",building.x,building.y,false);
        // create the label
        const lastTextInstance = runtime.objects.txtLabel.createInstance("rooms",building.x,building.y,false);
        lastTextInstance.text = String(building.uid);

        // if room colour differently
        if (building.objectType.name === "sprRoom"){
            lastNodeInstance.colorRgb = [0,0,1];
            lastNodeInstance.opacity = .5;
            if (!showSubGraph){
                lastNodeInstance.destroy();
            }
        }
        
    }

}

/*
function getParentNodes(){
    for (const edge of edges){
        // if the edge is a room
        if (Globals.nodes[edge[0]][0] === "room"){
            const self = Globals.graph[edge[0]];
            // get the parents connections
            for (const element of (Globals.graph[edge[1]])){
                self.push(element);
            }
            // remove self from new graph
            self.splice(self.indexOf(self),1);
        }
    }
    console.log(Globals.graph);
}
*/