var require = {
    "baseUrl":  ".",
    "paths":  {
        "es5-shim":  "Scripts/es5-shim",
        "jasmine":  "Scripts/jasmine",
        "jasmine-html":  "Scripts/jasmine-html",
        "json2":  "Scripts/json2",
        "linqjs":  "Scripts/linq.min",
        "scalejs":  "Scripts/scalejs-0.3.0.1",
        "scalejs.functional":  "Scripts/scalejs.functional-0.2.9.8",
        "scalejs.linq-linqjs":  "Scripts/scalejs.linq-linqjs-3.0.3",
        "scalejs.statechart-scion":  "Scripts/scalejs.statechart-scion-0.3.0.0",
        "scion":  "Scripts/scion"
    },
    "scalejs":  {
        "extensions":  [
            "scalejs.functional",
            "scalejs.functional",
            "scalejs.linq-linqjs",
            "scalejs.linq-linqjs",
            "scalejs.statechart-scion",
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
