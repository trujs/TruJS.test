/**[@route({ "label":"testapp", "type":"app", "path":"/", "static": ["/public"], "routers": ["results","starting","running","run","log"], "middleware": ["jsonbodyparser","error"] })]*/
function _EntryPoint(testProxy) {

    /**
    * @worker
    */
    return function EntryPoint(req, res, next) {
        if (req.url.indexOf("test.js") !== -1) {
            res.set("Content-Type", "application/javascript");
            res.send(new Buffer("TruJSTest(\".testPackage\").init(" + testProxy.data + ")"));
            res.end();
        }
        else {
            next();
        }
    };
}