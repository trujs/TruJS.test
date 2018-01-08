/**
* This factory produces a worker function that takes the command line arguments
* object, loads the test files and runs it
* @factory
*/
function _Run(promise, nodePath, nodeFs, nodeRequire, errors, defaults, testPackage, nodeCwd, testReporter) {
  var PATH_PATT = /[./\\]/
  , cnsts = {
      "skipArgs": [
          "_executable"
          , "_script"
          , "command"
          , "flags"
          , "ordinals"
          , "serve"
          , "file"
          , "module"
          , "format"
      ]
  }
  ;

  /**
  * Starts the testing process, sets up a file watcher if we are watching
  * @function
  */
  function start(resolve, reject, cmdArgs, server) {
      try {
          var watch = cmdArgs.hasOwnProperty("watch"), watcher
          , running = true;

          //setup the watcher
          if (watch) {
              testReporter.report("seperator","");
              testReporter.info("* Starting the test file watcher *");
              testReporter.report("seperator","");
              watcher =
              nodeFs.watch(formatPath(cmdArgs.file, cmdArgs.format), function () {
                  if (!running) {
                      running = true;
                      testReporter.info("* Change detected, starting tests *");
                      testReporter.report("seperator","");
                      executeTest(cmdArgs, server, done);
                  }
              });
          }

          //run the first test
          executeTest(cmdArgs, server, done);

          //the test runner callback function
          function done(err, results) {
              running = false;
              if (!watch || !!err) {
                  shutdown(err, results);
              }
          }
      }
      catch(ex) {
          shutdown(ex);
          reject(ex);
      }

      //a function that shuts down the server and watcher
      function shutdown(err, results) {
          //stop the watcher
          if (!!watcher) {
              testReporter.info("* Stopping the file watcher *");
              watcher.close();
          }
          //stop the server
          if (!!server) {
              testReporter.info("* Stopping Web Server *");
              server.instance.close(function () {
                  testReporter.info("* Web Server Stopped *");
                  finalize(err, results);
              });
          }
          else {
              finalize(err, results);
          }
      }
      //
      function finalize(err, results) {
          if (!!err) {
              reject(err);
          }
          else {
              resolve(results);
          }
      }
  }
  /**
  * Executes the test runner or browser test runner
  * @function
  */
  function executeTest(cmdArgs, server, cb) {
      //load the test file
      var proc =  new promise(function (resolve, reject) {
        loadTestFile(resolve, reject, cmdArgs);
      });

      //setup the server callback
      if (!!server) {
          proc = proc.then(function (tests) {
              return new promise(function (resolve, reject) {
                  try {
                      //setup the test data and done function
                      server.data = JSON.stringify(tests);
                      server.run = true;
                      server.done = function (results) {
                          server.run = false;
                          testReporter.report("seperator","");

                          resolve(results);
                      }
                  }
                  catch(ex) {
                      reject(ex);
                  }
              });
          });
      }
      else {
          //execute the test runner
          proc = proc.then(function(tests) {
            return new Promise(function (resolve, reject) {
              startRunner(resolve, reject, tests, cmdArgs);
            });
          });
      }

      //output the results
      proc = proc.then(function (results) {
          return new Promise(function (resolve, reject) {
              try {
                  testReporter.info("* Testing Finished *");
                  testReporter.report("seperator", "");
                  processResults(cmdArgs, results);

                  resolve(results);
              }
              catch(ex) {
                  reject(ex);
              }
          });
      });

      //call the callback
      proc.then(function (results) {
          cb(null, results);
      })
      .catch(function (error) {
          cb(error);
      });
  }
  /**
  * Gets the file name from the command line args, and load the file
  * @function
  */
  function loadTestFile(resolve, reject, cmdArgs) {
    //reject if we are missing the path
    if (!cmdArgs.file) {
      reject(new Error(errors.missingTestFileArg));
      return;
    }

    try {
        //format the path
        //load the test file data
        nodeFs.readFile(
            formatPath(cmdArgs.file, cmdArgs.format)
            , "utf8"
            , readFileCb
        );
    }
    catch(ex) {
        reject(ex);
    }

    //handler for the read file callback
    function readFileCb(err, data) {
      if(!!err) {
        reject(err);
      }
      else {
        processTestData(resolve, reject, data);
      }
    }

  }
  /**
  * Formats the test file path
  * @function
  */
  function formatPath(path, format) {

    //add the default file name if missing
    if (path.indexOf(".js") === -1) {
      path = nodePath.join(path, (!!format && format + "." || "") + defaults.testFile);
    }

    //update the special segments
    Object.keys(defaults.testPath)
      .forEach(function forEachSeg(seg) {
        path = path.replace( "{" + seg + "}", defaults.testPath[seg]);
      });

    return path;
  }
  /**
  * JSON.parse the test file data
  * @function
  */
  function processTestData(resolve, reject, data) {
    try{
      resolve(JSON.parse(data));
    }
    catch(ex) {
      reject(ex);
    }
  }
  /**
  * Add the tests to the test package, and the module if there is a module name
  * in the command args
  * @function
  */
  function startRunner(resolve, reject, tests, cmdArgs) {
    try {
      //init the package with the tests
      testReporter.info("* Initializing the package *");
      testPackage.init(tests);

      //add the module if there is a module arguments
      if (!!cmdArgs.module) {
        var module = getModulePath(cmdArgs.module);
        testPackage.setup("module")["value"](nodeRequire(module));
      }

      testReporter.info("* Testing Started *");

      //resolve all the tests, start the runner
      var runner = testPackage.resolve().run(cmdArgs);

      resolve(runner);
    }
    catch(ex) {
      reject(ex);
    }
  }
  /**
  *
  * @function
  */
  function getModulePath(module) {
      if (PATH_PATT.exec(module)) {
          return nodePath.join(nodeCwd, module);
      }
      return module;
  }
  /**
  * Starts the web server for browser tests
  * @function
  */
  function startServer(resolve, reject, cmdArgs) {
      try {
          var server = nodeRequire("./server.js")
          , test, port = (cmdArgs.serve = cmdArgs.serve || 3000);

          //link the reporters
          server.setEntry("routeReporter", testReporter);
          server.setEntry("cmdArgs", cmdArgs);

          test = server(".testProxy");
          test.url = getBrowserUrl(cmdArgs);

          //resolve the serve worker
          //start the server
          server(".$serve$")({ "port": port })
          .then(function (appList) {
              //set the node http server instance so we can close later
              test.instance = appList.testapp.server;

              testReporter.info("* Web server running on port: " + port + " *");
              testReporter.info("  " + test.url);

              resolve(test);
          })
          .catch(function (err) {
             reject(err);
          });
      }
      catch(ex) {
          reject(ex);
      }
  }
  /**
  * Creates a url for the browser test with the command args
  * @function
  */
  function getBrowserUrl(cmdArgs) {
      var port = cmdArgs.serve
      , url = "http://localhost:" + port + "/"
      , querystring = "";

      Object.keys(cmdArgs)
      .filter(function filterArgs(key) {
          return cnsts.skipArgs.indexOf(key) === -1;
      })
      .forEach(function forEachArg(key) {
          var value = cmdArgs[key];
          querystring+= "&" + key;
          if (!isNill(value)) {
              if (isObject(value) || isArray(value)) {
                  value = JSON.stringify(value);
              }
              querystring+= "=" + value;
          }
      });

      querystring = querystring.substring(1);
      if (!!querystring) {
          querystring = "?" + querystring;
      }

      return url + querystring;
  }
  /**
  * Ouputs the test results to the test reporter
  * @function
  */
  function processResults(cmdArgs, results) {
      testReporter.info("* Test Results *");
      testReporter.report("seperator","");

      results.tests.forEach(function (result) {
          testReporter.group();
          printResults(cmdArgs, result);
          testReporter.groupEnd();
      });

      if (cmdArgs.flags.indexOf("a") !== -1 || !results.success) {
          testReporter.report("seperator","");
      }

      testReporter.info("* Success: " + results.success);
      testReporter.info("* Total Tests: " + results.total);
      testReporter.info("* Failed Tests: " + results.failed);

      testReporter.report("seperator","");
      testReporter.info("* End of Results *");
      testReporter.report("seperator","");
  }
  /**
  * Prints the results with the detail set by the a and v options
  * @function
  */
  function printResults(cmdArgs, result) {
      var lvl = cmdArgs.flags.filter(function (op) { return op === "v"; }).length
      , iterations
      ;

      if (cmdArgs.flags.indexOf("a") !== -1 || !result.success) {
          testReporter.info("#" + (result.num) + "(" + (result.success && "passed" || "failed") + ") \"" + result.title + "\"");
          testReporter.group();

          //level 1 Assertions
          if (lvl > 0)  {
              testReporter.report("seperator","");
              testReporter.info("Runtime: " + result.runtimes.total + "ms");
              testReporter.info("Assertions: " + result.assertions);
              //Level 2 Iterations
              if (lvl > 1) {
                  testReporter.info("Iterations: " + result.count);
                  testReporter.info("Failed: " + result.failed);
                  iterations = result.iterations;
              }
              else {
                  iterations = [result.iterations[0]];
              }

              testReporter.report("seperator","");

              testReporter.group("iterations");

              for (var i = 0, l = iterations.length; i < l; i++) {
                  if (lvl > 1) {
                      testReporter.info("Iteration #" + (i + 1));
                      testReporter.group("iteration:" + i);
                      testReporter.report("seperator","");
                      testReporter.info("arrange: " + (iterations[i].runtimes.arrange) + "ms");
                      testReporter.info("act: " + (iterations[i].runtimes.act) + "ms");
                      testReporter.info("assert: " + (iterations[i].runtimes.assert) + "ms");
                      testReporter.report("seperator","");
                  }
                  else {
                      testReporter.group("iteration:" + i);
                  }

                  if (!iterations[i].exception || isEmpty(iterations[i].exception)) {
                      var assertions = iterations[i].assertions;
                      for (var a = 0, al = assertions.length; a < al; a++) {
                          testReporter.group("assertion:" + i);

                          testReporter.info("#" + (a + 1) + " \"" + assertions[a].title + "\"");
                          testReporter.info("Passed: " + assertions[a].pass);
                          if (!assertions[a].pass) {
                            testReporter.info("\"" + ((typeof assertions[a].args[0] === "function") ? "function" : JSON.stringify(assertions[a].args[0])) + "\" " + assertions[a].name + " \"" + assertions[a].args[assertions[a].args.length - 1] + "\"");
                          }
                          if (!!assertions[a].exception) {
                              testReporter.info("");
                              testReporter.info(assertions[a].exception);
                              testReporter.info("");
                          }

                          testReporter.groupEnd("assertion:" + i);

                          if (a !== al - 1) {
                              testReporter.report("seperator","");
                          }
                      }
                  }
                  else {
                      testReporter.error(iterations[i].exception);
                      testReporter.report("seperator","");
                  }

                  if (i !== l - 1) {
                      testReporter.report("seperator","");
                  }

                  testReporter.groupEnd("iteration:" + i);
              }

              testReporter.groupEnd("iterations");
          }

          testReporter.groupEnd();
      }
  }

  /**
  * @worker
  */
  return function Run(cmdArgs) {
    var proc = promise.resolve();

    if (!!cmdArgs.format && cmdArgs.format === "browser") {
        cmdArgs.serve = cmdArgs.serve || 3000;
    }

    testReporter.info("*** Starting the Test Runner ***");
    testReporter.report("seperator","");
    testReporter.group("runner");

    //start the web server
    if (cmdArgs.hasOwnProperty("serve")) {
        //start the test server
        proc = proc.then(function() {
          return new Promise(function (resolve, reject) {
            startServer(resolve, reject, cmdArgs);
          });
        });
    }

    //start the process
    proc = proc.then(function (server) {
        return new promise(function (resolve, reject) {
            start(resolve, reject, cmdArgs, server);
        });
    });

    //output the results
    return proc.then(function (results) {
        testReporter.report("seperator","");
        testReporter.groupEnd("runner");
        testReporter.info("*** Stopping the Test Runner ***");
        promise.resolve(results);
    });
  };
}