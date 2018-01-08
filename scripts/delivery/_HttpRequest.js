/**
*
* @function
*/
function _HttpRequest(xmlHttpRequest) {

    /**
    * @worker
    */
    return function HttpRequest(config) {
        var httpReq = new xmlHttpRequest();

        httpReq.open(config.method, config.url);
        httpReq.setRequestHeader( "Content-Type", "application/json");
        httpReq.responseType = "json";

        if (!!config.cb) {
            httpReq.addEventListener("load", function () {
                config.cb(null, httpReq.response);
            });
            httpReq.addEventListener("error", function () {
                config.cb(httpReq.status);
            });
        }

        if (!!config.data) {
            httpReq.send(JSON.stringify(config.data));
        }
        else {
            httpReq.send();
        }
    };
}