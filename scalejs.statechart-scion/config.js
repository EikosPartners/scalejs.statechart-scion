var require = {
    "paths":  {
        "sandbox":  "Scripts/scalejs.sandbox",
        "scalejs":  "Scripts/scalejs-0.3.3",
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
