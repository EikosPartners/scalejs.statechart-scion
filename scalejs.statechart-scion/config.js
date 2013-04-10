var require = {
    "paths":  {
        "scalejs":  "Scripts/scalejs-0.2.4",
        "scalejs.linq-linqjs":  "empty:",
        "scion":  "empty:",
        "scalejs.functional": "empty:"
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
