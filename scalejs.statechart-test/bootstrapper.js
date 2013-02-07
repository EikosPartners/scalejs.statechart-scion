/*global require*/
/// <reference path="Scripts/require.js"/>
/// <reference path="Scripts/jasmine.js"/>
require({
    "paths":  {
        "linq":  "Scripts/linq",
        "scalejs":  "Scripts/scalejs-0.2.0",
        "scalejs.linq":  "Scripts/scalejs.linq-0.2.0",
        "scalejs.statechart":  "Scripts/scalejs.statechart-0.2.0"
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
        }
    }
}, ['tests/all.tests']);
