/**
*
* @factory
*/
function _GetAttribute() {

  /**
  * @worker
  * @type {converter}
  * @param {Element} el The Element to get the attribute from
  * @param {String} name The name of the attribute to get
  * @returns {array}
  */
  return function GetAttribute(el, name) {
    return isElement(el) ? el.getAttribute(name) : "You must use an element for the 'GetAttribute' conversion";
  };
};