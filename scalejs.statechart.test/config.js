var require = {
    "baseUrl":  ".",
    "paths":  {
        "es5-shim":  "Scripts/es5-shim",
        "jasmine":  "Scripts/jasmine",
        "jasmine-html":  "Scripts/jasmine-html",
        "linqjs":  "Scripts/linq.min",
        "scalejs":  "Scripts/scalejs-0.2.6.1",
        "scalejs.linq-linqjs":  "Scripts/scalejs.linq-linqjs-3.0.3",
        "scalejs.statechart":  "Scripts/scalejs.statechart-0.2.1"
    },
    "scalejs":  {
        "extensions":  [
            "scalejs.linq-linqjs",
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
            ]
        },
        "scalejs.statechart":  {
            "deps":  [
                "scalejs.linq-linqjs"
            ]
        }
    }
};
