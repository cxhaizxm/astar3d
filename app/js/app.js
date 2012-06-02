$(function() {
    var levelWidth = 10;
    var levelHeight = 10;
    var graph;
    var astar;
    var options = {diagonal: false, heuristic: "euclidean", animate: "true", heightFactor: 0.5};
    var showPathInfo = false;
    var levelJson;
    var graphOptions = {random: false, fullRandom: false, wallPercentage: 0.05};
    var testStartDimension = 10;
    var testEndDimension = 15;

    init();

    $("#levelWidth").change(function() {
        levelWidth = $("#levelWidth").val();
    });
    $("#levelHeight").change(function() {
        levelHeight = $("#levelHeight").val();
    });

    $("#diagonal").change(function() {
        options.diagonal = !!$("#diagonal").attr("checked");
    });

    $("#pathInfo").change(function() {
        if ($("#pathInfo").attr("checked")) {
            showPathInfo = true;
        } else {
            showPathInfo = false;
        }
    });

    $("#heuristic").change(function() {
        options.heuristic = $(this).val();
    });

    $("#heightFactor").change(function() {
        options.heightFactor = $(this).val();
    });

    $("#wallPercentage").change(function() {
        graphOptions.wallPercentage = $(this).val();
    });

    $("#testStartDimension").change(function() {
        testStartDimension = $("#testStartDimension").val();
    });

    $("#testEndDimension").change(function() {
        testEndDimension = $("#testEndDimension").val();
    });

    $("#runTests").click(function() {
        graphOptions.random = false;
        runTests();
    });

    $("#runRandomTests").click(function() {
        graphOptions.random = true;
        runTests();
    });

     $("#runFullRandomTests").click(function() {
        graphOptions.random = false;
        graphOptions.fullRandom = true;
        runTests();
    });

    $("#generateLevel").click(function() {
        graphOptions.random = false;
        graph.generateLevel(levelWidth, levelHeight, graphOptions);
    });

    $("#generateLevelRandom").click(function() {
        graphOptions.random = true;
        graph.generateLevel(levelWidth, levelHeight, graphOptions);
    });

    $("#generateLevelFullRandom").click(function() {
        graphOptions.random = false;
        graphOptions.fullRandom = true;
        graph.generateLevel(levelWidth, levelHeight, graphOptions);
    });
    
    $("#processBtn").click(function() {
        pathfinding();
    });

    $("#clearBtn").click(function() {
        graph.clear();
    });

    $("#editBtn").click(function() {
        if (graph.leftClickMode == "edit") {
            graph.leftClickMode = "normal";
            $("#messages").html("");
        } else {
            graph.leftClickMode = "edit";
            $("#messages").html("EDITMODE");
        }
    });

    $("#saveBtn").click(function() {
        graph.save();
    });

    $("#loadField").change(function() {
        levelJson = $(this).val();
    });

    $("#loadBtn").click(function() {
        graph.load(levelJson);
    });

    $("#container").on("nodeInfo",function() {
            $("#nodeInfo").html("Node[" + graph.nodeInfo.x + "][" + graph.nodeInfo.y + "][" + graph.nodeInfo.z + "]" + " <br/>" +
                                "f-Score:" + graph.nodeInfo.f.toFixed(2) + "<br/>" +
                                "h-Score:" + graph.nodeInfo.h.toFixed(2) + "<br/>" +
                                "g-Score:" + graph.nodeInfo.g.toFixed(2) + "<br/>");
        
    });

    function pathfinding() {
        var startTime = new Date();
        var result = astar.process(graph.node, graph.startNode, graph.endNode, options);
        var endTime = new Date();

        result.time = endTime-startTime;

        //console.log("Time: " + result.time + " ms");
        analysis(result);
        
        return result;
        
    }

    function analysis(result) {
        if (showPathInfo)
            graph.showPathInfo(result.path);
        
        graph.printPath(result.path);

        $("#pathLength").html("path length: " + result.path.length + "<br/>");
        $("#traversedNodes").html("traversed Nodes: " + result.traversedNodes + "<br/>");
        $("#time").html("time: " + result.time + " ms" + "<br/>");
    }

    function init() {
        $("#container").empty().remove();
        graph = new Graph();
        graph.init();
        graph.generateLevel(levelWidth, levelHeight, graphOptions);
        //graph.generate(levelWidth,levelHeight);
        //graph.printGraph();
        graphOptions.random = false;
        astar = new AStar();
    }

    function runTests() {
        var warmup = 10;
        var startDimension = testStartDimension;
        var endDimension = testEndDimension;
        var repetitions = 50;
        var result;
        var timeAverage;
        var test = $("#test");

        var testResults = "";

        for (var i=startDimension; i<=endDimension; i++) {
            levelWidth = i;
            levelHeight = i;
            console.log(i + "x" + i + " Level:");

            //generate level and test if path exists
            do {
                graph.generateLevel(levelWidth, levelHeight, graphOptions);
                graph.startNode = graph.node[0][0][graph.startCornerHeight];
                graph.endNode = graph.node[i-1][i-1][graph.endCornerHeight];
                result = pathfinding();
            } while (result.path.length === 0);

            timeAverage = 0;
            for (var j=0; j<repetitions+warmup; j++) {
                graph.clear();
                result = pathfinding();

                if (j > warmup-1) {
                    timeAverage += result.time;
                }
            }
            timeAverage = timeAverage/repetitions;
            console.log("traversed elements: " + result.traversedNodes);
            console.log("average time: " + timeAverage);
            //test.append(result.traversedNodes + "    " + timeAverage + "\n");
            testResults += result.traversedNodes + "    " + timeAverage + "\r\n";

        }
        console.log("TESTRESULTS:\n" + testResults);
    }
});