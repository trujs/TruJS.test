/**
* This factory produces a worker function that tests a value to see if it equals
* the literal value false.
* @factory
*/
function _IsFalse() {

  /**
  * @worker
  * @type {assertion}
  * @param {any} value The value to test for false
  * @returns {boolean}
  */
  return function IsFalse(value) {
    return value === false;
  };
};
