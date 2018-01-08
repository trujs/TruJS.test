/**[@route({ "label":"error", "type":"middleware", "afterRouters": true })]*/
function _Error(routeReporter, testProxy) {

    /**
    * @worker
    */
    return function Error(err, req, res, next) {
        routeReporter.error(err);
        res.sendStatus(500);
    }
}