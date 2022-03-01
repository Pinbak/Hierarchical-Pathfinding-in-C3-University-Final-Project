import Globals from "./globals.js";
import * as Ut from "./ut.js";

// 2d array of edges for nodes
let graph = {
    
};

let edges = [];

export function buildEdges(runtime){
    for (const building of runtime.objects.sprBuilding.getAllInstances()){
        // add building to list of buildings
        for (const lift of runtime.objects.sprLiftShaft.getAllInstances()){
            // if a building is overlapping a lift
            if (building.testOverlap(lift)){
                edges.push([String(building.uid),String(lift.uid)])
            }
        }
    }
    console.log(edges);
}

export function buildGraph(runtime){
    // loop through every edge
    for (const edge of edges){
        let a = edge[0];
        let b = edge[1];
        
        // if don't exist, initialize
        if (!graph.hasOwnProperty(a)){
            graph[a] = [];
        }
        if (!graph.hasOwnProperty(b)){
            graph[b] = [];
        }
        // creating the adjacency list
        graph[a].push(b);
        graph[b].push(a);
    }
    //console.log(graph);
}

export function visualizeNodes(runtime){
    
    // creating the visualizatoin of the connectors (edges)
    for (const edge of edges){
        for (const building of runtime.objects.famBuilding.getAllInstances()){
            if (String(building.uid) === edge[0]){
                const lastConnectorInstance = runtime.objects.sprNodeConnector.createInstance("rooms",building.x,building.y,false);
                for (const secondBuilding of runtime.objects.famBuilding.getAllInstances()){
                    if (String(secondBuilding.uid) === edge[1]){
                        lastConnectorInstance.width = Ut.distanceTo(building.x, building.y, secondBuilding.x, secondBuilding.y);
                        lastConnectorInstance.angle = Ut.angleTo(building.x, building.y, secondBuilding.x, secondBuilding.y);
                    }
                }
            }
        }
        
    }

    // creating the visualization of the nodes
    for (const building of runtime.objects.famBuilding.getAllInstances()){
        runtime.objects.sprNodeVisualizer.createInstance("rooms",building.x,building.y,false);
        // create the label
        const lastTextInstance = runtime.objects.txtLabel.createInstance("rooms",building.x,building.y,false);
        lastTextInstance.text = String(building.uid);
    }
}