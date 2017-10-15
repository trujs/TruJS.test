/**
* And object factory that creates a callback function object that when called,
* stores the arguments, the scope, and the mock response.
* @factory
*/
function _Callback($self, performance, functionInspector) {

    /**
    * @worker
    * @type {callback}
    * @param {object|function} response An object, or function to generate an object, to be returned when the callback is called
    * @param {boolean} autoRun When set to true, and the response is a function, the function will be ran and the result will become the response
    */
    function Callback() {
        //**************************************************
        // private variables
        /**
        * An array to store results from each callback call
        * @property callbacks
        */
        var callbacks = []
        /**
        * Store the response value from the callback constructor
        * @property response
        */
        , response = arguments[0]
        /**
        * If the response is a function then this is the name of the function
        * @property
        */
        , name = typeof arguments[0] === "function" && functionInspector(arguments[0]).name || null
        /**
        * When set to true, and the response is a function, the function will be ran and the result will become the response
        * @property autoRun
        * @default true
        */
        , autoRun = !!arguments[1] || isNill(arguments[1]) && true || false
        ;

        /**
        * @base
        */
        function callback() {
            //create a local var to hold the response (so we don't overwrite the original)
            var entry = { num: callbacks.length, args: Array.prototype.slice.call(arguments, 0), scope: this, timestamp: performance.now() }
            , resp = response;
            //record the results
            callbacks.push(entry);
            //run the response
            if (typeof resp === 'function' && !!autoRun) {
                //run the function
                resp = resp.apply(this, arguments);
            }
            //add the response
            entry.response = resp;
            //return the response
            return resp;
        }

        //set the prototype for type checking
        Object.setPrototypeOf(callback, $self);

        //**************************************************
        // public methods and properties
        return Object.defineProperties(callback, {
            /**
            * This function returns the total number of times the function was called
            * @function
            */
            "callbackCount": {
                "enumerable": true
                , "get": function () { return callbacks.length || 0; }
            }
            /**
            * This function returns the callback records
            * @function
            */
            , "callbacks": {
                "enumerable": true
                , "get": function () { return callbacks; }
            }
            /**
            *
            * @function
            * @param {integer} indx The index of the callback to return the args for
            */
            , "getArgs": {
                "enumerable": true
                , "value": function (indx) { return callbacks.length > indx && callbacks[indx].args || []; }
            }
            /**
            *
            * @function
            * @param {integer} indx The index of the callback to return the args for
            */
            , "getArgCount": {
                "enumerable": true
                , "value": function (indx) { return callbacks.length > indx && callbacks[indx].args.length || 0; }
            }
            /**
            *
            * @function
            * @param {integer} indx The index of the callback to return the args for
            */
            , "getScope": {
                "enumerable": true
                , "value": function (indx) { return callbacks.length > indx && callbacks[indx].scope || null; }
            }
            /**
            *
            * @function
            * @param {integer} indx The index of the callback to return the args for
            */
            , "getResponse": {
                "enumerable": true
                , "value": function (indx) { return callbacks.length > indx && callbacks[indx].response || null; }
            }
            /**
            *
            * @function
            * @param {object} resp The value that will be returned from the callback
            *
            */
            , "setResponse": {
                "enumerable": true
                , "value": function (resp, auto) {
                    response = resp;
                    if (!isNill(auto)) {
                        autoRun = auto;
                    }
                }
            }
        });
    }

    /**
    * Checks an object to see if it's a callback.
    * @function
    * @static
    * @param {object} obj The object to check
    */
    Callback.isCallback = function (obj) {
        return Object.getPrototypeOf(obj) === $self;
    };

    return Callback;
};
