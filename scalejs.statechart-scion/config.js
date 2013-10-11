var require = {
    "paths":  {
        "scalejs":  "Scripts/scalejs-0.3.0.1",
        "scalejs.functional":  "empty:",
        "scalejs.linq-linqjs":  "empty:",
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
