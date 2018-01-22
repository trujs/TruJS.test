/**
*
* @factory
*/
function _GetStyle() {

  /**
  * @worker
  * @type {converter}
  * @param {Element} el The Element to get the style from
  * @param {String} name The name of the style to get
  */
  return function GetStyle(el, name) {
    return isElement(el) ? el.style[name] : "You must use an element for the 'GetStyle' conversion";
  };
};