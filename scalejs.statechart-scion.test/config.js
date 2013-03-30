var require = {
    "baseUrl":  ".",
    "paths":  {
        "es5-shim":  "Scripts/es5-shim",
        "jasmine":  "Scripts/jasmine",
        "jasmine-html":  "Scripts/jasmine-html",
        "json2":  "Scripts/json2",
        "linqjs":  "Scripts/linq.min",
        "scalejs":  "Scripts/scalejs-0.2.7.29",
        "scalejs.functional":  "Scripts/scalejs.functional-0.2.0",
        "scalejs.linq-linqjs":  "Scripts/scalejs.linq-linqjs-3.0.3",
        "scalejs.statechart-scion":  "Scripts/scalejs.statechart-scion-0.2.1.28",
        "scion":  "Scripts/scion"
    },
    "scalejs":  {
        "extensions":  [
            "scalejs.functional",
            "scalejs.linq-linqjs",
            "scalejs.statechart-scion"
        ]
    },
    "shim":  {
        "jasmine":  {
            "exports":  "jasmine"
        },
        "jasmine-html":  {
            "deps":  [
                "jasmine"
            ]
        },
        "scalejs.statechart-scion":  {
            "deps":  [
                "scalejs.linq-linqjs",
                "scalejs.functional"
            ]
        }
    }
};
