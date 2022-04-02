const Globals = {
	CURRENTLY_PLACING: 1,
    GRID_SIZE_X: 5,
    GRID_SIZE_Y: 20,
    EDGE_COUNT: 0,
    GROUND_LEVEL: 360,
    TIME: 475,
    SPEED: 1,
    TIMER: "",
    LIFTTIMER: "",
    JUST_BUILT: false,
    CENTER_X: 320,
    CENTER_Y: 240,
    IS_PLACING: false,
    LAST_SELECTED: 0,

    // graph object storing the nodes and corresponding connecting nodes
    graph: {},
    // information about the nodes
    nodes: {},
    // sub graph storing nodes of rooms and corresponding building nodes
    subGraph: {},

    // 2d array of edges between nodes
    edges: [],
    // 2d array of edges between rooms and buildings (format: "r, b")
    subEdges: [],

    // lift shaft stores the queue
    liftShaft: {},

    // stores the quantity of people waiting for each lift
    liftShaftAmount: {},

    // global schedule (secondary problem)
    // in minutes, so 480 = 8am, 540 = 9am etc.
    schedule: {
        "worker": {
            // morning
            480: ["out", 0.5, "go to work"],
            540: ["out", 1, "go to work"],
            // midday
            660: ["working", 0.2, "go to bathroom"],
            720: ["working", 0.5, "go to eat"],
            780: ["working", 0.5, "go to eat"],
            800: ["eating", 0.3, "go to bathroom"],
            810: ["working", 0.3, "go to eat"],
            830: ["eating", 0.3, "go to bathroom"],
            // evening
            960: ["working", 0.3, "go to bathroom"],
            1020: ["working", 0.5, "go home"],
            1050: ["working", 0.5, "go home"],
            1080: ["working", 0.8, "go home"],
            1110: ["working", 1, "go home"]
        },
        "resident": {
            // morning
            480: ["idle", 0.3, "go to eat"],
            485: ["idle", 0.5, "go out"],
            540: ["idle", 0.3, "go to eat"],
            545: ["idle", 0.5, "go out"],
            600: ["idle", 0.2, "go out"],
            660: ["idle", 0.2, "go out"],
            // midday
            710: ["idle", 0.2, "go out"],
            720: ["idle", 0.5, "go to eat"],
            780: ["idle", 0.5, "go to eat"],
            810: ["idle", 0.3, "go to eat"],
            820: ["idle", 0.2, "go out"],
            // evening
            1020: ["idle", 0.2, "go to eat"],
            1050: ["idle", 0.2, "go to eat"],
            1080: ["idle", 0.2, "go to eat"],
            1110: ["idle", 0.2, "go to eat"],
            1200: ["idle", 0.2, "go out"],
            1260: ["idle", 0.2, "go out"]
        }
    }
};


// Export the object representing global variables.
export default Globals;