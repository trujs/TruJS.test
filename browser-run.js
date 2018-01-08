/**[@naming({ "skip": true })]*/
//a simple script to get the querystring vals as a collection
var qs = location.search.substring(1), vals = {};
qs.split('&').forEach(function (val, indx, arr) {
    var nv = val.split('=');
    vals[nv[0]] = nv[1];
});

//create the progress bar
var progress =
    TruJSTest('.progressBar')({ target: 'body' })
    .show()
    .update('Starting', 0)
;

var testCount = TruJSTest('.testPackage').count, curTest, perc;

//tell the server we're starting
TruJSTest(".httpRequest")({
    "url": "/Starting"
    , "method": "POST"
    , "data": {
        "count": testCount
    }
});

//setup the report listener
TruJSTest('.testReporter').setLevels("all");
TruJSTest('.testReporter').addHandler(function (entry, type) {
    //if this is a test then store the test
    if (type === 'end-test') {
        curTest = entry;
        perc = (curTest.index + 1) / testCount;
        perc = perc * 100;
        //tell the server what percent we're at
        TruJSTest(".httpRequest")({
            "url": "/Running"
            , "method": "POST"
            , "data": {
                "percent": perc
                , "title": curTest.title
            }
        });
    }
    else if (type === 'start-test') {
        curTest = entry;
    }
    else if (type === 'end-iteration') {
        progress.update((curTest.index + 1) + ':' + curTest.title + ' (' + (entry.iteration + 1) + ')', perc);
    }
    else if (type === 'finished') {
        progress.update('Finalizing', 100);
    }
});

//run the tests
TruJSTest('.testPackage')
    .resolve()
    .run({
        "iterations": vals['iterations'] || undefined
        , "testNums": !!vals['testNums'] && vals['testNums'].split(',') || undefined
        , "prime": vals['prime'] !== 'false'
    })
    .then(function (results) {
        //remove the progress bar
        progress.destroy();
        //display the results
        TruJSTest('.resultGrid')
            ({ results: results, target: 'body' })
            .show();

        //deliver the results
        TruJSTest(".httpRequest")({
            "url": "/Results"
            , "method": "POST"
            , "data": results
        });

        //start the run listner loop
        if (vals.hasOwnProperty("watch")) {
            runListener();
        }
    });

//a interval loop the calls the server to see if it should run again
function runListener() {
    var delay = 1000;
    setTimeout(check, delay);
    function check() {
        TruJSTest(".httpRequest")({
            "url": "/Run"
            , "method": "GET"
            , "cb": function (err, data) {
                err !== null && (delay = 10000) || (delay = 1000);
                if (err === null || vals.hasOwnProperty("persist")) {
                    if (!!data && data.run) {
                        location.reload();
                    }
                    else {
                        setTimeout(check, delay);
                    }
                }
            }
        });
    }
}