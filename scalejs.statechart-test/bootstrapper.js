/*global require*/
/// <reference path="Scripts/require.js"/>
/// <reference path="Scripts/jasmine.js"/>
require({
    "paths":  {
        "jasmine":  "Scripts/jasmine",
        "jasmine-html":  "Scripts/jasmine-html",
        "linq":  "Scripts/linq",
        "scalejs":  "Scripts/scalejs-0.2.3",
        "scalejs.linq":  "Scripts/scalejs.linq-0.2.0",
        "scalejs.statechart":  "../scalejs.statechart/scalejs.statechart"
    },
    "scalejs":  {
        "extensions":  [
            "scalejs.linq",
            "scalejs.statechart"
        ]
    },
    "shim":  {
        "jasmine":  {
            "exports":  "jasmine"
        },
        "jasmine-html":  {
            "deps":  [
                "jasmine"
            ],
            "exports":  "jasmine"
        },
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
