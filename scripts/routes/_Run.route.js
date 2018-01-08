/**[@route({ "label": "run", "type": "router", "path": "/Run" })]*/
function _Run(testProxy) {

    /**
    * @worker
    */
    return function Run(req, res) {
        res.json({ "run": testProxy.run });
    };
}