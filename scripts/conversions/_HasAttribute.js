/**
*
* @factory
*/
function _HasAttribute() {

  /**
  * @worker
  * @type {converter}
  * @param {Element} el The Element to get the attribute from
  * @param {String} name The name of the attribute to get
  * @returns {array}
  */
  return function HasAttribute(el, name) {
    return isElement(el) ? el.hasAttribute(name) : "You must use an element for the 'HasAttribute' conversion";
  };
};