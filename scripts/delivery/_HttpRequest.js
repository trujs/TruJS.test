/**
*
* @function
*/
function _HttpRequest(xmlHttpRequest) {

    /**
    * Converts the value to a json value
    * @function
    */
    function convertValue(value, root) {
        if (isError(value)) {
            return {
                "error": {
                    "message": value.message
                    , "stack": value.stack
                }
            };
        }
        else if (isElement(value)) {
            return {
                "element": value.outerHTML
                , "childNodes": convertValue(value.childNodes)
            };
        }
        else if (isCollection(value)) {
            value = convertValue(
                Array.prototype.slice.apply(value)
            );
            if (root) {
                return {
                    "collection": value
                };
            }
            return value;
        }
        else if (isList(value)) {
            value = convertValue(
                Array.prototype.slice.apply(value)
            );
            if (root) {
                return {
                    "list": value
                };
            }
            return value;
        }
        else if (isArray(value)) {
            value = value
            .map(function (member) {
                return convertValue(member);
            });
            if (root) {
                return {
                    "array": value
                };
            }
            return value;
        }
        else if (isFunc(value)) {
            return {
                "function": value.toString()
            };
        }
        else if (!isObject(value)) {
            return {
                "primitive": value
            };
        }
        return value;
    }

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

        config.data = convertValue(config.data, true);

        if (!!config.data) {
            httpReq.send(
                JSON.stringify(config.data)
            );
        }
        else {
            httpReq.send();
        }
    };
}