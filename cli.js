/**[@naming({ "skip": true })]*/
/**
* @module TruJS.test.cli
*/

var cmdArgs = require("trujs-cmdargs")(process.argv)
, trujsTest = require("./index.js")
, trujsTestRun = trujsTest(".run")
, reporter = trujsTest(".testReporter")
, skipTypes = ["start-test","end-test","start-iteration","end-iteration","finished"]
;

//set the report level and add the reporter handler
reporter.setLevels("all");
reporter.addHandler(function (msg, type) {
    if (skipTypes.indexOf(type) === -1) {
        if (type.indexOf("group") === -1) {
            if (type === "error") {
                console.error(msg);
            }
            else if (type === "warning") {
                console.warn(msg);
            }
            else {
                console.log(msg);
            }
        }
        else if (type === "group") {
            console.group();
        }
        else if (type === "groupEnd") {
            console.groupEnd();
        }
    }
});

//run the test
trujsTestRun(cmdArgs)
  .catch(function (err) {
    reporter.error(err);
  });