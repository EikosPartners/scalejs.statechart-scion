var require = {
    "baseUrl":  ".",
    "paths":  {
        "es5-shim":  "Scripts/es5-shim",
        "jasmine":  "Scripts/jasmine",
        "jasmine-html":  "Scripts/jasmine-html",
        "json2":  "Scripts/json2",
        "linqjs":  "Scripts/linq.min",
        "scalejs":  "Scripts/scalejs-0.2.7.9",
        "scalejs.linq-linqjs":  "Scripts/scalejs.linq-linqjs-3.0.3",
        "scalejs.statechart-scion":  "Scripts/scalejs.statechart-scion-0.2.1.16",
        "scion":  "Scripts/scion"
    },
    "scalejs":  {
        "extensions":  [
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
                "scalejs.linq-linqjs"
            ]
        }
    }
};
