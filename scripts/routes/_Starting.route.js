/**[@route({ "label": "starting", "type": "router", "path": "/Starting" })]*/
function _Starting(testProxy, routeReporter) {

    /**
    * @worker
    */
    return function Starting(req, res) {
        if (testProxy.run) {
            routeReporter.info("* Starting " + req.body.count + " tests");
            routeReporter.group("starting");
        }
        res.end();
    };
}