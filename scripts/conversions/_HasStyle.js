/**
*
* @factory
*/
function _HasStyle() {

  /**
  * @worker
  * @type {converter}
  * @param {Element} el The Element to get the style from
  * @param {String} name The name of the style to get
  */
  return function HasStyle(el, name) {
    return isElement(el) ? !!el.style[name] : "You must use an element for the 'HasStyle' conversion";
  };
};