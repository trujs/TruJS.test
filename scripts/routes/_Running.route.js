/**[@route({ "label": "running", "type": "router", "path": "/Running" })]*/
function _Running(testProxy, routeReporter, cmdArgs) {

    /**
    * @worker
    */
    return function Running(req, res) {
        if (testProxy.run) {
            if (cmdArgs.flags.filter(function (op) { return op === "v"; }).length > 0) {
                routeReporter.extended("(" + parseFloat(req.body.percent).toFixed(2) + "%) " + req.body.title);
            }
        }
        res.end();
    };
}