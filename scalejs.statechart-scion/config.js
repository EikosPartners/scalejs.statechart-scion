var require = {
    "paths":  {
        "es5-shim":  "Scripts/es5-shim",
        "json2":  "Scripts/json2",
        "linqjs":  "Scripts/linq.min",
        "scalejs":  "Scripts/scalejs-0.2.4",
        "scalejs.linq-linqjs":  "Scripts/scalejs.linq-linqjs-3.0.3",
        "scion":  "empty:"
    },
    "scalejs":  {
        "extensions":  [
            "scalejs.linq-linqjs"
        ]
    },
    "shim":  {
        "scalejs.statechart-scion":  {
            "deps":  [
                "scalejs.linq-linqjs"
            ]
        }
    }
};
