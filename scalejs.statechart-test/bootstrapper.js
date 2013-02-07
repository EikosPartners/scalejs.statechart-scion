/*global require*/
/// <reference path="Scripts/require.js"/>
/// <reference path="Scripts/jasmine.js"/>
require({
    "paths":  {
        "jasmine": "Scripts/jasmine",
        "jasmine-html" : "Scripts/jasmine-html",
        "linq":  "Scripts/linq",
        "scalejs":  "Scripts/scalejs-0.2.0",
        "scalejs.linq":  "Scripts/scalejs.linq-0.2.0",
        "scalejs.statechart":  "../scalejs.statechart/build/scalejs.statechart-0.2.0"
    },
    "scalejs":  {
        "extensions":  [
            "scalejs.linq",
            "scalejs.statechart"
        ]
    },
    "shim":  {
        "linq":  {
            "exports":  "Enumerable"
        },
        "scalejs.statechart":  {
            "deps":  [
                "scalejs.linq"
            ]
        },
        "jasmine": {
            "exports": "jasmine"
        },
        'jasmine-html': {
            deps: ['jasmine'],
            exports: 'jasmine'
        }
    }
}, ['tests/all.tests']);
