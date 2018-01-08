/**
* This factory produces a worker function that returns a member from the
* arguments sent to a callback
* @factory
*/
function _GetCallbackResp(isMockCallback) {

  /**
  * @worker
  * @type {converter}
  * @param {object} cb The callback
  * @param {number} num The index of the callback instance
  * @returns {array}
  */
  return function GetCallbackResp(cb, num) {
    //they could have called this without a call number, so set it to 0
    if (isNill(num)) {
      num = 0;
    }

    if (!isMockCallback(cb)) {
      return "The value must be a callback to use the GetCallbackArg conversion";
    }

    //check the callback count
    if (num >= cb.callbackCount) {
      return "The callback was not called " + (num + 1) + " times.";
    }

    //get he args for this call
    var cbResp = cb.getResponse(num);

    return cbResp;
  };
};
