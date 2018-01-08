/**[@route({ "label": "results", "type": "router", "path": "/Results" })]*/
function _Results(testProxy, routeReporter) {

    /**
    * @worker
    */
    return function Results(req, res) {
        if (testProxy.run) {
            routeReporter.groupEnd("starting");
            testProxy.done(req.body);
        }
        res.end();
    };
}