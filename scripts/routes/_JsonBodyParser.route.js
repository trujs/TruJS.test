/**[@route({ "label": "jsonbodyparser", "type": "middleware" })]*/
function _JsonBodyParser(nodeBodyParser) {

    /**
    * @worker
    */
    return nodeBodyParser.json();
}