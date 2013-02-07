
/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/transition',[
    'scalejs!core'
], function (
    core,
    transition
) {
    

    var // imports
        has = core.object.has,
        enumerable = core.linq.enumerable;

    return function (opts, parentState, context) {
        function events() {
            var evts,
                tokens;

            if (!has(opts, 'event')) {
                return undefined;
            }

            if (opts.event === "*") {
                return [opts.event];
            }

            tokens = opts.event.trim().split(/\s+/);
            evts = enumerable.from(tokens)
                .select(function (event) {
                    // strip .* form the end
                    if (event.indexOf('.*', event.length - 2) >= 0) {
                        return event.indexOf(0, event.length - 2);
                    }

                    return event;
                })
                .filter('$ !== "*"')
                .forEach(function (event) {
                    context.uniqueEvents[event] = true;
                })
                .toArray();

            return evts;
        }

        function condition() {
            return opts.condition;
        }

        function targets() {
            if (has(opts, 'target')) {
                return opts.target.trim().split(/\s+/);
            }
        }

        function action() {
            return opts.action;
        }

        var transition = {
            events: events(),
            condition: condition(),
            source: parentState.id,
            targets: targets(),
            action: action(),
            documentOrder: context.transitions.length,
            id: context.transitions.length
        };

        context.transitions.push(transition);

        return transition;
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/state',[
    'scalejs!core',
    './transition'
], function (
    core,
    transition
) {
    

    var // imports
        has = core.object.has,
        enumerable = core.linq.enumerable,
        array = core.array,
        // vars
        uniqueId = 0,
        stateKinds = {
            BASIC: 0,
            COMPOSITE: 1,
            PARALLEL: 2,
            HISTORY: 3,
            INITIAL: 4,
            FINAL: 5
        };

    return function state(opts, ancestors, context) {
        var self = {};

        function id() {
            var stateId;

            if (has(opts, 'id')) {
                if (context.idToStateMap.hasOwnProperty(opts.id)) {
                    throw {
                        name: 'Illegal Argument',
                        message: 'Duplicate state id `' + opts.id + '`. State id-s must be unique.'
                    };
                }
                stateId = opts.id;
            } else {
                uniqueId += 1;
                stateId = uniqueId;
            }

            context.idToStateMap[stateId] = self;
        }

        function kind() {
            if (has(state, 'states')) {
                return stateKinds.COMPOSITE;
            }

            if (state.parallel) {
                return stateKinds.PARALLEL;
            }

            if (state.history) {
                return stateKinds.HISTORY;
            }

            if (state.initial) {
                return stateKinds.INITIAL;
            }
            if (state.final) {
                return stateKinds.FINAL;
            }

            return stateKinds.BASIC;
        }

        function transitions() {
            if (!has(opts, 'transitions')) {
                return [];
            }

            var transitionIds = enumerable
                .from(opts.transitions)
                .select(function (t) {
                    var trans = transition(t, self, context);
                    return trans.id;
                }).toArray();

            return transitionIds;
        }

        function parent() {
            return ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined;
        }

        function documentOrder() {
            context.states.push(self);

            return context.states.length - 1;
        }

        function basicDocumentOrder() {
            if (self.kind === stateKinds.BASIC ||
                    self.kind === stateKinds.INITIAL ||
                        self.kind === stateKinds.HISTORY) {
                context.basicStates.push(self);

                return context.basicStates.length - 1;
            }
        }

        function children() {
            if (!has(opts, 'states')) {
                return [];
            }

            var states = enumerable
                .from(opts.children)
                .select(function (child) {
                    return state(child, context);
                })
                .toArray();

            return states;
        }

        self.id = id();
        self.kind = kind();
        self.children = children();
        self.transitions = transitions();
        self.onEntry = opts.onEntry;
        self.onExit = opts.onExit;
        self.parent = parent();
        self.documentOrder = documentOrder();
        self.basicDocumentOrder = basicDocumentOrder();
        self.depth = ancestors.length;
        self.ancestors = ancestors.slice();

        //walk back up ancestors and add this state to lists of descendants
        array.iter(ancestors, function (ancestor) {
            context.idToStateMap[ancestor].descendants.push(self.id);
        });

        return self;
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/model',[
    'scalejs!core',
    './state'
], function (
    core,
    state
) {
    

    var // imports
        has = core.object.has,
        enumerable = core.linq.enumerable;

    return function model(spec) {
        // Creation context that tracks everything created while creating the state.
        // It's created once for root state and then is passed to child states/transitions.
        var context = {
                states: [],
                basicStates: [],
                uniqueEvents: {},
                transitions: [],
                idToStateMap: {},
                onFoundStateIdCallbacks: []
            },
            root = state(spec, [], context);

        return {
            root: root
        };
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/statechart',[
    'scalejs!core',
    './model'
], function (
    core,
    stateChartModel
) {
    

    var // imports
        log = core.log.debug,
        array = core.array,
        enumerable = core.linq.enumerable,
        // static
        stateKinds = {
            BASIC: 0,
            COMPOSITE: 1,
            PARALLEL: 2,
            HISTORY: 3,
            INITIAL: 4,
            FINAL: 5
        };

    function getTransitionWithHigherSourceChildPriority() {
        return function (arg) {
            var t1 = arg[0],
                t2 = arg[1];

            //compare transitions based first on depth, then based on document order
            if (t1.source.depth < t2.source.depth) {
                return t2;
            }

            if (t2.source.depth < t1.source.depth) {
                return t1;
            }

            if (t1.documentOrder < t2.documentOrder) {
                return t1;
            }

            return t2;
        };
    }

    function scxmlPrefixTransitionSelector(state, eventNames, evaluator) {
        return array.filter(state.transitions, function (t) {
            return !t.event || (eventNames.indexOf(t.event) > -1 && (!t.cond || evaluator(t)));
        });
    }


    return function create(spec) {
        var model = stateChartModel(spec),
            priorityComparisonFn = getTransitionWithHigherSourceChildPriority(model),
            configuration = [],
            historyValue,
            innerEventQueue,
            isInFinalState = false,
            timeoutMap = {},
            listeners = [],
            printTrace = true,
            actions = [],
            datamodel = {},
            isStepping = false,
            evaluationContext,
            onlySelectFromBasicStates = false,
            logStatesEnteredAndExited = false;

        function isArenaOrthogonal(t1, t2) {
            var t1LCA = t1.targets ? t1.lca : t1.source,
                t2LCA = t2.targets ? t2.lca : t2.source,
                isOrthogonal = model.isOrthogonalTo(t1LCA, t2LCA);

            if (printTrace) {
                log("transition LCAs", t1LCA.id, t2LCA.id);
                log("transition LCAs are orthogonal?", isOrthogonal);
            }

            return isOrthogonal;
        }

        function conflicts(t1, t2) {
            return !isArenaOrthogonal(t1, t2);
        }

        function getInconsistentTransitions(transitions) {
            var allInconsistentTransitions = [],
                inconsistentTransitionsPairs = [],
                i,
                j,
                t1,
                t2,
                consistentTransitions;
                //transitionList = enumerable.from(transitions);

            for (i = 0; i < transitions.length; i += 1) {
                for (j = i + 1; j < transitions.length; j += 1) {
                    t1 = transitions[i];
                    t2 = transitions[j];
                    if (conflicts(t1, t2)) {
                        array.addOne(allInconsistentTransitions, t1);
                        array.addOne(allInconsistentTransitions, t2);
                        array.addOne(inconsistentTransitionsPairs, [t1, t2]);
                    }
                }
            }

            consistentTransitions = transitions.difference(allInconsistentTransitions);
            return [consistentTransitions, inconsistentTransitionsPairs];
        }

        function selectPriorityEnabledTransitions(enabledTransitions) {
            var priorityEnabledTransitions = [],
                tuple = getInconsistentTransitions(enabledTransitions),
                consistentTransitions = tuple[0],
                inconsistentTransitionsPairs = tuple[1];

            priorityEnabledTransitions.union(consistentTransitions);

            if (printTrace) {
                log("enabledTransitions", enabledTransitions);
                log("consistentTransitions", consistentTransitions);
                log("inconsistentTransitionsPairs", inconsistentTransitionsPairs);
                log("priorityEnabledTransitions", priorityEnabledTransitions);
            }

            while (!inconsistentTransitionsPairs.isEmpty()) {
                enabledTransitions = enumerable
                    .from(inconsistentTransitionsPairs)
                    .select(priorityComparisonFn);

                tuple = getInconsistentTransitions(enabledTransitions);
                consistentTransitions = tuple[0];
                inconsistentTransitionsPairs = tuple[1];

                priorityEnabledTransitions.union(consistentTransitions);

                if (printTrace) {
                    log("enabledTransitions", enabledTransitions);
                    log("consistentTransitions", consistentTransitions);
                    log("inconsistentTransitionsPairs", inconsistentTransitionsPairs);
                    log("priorityEnabledTransitions", priorityEnabledTransitions);
                }
            }

            return priorityEnabledTransitions;
        }

        function getOrSetData(fnName, name, value) {
            var data = datamodel[name];
            if (!data) {
                throw new Error("Variable " + name + " not declared in datamodel.");
            }

            return data[fnName](value);
        }

        function getData(name) {
            return getOrSetData('get', name);
        }

        function setData(name, value) {
            return getOrSetData('set', name, value);
        }

        function getScriptingInterface(datamodelForNextStep, eventSet, allowWrite) {
            return {
                setData: allowWrite  ? function (name, value) {
                    datamodelForNextStep[name] = value;
                } : function () {},
                getData: getData,
                events: eventSet
            };
        }

        function selectTransitions(eventSet, datamodelForNextStep) {
            var states,
                n,
                e,
                eventNames,
                usePrefixMatchingAlgorithm,
                transitionSelector,
                enabledTransitions,
                priorityEnabledTransitions;


            if (onlySelectFromBasicStates) {
                states = enumerable.from(configuration);
            } else {
                states = enumerable.from(configuration)
                    .selectMany(function (basicState) {
                        var ancestors = model.getAncestors(basicState);
                        return enumerable.returnValue(basicState).concat(ancestors);
                    });
            }

            n = getScriptingInterface(datamodelForNextStep, eventSet);
            e = function (t) {
                return actions[t.conditionActionRef].call(evaluationContext, n.getData, n.setData, n.events);
            };

            eventNames = enumerable.from(eventSet).select('$.name');

            usePrefixMatchingAlgorithm = eventNames
                .any(function (name) {
                    return name.search(".");
                });

            //transitionSelector = usePrefixMatchingAlgorithm ? scxmlPrefixTransitionSelector : opts.transitionSelector;
            transitionSelector = scxmlPrefixTransitionSelector;

            enabledTransitions = states.selectMany(function (state) {
                return transitionSelector(state, eventNames, e);
            });

            priorityEnabledTransitions = selectPriorityEnabledTransitions(enabledTransitions);

            if (printTrace) {
                log("priorityEnabledTransitions", priorityEnabledTransitions);
            }

            return priorityEnabledTransitions;
        }

        function getStatesExited(transitions) {
            var statesExited = [],
                basicStatesExited = [],
                sortedStatesExited = [];

            array.iter(transitions, function (transition) {
                var lca = transition.lca,
                    desc = lca.descendants;

                array.iter(configuration, function (state) {
                    if (desc.indexOf(state) > -1) {
                        basicStatesExited.add(state);
                        statesExited.add(state);
                        array.iter(model.getAncestors(state, lca), function (anc) {
                            statesExited.add(anc);
                        });
                    }
                });
            });

            sortedStatesExited = enumerable
                .from(statesExited)
                .orderBy('$.depth')
                .toArray();

            return [basicStatesExited, sortedStatesExited];
        }

        function evaluateAction(actionRef, eventSet, datamodelForNextStep, eventsToAddToInnerQueue) {
            function $raise(event) {
                eventsToAddToInnerQueue.add(event);
            }

            var n = getScriptingInterface(datamodelForNextStep, eventSet, true);
            return actions[actionRef].call(evaluationContext, n.getData, n.setData, n.events, $raise);
        }

        function getStatesEntered(transitions) {
            var statesToEnter = [],
                basicStatesToEnter = [],
                statesProcessed  = [],
                statesToProcess = [],
                processState,
                processTransitionSourceAndTarget,
                s,
                sortedStatesEntered;

            processTransitionSourceAndTarget = function (source, target) {
                //process each target
                processState(target);

                //and process ancestors of targets up to LCA, but according to special rules
                var lca = model.getLCA(source, target);
                model.getAncestors(target, lca).forEach(function (s) {
                    if (s.kind === stateKinds.COMPOSITE) {
                        //just add him to statesToEnter, and declare him processed
                        //this is to prevent adding his initial state later on
                        statesToEnter.add(s);

                        statesProcessed.add(s);
                    } else {
                        //everything else can just be passed through as normal
                        processState(s);
                    }
                });
            };

            processState = function (s) {
                if (statesProcessed.contains(s)) {
                    return;
                }

                if (s.kind === stateKinds.HISTORY) {
                    if (historyValue.hasOwnProperty(s.id)) {
                        historyValue[s.id].forEach(function (stateFromHistory) {
                            processTransitionSourceAndTarget(s, stateFromHistory);
                        });
                    } else {
                        statesToEnter.add(s);
                        basicStatesToEnter.add(s);
                    }
                } else {
                    statesToEnter.add(s);

                    if (s.kind === stateKinds.PARALLEL) {
                        statesToProcess.push.apply(statesToProcess,
                            s.children.filter(function (s) {
                                return s.kind !== stateKinds.HISTORY;
                            }));
                    } else if (s.kind === stateKinds.COMPOSITE) {
                        statesToProcess.push(s.initial);
                    } else if (s.kind === stateKinds.INITIAL || s.kind === stateKinds.BASIC || s.kind === stateKinds.FINAL) {
                        basicStatesToEnter.add(s);
                    }
                }

                statesProcessed.add(s);
            };

            //do the initial setup
            transitions.iter().forEach(function (transition) {
                transition.targets.forEach(function (target) {
                    processTransitionSourceAndTarget(transition.source, target);
                });
            });

            //loop and add states until there are no more to add (we reach a stable state)
            while ((s = statesToProcess.pop()) !== undefined) {
                processState(s);
            }

            //sort based on depth
            sortedStatesEntered = statesToEnter.iter().sort(function (s1, s2) {
                return s1.depth - s2.depth;
            });

            return [basicStatesToEnter, sortedStatesEntered];
        }

        function performSmallStep(eventSet, datamodelForNextStep) {
            var selectedTransitions,
                selectedTransitionsWithTargets,
                exitedTuple,
                basicStatesExited,
                statesExited,
                enteredTuple,
                basicStatesEntered,
                statesEntered,
                eventsToAddToInnerQueue,
                sortedTransitions,
                key;

            if (printTrace) {
                log("selecting transitions with eventSet: ", eventSet);
            }

            selectedTransitions = selectTransitions(eventSet, datamodelForNextStep);

            if (printTrace) {
                log("selected transitions: ", selectedTransitions);
            }

            if (!selectedTransitions.isEmpty()) {
                if (printTrace) {
                    log("sorted transitions: ", selectedTransitions);
                }

                //we only want to enter and exit states from transitions with targets
                //filter out targetless transitions here - we will only use these to execute transition actions
                selectedTransitionsWithTargets = enumerable
                    .from(selectedTransitions)
                    .where('$.targets');

                exitedTuple = getStatesExited(selectedTransitionsWithTargets);
                basicStatesExited = exitedTuple[0];
                statesExited = exitedTuple[1];

                enteredTuple = getStatesEntered(selectedTransitionsWithTargets);
                basicStatesEntered = enteredTuple[0];
                statesEntered = enteredTuple[1];

                if (printTrace) {
                    log("basicStatesExited ", basicStatesExited);
                    log("basicStatesEntered ", basicStatesEntered);
                    log("statesExited ", statesExited);
                    log("statesEntered ", statesEntered);
                }

                eventsToAddToInnerQueue = [];

                //update history states
                if (printTrace) {
                    log("executing state exit actions");
                }

                array.iter(statesExited, function (state) {
                    if (printTrace || logStatesEnteredAndExited) {
                        log("exiting ", state.id);
                    }

                    //invoke listeners
                    array.iter(listeners, function (l) {
                        if (l.onExit) {
                            l.onExit(state.id);
                        }
                    });

                    if (state.onexit !== undefined) {
                        evaluateAction(state.onexit, eventSet, datamodelForNextStep, eventsToAddToInnerQueue);
                    }

                    var f;
                    if (state.history) {
                        if (state.history.isDeep) {
                            f = function (s0) {
                                return s0.kind === stateKinds.BASIC && state.descendants.indexOf(s0) > -1;
                            };
                        } else {
                            f = function (s0) {
                                return s0.parent === state;
                            };
                        }
                        //update history
                        historyValue[state.history.id] = statesExited.filter(f);
                    }
                });


                // -> Concurrency: Number of transitions: Multiple
                // -> Concurrency: Order of transitions: Explicitly defined
                sortedTransitions = selectedTransitions.iter().sort(function (t1, t2) {
                    return t1.documentOrder - t2.documentOrder;
                });

                if (printTrace) {
                    log("executing transitition actions");
                }


                sortedTransitions.forEach(function (transition) {
                    var targetIds = transition.targets && enumerable.from(transition.targets).select('$.id').toArray();

                    array.iter(listeners, function (l) {
                        if (l.onTransition) {
                            l.onTransition(transition.source.id, targetIds);
                        }
                    });

                    if (transition.actions !== undefined) {
                        evaluateAction(transition.actions, eventSet, datamodelForNextStep, eventsToAddToInnerQueue);
                    }
                });

                if (printTrace) {
                    log("executing state enter actions");
                }

                array.iter(statesEntered, function (state) {
                    if (printTrace || this.opts.logStatesEnteredAndExited) {
                        log("entering", state.id);
                    }

                    array.iter(listeners, function (l) {
                        if (l.onEntry) {
                            l.onEntry(state.id);
                        }
                    });

                    if (state.onentry !== undefined) {
                        evaluateAction(state.onentry, eventSet, datamodelForNextStep, eventsToAddToInnerQueue);
                    }
                });

                if (printTrace) {
                    log("updating configuration ");
                    log("old configuration ", configuration);
                }

                //update configuration by removing basic states exited, and adding basic states entered
                configuration.difference(basicStatesExited);
                configuration.union(basicStatesEntered);

                if (printTrace) {
                    log("new configuration ", configuration);
                }

                //add set of generated events to the innerEventQueue -> Event Lifelines: Next small-step
                if (!eventsToAddToInnerQueue.isEmpty()) {
                    if (printTrace) {
                        log("adding triggered events to inner queue ", eventsToAddToInnerQueue);
                    }
                    innerEventQueue.push(eventsToAddToInnerQueue);
                }

                if (printTrace) {
                    log("updating datamodel for next small step :");
                }

                //update the datamodel
                for (key in datamodelForNextStep) {
                    if (datamodelForNextStep.hasOwnProperty(key)) {
                        setData(key, datamodelForNextStep[key]);
                    }
                }
            }

            // if selectedTransitions is empty, we have reached a stable state, 
            // and the big-step will stop, otherwise will continue -> Maximality: Take-Many
            return selectedTransitions;
        }

        function performBigStep(e) {
            if (e) {
                innerEventQueue.push([e]);
            }

            var keepGoing = true,
                eventSet,
                datamodelForNextStep,
                selectedTransitions;

            while (keepGoing) {
                eventSet = innerEventQueue.length > 0 ? innerEventQueue.shift() : [];

                //create new datamodel cache for the next small step
                datamodelForNextStep = {};
                selectedTransitions = performSmallStep(eventSet, datamodelForNextStep);
                keepGoing = !selectedTransitions.isEmpty();
            }

            isInFinalState = configuration.iter().every(function (s) {
                return s.kind === stateKinds.FINAL;
            });
        }

        function getConfiguration() {
            return enumerable.from(configuration).select('$.id').toArray();
        }

        function gen(evtObjOrName, optionalData) {
            var e;

            switch (typeof evtObjOrName) {
            case 'string':
                e = {name : evtObjOrName, data : optionalData};
                break;
            case 'object':
                if (typeof evtObjOrName.name === 'string') {
                    e = evtObjOrName;
                } else {
                    throw new Error('Event object must have "name" property of type string.');
                }
                break;
            default:
                throw new Error('First argument to gen must be a string or object.');
            }

            if (isStepping) {
                throw new Error('gen called before previous call to gen could complete. ' +
                                'If executed in single-threaded environment, this means it was called recursively,' +
                                'which is illegal, as it would break SCION step semantics.');
            }

            isStepping = true;
            performBigStep(e);
            isStepping = false;
            return getConfiguration();
        }

        function send(event, options) {
            var callback, timeoutId;

            if (setTimeout) {
                if (printTrace) {
                    log("sending event", event.name, "with content", event.data, "after delay", options.delay);
                }
                callback = function () {
                    return gen(event);
                };
                timeoutId = setTimeout(callback, options.delay);
                if (options.sendid) {
                    timeoutMap[options.sendid] = timeoutId;
                }
            } else {
                throw new Error("setTimeout function not set");
            }
        }

        function cancel(sendid) {
            if (clearTimeout) {
                if (timeoutMap.hasOwnProperty(sendid)) {
                    if (printTrace) {
                        log("cancelling ", sendid, " with timeout id ", timeoutMap[sendid]);
                    }
                    return clearTimeout(timeoutMap[sendid]);
                }
            } else {
                throw new Error("clearTimeout function not set");
            }
        }

        function start() {
            //perform big step without events to take all default transitions and reach stable initial state
            if (printTrace) {
                log("performing initial big step");
            }

            configuration.add(model.root.initial);

            actions = [];
            datamodel = {};

            performBigStep();

            return getConfiguration();
        }


        return {
            start: start,
            send: send,
            cancel: cancel
        };
    };
});


/*global define*/
define('scalejs.statechart',[
    'scalejs!core',
    './scalejs.statechart/statechart'
], function (
    core,
    statechart
) {
    

    core.registerExtension({ statechart: statechart });
});


