/**[@route({ "label": "log", "type": "router", "path": "/Log", "methods":"POST" })]*/
function _Log(testProxy, routeReporter) {

    /**
    * @worker
    */
    return function Log(req, res) {
        if (testProxy.run) {
            routeReporter.report("seperator", "");
            routeReporter.report("seperator", "**********************************");
            routeReporter.report("seperator", "** Console log from the browser **");
            routeReporter.log(req.body);
            routeReporter.report("seperator", "**********************************");
            routeReporter.report("seperator", "");
        }
        res.end();
    };
}