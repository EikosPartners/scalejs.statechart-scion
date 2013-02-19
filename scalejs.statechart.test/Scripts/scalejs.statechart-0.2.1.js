
/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/stateKinds',{
    BASIC: 0,
    COMPOSITE: 1,
    PARALLEL: 2,
    HISTORY: 3,
    INITIAL: 4,
    FINAL: 5
});

/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/model',[
    'scalejs!core',
    './stateKinds'
], function (
    core,
    stateKinds
) {
    

    var // imports
        enumerable = core.linq.enumerable;

    function getAncestors(state, root) {
        var index;

        index = state.ancestors.indexOf(root);
        if (index > -1) {
            // SCION doesn't include root - not sure if it's correct
            // (this seems to fail more-parallel tests)
            return state.ancestors.slice(0, index + 1);
        }
        return state.ancestors;
    }

    function getAncestorsOrSelf(state, root) {
        return [state].concat(getAncestors(state, root));
    }

    function isAncestrallyRelatedTo(s1, s2) {
        //Two control states are ancestrally related if one is child/grandchild of another.
        return getAncestorsOrSelf(s2).indexOf(s1) > -1 ||
                getAncestorsOrSelf(s1).indexOf(s2) > -1;
    }

    function getLCA(s1, s2) {
        var lca = enumerable
            .from(getAncestors(s1))
            .firstOrDefault(null, function (a) {
                return a.descendants.indexOf(s2) > -1;
            });

        return lca;
    }

    function isOrthogonalTo(s1, s2) {
        //Two control states are orthogonal if they are not ancestrally
        //related, and their smallest, mutual parent is a Concurrent-state.
        return !isAncestrallyRelatedTo(s1, s2) &&
                getLCA(s1, s2).kind === stateKinds.PARALLEL;
    }

    function isArenaOrthogonal(t1, t2) {
        var t1LCA = t1.targets ? t1.lca : t1.source,
            t2LCA = t2.targets ? t2.lca : t2.source,
            isOrthogonal = isOrthogonalTo(t1LCA, t2LCA);

        return isOrthogonal;
    }

    function getTransitionWithHigherSourceChildPriority(arg) {
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
    }

    return {
        getLCA: getLCA,
        getAncestors: getAncestors,
        getAncestorsOrSelf: getAncestorsOrSelf,
        isArenaOrthogonal: isArenaOrthogonal,
        getTransitionWithHigherSourceChildPriority: getTransitionWithHigherSourceChildPriority
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/transition',[
    'scalejs!core'
], function (
    core
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
                        return event.substring(0, event.length - 2);
                    }

                    return event;
                })
                .where('$ !== "*"')
                .doAction(function (event) {
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

            return [];
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
    './stateKinds',
    './transition'
], function (
    core,
    stateKinds,
    transition
) {
    

    var // imports
        has = core.object.has,
        enumerable = core.linq.enumerable,
        array = core.array;

    return function state(spec, ancestorIds, context) {
        var self = {
            onEntry: spec.onEntry,
            onExit: spec.onExit,
            depth: ancestorIds.length,
            ancestorIds: array.copy(ancestorIds),
            descendantIds: [],
            childrenIds: [],
            transitionIds: []
        };

        function genId(group) {
            if (ancestorIds.length === 0) {
                return 'root';
            }

            var latestId = context.uniqueIds[group] || 0,
                nextId = latestId + 1,
                id = group + '_' + nextId;

            context.uniqueIds[group] = nextId;

            return id;
        }

        function parentId() {
            self.parentId = ancestorIds.length > 0 ? ancestorIds[ancestorIds.length - 1] : undefined;
        }

        function id() {
            if (has(spec, 'id')) {
                if (context.idToStateMap.hasOwnProperty(spec.id)) {
                    throw {
                        name: 'Illegal Argument',
                        message: 'Duplicate state id `' + spec.id + '`. State id-s must be unique.'
                    };
                }
                self.id = spec.id;
            } else {
                self.id = genId(spec.initial === true ? 'initial' : 'state');
            }

            context.idToStateMap[self.id] = self;
        }

        function kind() {
            var parentState;
            if (spec.parallel) {
                self.kind = stateKinds.PARALLEL;
                return;
            }

            if (has(spec, 'states')) {
                self.kind = stateKinds.COMPOSITE;
                return;
            }

            if (spec.history) {
                self.kind = stateKinds.HISTORY;
                return;
            }

            // spec.initial maybe a boolean indicating the state is initial on the parent,
            // or a string indicating an id of the child state that should be initial
            // Therefore state is initial only if the flag is boolean and is true
            if (spec.initial === true) {
                parentState = context.idToStateMap[self.parentId];
                // set this state as parent's initial
                if (has(parentState, 'initial')) {
                    throw new Error('Duplicate initial states in state "' + self.id + '".');
                }

                if (parentState) {
                    parentState.initialId = self.id;
                }

                self.kind = stateKinds.INITIAL;
                return;
            }

            if (spec.final) {
                self.kind = stateKinds.FINAL;
                return;
            }

            self.kind = stateKinds.BASIC;
        }

        function children() {
            if (!has(spec, 'states')) {
                return;
            }

            var nextAncestorIds = ancestorIds.concat(self.id),
                stateIds = spec.states.map(function (child) {
                    var st = state(child, nextAncestorIds, context);
                    return st.id;
                });

            self.childrenIds = stateIds;
        }

        function transitions() {
            if (!has(spec, 'transitions')) {
                return;
            }

            var transitionIds = enumerable
                .from(spec.transitions)
                .select(function (t) {
                    var trans = transition(t, self, context);
                    return trans.id;
                }).toArray();

            self.transitionIds = transitionIds;
        }

        function documentOrder() {
            context.states.push(self);

            self.documentOrder = context.states.length - 1;
        }

        function basicDocumentOrder() {
            if (self.kind === stateKinds.BASIC ||
                    self.kind === stateKinds.INITIAL ||
                        self.kind === stateKinds.HISTORY) {
                context.basicStates.push(self);

                self.basicDocumentOrder = context.basicStates.length - 1;
            }
        }

        function initial() {
            var generatedInitial,
                generatedInitialId;

            // parallel states and states with no children don't have initial.
            if (self.kind === stateKinds.PARALLEL || self.childrenIds.length === 0) {
                return;
            }

            // initialId could've been set by one of the children (marked with initial:true)
            // or it can be specified in spec
            // otherwise first child is default initial
            generatedInitialId = self.initialId || spec.initial || self.childrenIds[0];
            // Generate initial state that would transit to initial state right away.
            // This way we make sure initial state's onEntry is executed.
            generatedInitial = state({
                initial: true,
                transitions: [{
                    target: generatedInitialId
                }]
            }, ancestorIds.concat(self.id), context);

            self.childrenIds.push(generatedInitial.id);
            self.initialId = generatedInitial.id;
        }

        function descendants() {
            ancestorIds.forEach(function (ancestor) {
                context.idToStateMap[ancestor].descendantIds.push(self.id);
            });
        }

        id();
        parentId();
        kind();
        children();
        transitions();
        initial();
        documentOrder();
        basicDocumentOrder();
        /*
        self.id = id();
        self.kind = kind();
        self.descendants = [];
        self.children = children();
        self.transitions = transitions();
        self.initial = initial();
        self.onEntry = spec.onEntry;
        self.onExit = spec.onExit;
        self.parent = parent();
        self.documentOrder = documentOrder();
        self.basicDocumentOrder = basicDocumentOrder();
        self.depth = ancestors.length;
        self.ancestors = ancestors.slice();
        */
        //walk back up ancestors and add this state to lists of descendants
        descendants();

        return self;
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/builder',[
    'scalejs!core'
], function (
    core
) {
    

    var // imports
        is = core.type.is,
        has = core.object.has,
        //merge = core.object.merge,
        array = core.array;

    function stateBuilder(state) {
        var builder;

        function onEntry(f) {
            if (has(state, 'onEntry')) {
                throw new Error('Only one `onEntry` action is allowed.');
            }

            if (!is(f, 'function')) {
                throw new Error('`onEntry` takes a function as a parameter.');
            }

            state.onEntry = f;

            return builder;
        }

        function onExit(f) {
            if (has(state, 'onExit')) {
                throw new Error('Only one `onExit` action is allowed.');
            }

            if (!is(f, 'function')) {
                throw new Error('`onExit` takes a function as a parameter.');
            }

            state.onExit = f;

            return builder;
        }

        function startTransition() {
            var transition = {};

            if (!has(state, 'transitions')) {
                state.transitions = [];
            }
            state.transitions.push(transition);

            return transition;
        }

        function transitionGoto(transition, stateOrAction, action) {
            if (!transition) {
                throw new Error('`transition` is undefined.');
            }

            if (is(stateOrAction, 'string')) {
                transition.target = stateOrAction;
                if (has(action)) {
                    if (!is(action, 'function')) {
                        throw new Error('`action` must be an action.');
                    }
                    transition.action = action;
                }

                return builder;
            }

            if (is(stateOrAction, 'function')) {
                if (has(action)) {
                    throw new Error('`goto` parameters should be either target id(s) or action function or both.');
                }
                transition.action = stateOrAction;

                return builder;
            }

            throw new Error('`goto` parameters should be either target id(s) or action function or both.');
        }

        function goto(stateOrAction, action) {
            return transitionGoto(startTransition(), stateOrAction, action);
        }


        function on(eventOrCondition, condition) {
            var transition = startTransition(),
                transitionBuilder = {
                    doNothing: builder,
                    goto: function (stateOrAction, action) {
                        return transitionGoto(transition, stateOrAction, action);
                    }
                };

            if (is(eventOrCondition, 'string')) {
                transition.event = eventOrCondition;
                if (has(condition)) {
                    if (!is(condition, 'function')) {
                        throw new Error('`condition` must be a function.');
                    }
                    transition.condition = condition;
                }

                return transitionBuilder;
            }

            if (is(eventOrCondition, 'function')) {
                if (has(condition)) {
                    throw new Error('`on` parameters should be either an event name or condition function or both.');
                }
                transition.condition = eventOrCondition;

                return transitionBuilder;
            }

            throw new Error('`on` parameters should be either an event name or condition function or both.');
        }

        function toSpec() {
            return state;
        }

        builder = {
            isBuilder: true,
            onEntry: onEntry,
            onExit: onExit,
            on: on,
            goto: goto,
            toSpec: toSpec
        };

        return builder;
    }

    function withState(s, opts) {
        var builderArgsStart = 1;

        if (arguments.length > 1) {
            if (!opts.isBuilder) {
                builderArgsStart = 2;
                if (opts.initial) {
                    if (s.parallel) {
                        return new Error('`initial` shouldn\'t be specified on parallel region.');
                    }
                    s.initial = opts.initial;
                }
                if (opts.parallel) {
                    s.parallel = opts.parallel;
                }
            }

            if (arguments.length > builderArgsStart) {
                s.states = array.toArray(arguments).slice(builderArgsStart).map(function (sb) {
                    return sb.toSpec();
                });
            }
        }

        return stateBuilder(s);
    }

    function state(id) {
        // if first argument is a string then it's an id
        if (is(id, 'string')) {
            return withState.apply(null, [{id: id}].concat(array.toArray(arguments, 1)));
        }
        // otherwise it's a builder (e.g. state being created doesn't have an id)
        return withState.apply(null, [{}].concat(array.toArray(arguments)));
    }

    function parallel(id) {
        // if first argument is a string then it's an id
        if (is(id, 'string')) {
            return withState.apply(null, [{id: id, parallel: true}].concat(array.toArray(arguments, 1)));
        }
        // otherwise it's a builder (e.g. state being created doesn't have an id)
        return withState.apply(null, [{parallel: true}].concat(array.toArray(arguments)));
    }

    return {
        state: state,
        parallel: parallel
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/factory',[
    'scalejs!core',
    './model',
    './state',
    './builder'
], function (
    core,
    model,
    state,
    builder
) {
    

    var has = core.object.has;

    return function factory() {
        var context,
            spec,
            root;

        function stateById(stateId) {
            return context.idToStateMap[stateId];
        }

        function resolveStates() {
            context.states.forEach(function (s) {
                s.ancestorIds.reverse();
                s.descendantIds.reverse();
                // resolve states
                s.initial = stateById(s.initialId);
                s.history = stateById(s.history);
                s.children = s.childrenIds.map(stateById);
                s.parent = stateById(s.parentId);
                s.ancestors = s.ancestorIds.map(stateById);
                s.descendants = s.descendantIds.map(stateById);
                s.transitions = s.transitionIds.map(function (t) { return context.transitions[t]; });
            });
        }

        function resolveTransitions() {
            context.transitions.forEach(function (t) {
                t.source = stateById(t.source);
                t.targets = t.targets.map(function (targetId) {
                    var target = stateById(targetId);
                    if (!has(target)) {
                        throw new Error('Transition targets state "' + targetId + '" but such state doesn\'t exist.');
                    }
                    return target;
                });

                if (t.targets.length > 0) {
                    t.lca = model.getLCA(t.source, t.targets[0]);
                }
            });
        }

        function createSpec(specOrBuilder) {
            if (arguments.length === 1 && !specOrBuilder.isBuilder) {
                return specOrBuilder;
            }

            var scb = builder.state.apply(null, ['root'].concat(Array.prototype.slice.call(arguments, 0)));

            return scb.toSpec();
        }

        function create() {
            context  = {
                states: [],
                basicStates: [],
                uniqueEvents: {},
                transitions: [],
                idToStateMap: {},
                onFoundStateIdCallbacks: [],
                uniqueIds: {}
            };

            spec = createSpec.apply(null, arguments);
            root = state(spec, [], context);

            resolveStates();
            resolveTransitions();

            return root;
        }

        function getRoot() {
            return root;
        }

        function getSpec() {
            return spec;
        }

        function getStates() {
            return context.states;
        }

        function getTransitions() {
            return context.transitions;
        }

        return {
            create: create,
            getRoot: getRoot,
            getSpec: getSpec,
            getStates: getStates,
            getTransitions: getTransitions
        };
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/eventRaiser',[
    'scalejs!core'
], function (
    core
) {
    

    var // imports
        has = core.object.has,
        get = core.object.get,
        is = core.type.is,
        log = core.log.debug;

    return function eventRaiser(raiseEvent, opts) {
        function create(eventName, data) {
            if (!is(eventName, 'string')) {
                throw {
                    name: 'Illegal Argument',
                    message: '`eventName` must be a string.'
                };
            }

            return {name : eventName, data : data};
        }

        function doRaise(eventName, data, delay, raiser) {
            var event = create(eventName, data);

            if (get(opts, 'printTrace')) {
                log('raising event ' + event.name + ' with content', event.data, 'after delay ', delay);
            }

            if (has(delay)) {
                setTimeout(function () {
                    raiser(event);
                }, delay);
            } else {
                raiser(event);
            }
        }

        function raise(eventName, dataOrDelay, delay, raiser) {
            if (is(dataOrDelay, 'number')) {
                doRaise(eventName, {}, dataOrDelay, raiser);
                return;
            }

            if (!has(dataOrDelay) || is(dataOrDelay, 'object')) {
                doRaise(eventName, dataOrDelay, delay, raiser);
                return;
            }

            throw new Error('`dataOrDelay` must be either a number indicating the delay or an event data object.');
        }

        return function (eventName, dataOrDelay, delay) {
            raise(eventName, dataOrDelay, delay, raiseEvent);
        };
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/runtime',[
    'scalejs!core',
    './eventRaiser'
], function (
    core,
    eventRaiser
) {
    

    var // imports
        has = core.object.has,
        get = core.object.get,
        array = core.array,
        log = core.log.debug,
        merge = core.object.merge,
        clone = core.object.clone;

    return function runtime(opts) {
        var datamodel = {},
            currentSmallStepSnapshot = {};

        function createActionContext(eventsToAddToInnerQueue) {
            function raiseEvent(event) {
                // if eventsToAddToInnerQueue is not defined it means raiseEvent is called
                // from transitionEvaluator. This is not allowed. 
                if (!has(eventsToAddToInnerQueue)) {
                    throw {
                        name: 'Illegal Operation',
                        message: 'Raising events is not allowed in transition conditions.'
                    };
                }
                array.addOne(eventsToAddToInnerQueue, event);
            }

            function inAny() {
                var states =  Array.prototype.slice.call(arguments, 0);
                return opts.getFullConfiguration().some(function (c) {
                    return states.some(function (s) { return s === c; });
                });
            }

            // The default context (e.g. `this`) is current small step snapshot (e.g. non-commited data).
            // If action needs access to big step data (e.g. commited data) it should do via bigstep property.
            return merge(currentSmallStepSnapshot, {
                bigstep: clone(datamodel),
                raise: eventRaiser(raiseEvent),
                inState: inAny
            });
        }

        function runAction(stateId, actionName, action, eventSet, eventsToAddToInnerQueue) {
            if (get(opts, 'printTrace')) {
                log('Running action ' + stateId + '.' + actionName);
            }

            var actionContext = createActionContext(eventsToAddToInnerQueue),
                result = action.call(actionContext, eventSet);

            delete actionContext.raise;
            delete actionContext.bigstep;

            currentSmallStepSnapshot = actionContext;
            //datamodel = actionContext;

            if (get(opts, 'printTrace')) {
                log('Finished action ' + stateId + '.' + actionName);
            }

            return result;
        }

        function transitionConditionEvaluator(eventSet) {
            var actionContext = createActionContext();

            return function (transition) {
                if (transition.condition) {
                    return transition.condition.call(actionContext, eventSet);
                }
            };
        }

        function beginSmallStep() {
            currentSmallStepSnapshot = clone(datamodel);
        }

        function endSmallStep() {
            datamodel = currentSmallStepSnapshot;
        }

        return {
            beginSmallStep: beginSmallStep,
            endSmallStep: endSmallStep,
            runAction: runAction,
            transitionConditionEvaluator: transitionConditionEvaluator
        };
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/transitionSelector',[
    'scalejs!core'
], function (
    core
) {
    

    var enumerable = core.linq.enumerable;

    return function transitionSelector() {
        var eventNameReCache = {};

        function eventNameToRe(name) {
            return new RegExp('^' + name.replace(/\./g, '\\.') + '(\\.[0-9a-zA-Z]+)*$');
        }

        function retrieveEventRe(name) {
            if (!eventNameReCache[name]) {
                eventNameReCache[name] = eventNameToRe(name);
            }

            return eventNameReCache[name];
        }

        function nameMatch(t, eventNames) {
            var tEvents = t.events,
                f = tEvents.indexOf("*") > -1
                    ? function () { return true; }
                    : function (name) {
                        return enumerable.from(tEvents).any(function (tEvent) {
                            return retrieveEventRe(tEvent).test(name);
                        });
                    };
            return enumerable
                .from(eventNames)
                .any(f);
        }

        return function (state, eventNames, evaluator) {
            return state.transitions.filter(function (t) {
                return (!t.events || nameMatch(t, eventNames)) && (!t.condition || evaluator(t));
            });
        };
    };
});


/*global define,setTimeout,clearTimeout*/
define('scalejs.statechart/statechart',[
    'scalejs!core',
    './model',
    './factory',
    './runtime',
    './stateKinds',
    './transitionSelector',
    './eventRaiser'
], function (
    core,
    model,
    stateChartFactory,
    stateChartRuntime,
    stateKinds,
    stateChartTransitionSelector,
    eventRaiser
) {
    

    var // imports
        log = core.log.debug,
        array = core.array,
        enumerable = core.linq.enumerable;

    return function statechart() {
        var factory,
            runtime,
            transitionSelector,
            configuration = [],
            historyValue,
            innerEventQueue = [],
            isInFinalState = false,
            listeners = [],
            printTrace = false,
            logStatesEnteredAndExited = false,
            isStepping = false,
            root;

        function conflicts(t1, t2) {
            return !model.isArenaOrthogonal(t1, t2);
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

            consistentTransitions = enumerable.from(transitions).except(allInconsistentTransitions).toArray();
            return [consistentTransitions, inconsistentTransitionsPairs];
        }

        function selectPriorityEnabledTransitions(enabledTransitions) {
            var priorityEnabledTransitions = [],
                tuple = getInconsistentTransitions(enabledTransitions),
                consistentTransitions = tuple[0],
                inconsistentTransitionsPairs = tuple[1];

            priorityEnabledTransitions = array.copy(consistentTransitions);

            while (inconsistentTransitionsPairs.length > 0) {
                enabledTransitions = enumerable
                    .from(inconsistentTransitionsPairs)
                    .select(model.getTransitionWithHigherSourceChildPriority)
                    .distinct()
                    .toArray();

                tuple = getInconsistentTransitions(enabledTransitions);
                consistentTransitions = tuple[0];
                inconsistentTransitionsPairs = tuple[1];

                priorityEnabledTransitions = enumerable
                    .from(priorityEnabledTransitions)
                    .union(consistentTransitions)
                    .toArray();
            }

            return priorityEnabledTransitions;
        }

        function selectTransitions(eventSet) {
            var states,
                eventNames,
                enabledTransitions,
                transitionConditionEvaluator,
                priorityEnabledTransitions;

            states = enumerable.from(configuration)
                .selectMany(function (s) {
                    return model.getAncestorsOrSelf(s);
                })
                .distinct()
                .toArray();

            transitionConditionEvaluator = runtime.transitionConditionEvaluator(eventSet);
            eventNames = enumerable.from(eventSet).select('$.name').toArray();

            enabledTransitions = enumerable.from(states)
                .selectMany(function (state) {
                    return transitionSelector(state, eventNames, transitionConditionEvaluator);
                })
                .distinct()
                .toArray();

            priorityEnabledTransitions = selectPriorityEnabledTransitions(enabledTransitions);

            return priorityEnabledTransitions;
        }

        function getStatesExited(transitions) {
            var statesExited = [],
                basicStatesExited = [],
                sortedStatesExited = [];

            transitions.forEach(function (transition) {
                var lca = transition.lca,
                    desc = lca.descendants;

                configuration.forEach(function (state) {
                    if (desc.indexOf(state) > -1) {
                        array.addOne(basicStatesExited, state);
                        array.addOne(statesExited, state);
                        model.getAncestors(state, lca).forEach(function (anc) {
                            array.addOne(statesExited, anc);
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
                var lca = model.getLCA(source, target),
                    ancestors = model.getAncestors(target, lca);

                ancestors.forEach(function (s) {
                    if (s.kind === stateKinds.COMPOSITE) {
                        //just add him to statesToEnter, and declare him processed
                        //this is to prevent adding his initial state later on
                        array.addOne(statesToEnter, s);

                        array.addOne(statesProcessed, s);
                    } else {
                        //everything else can just be passed through as normal
                        processState(s);
                    }
                });
            };

            processState = function (s) {
                if (statesProcessed.indexOf(s) > -1) {
                    return;
                }

                if (s.kind === stateKinds.HISTORY) {
                    if (historyValue.hasOwnProperty(s.id)) {
                        historyValue[s.id].forEach(function (stateFromHistory) {
                            processTransitionSourceAndTarget(s, stateFromHistory);
                        });
                    } else {
                        array.addOne(statesToEnter, s);
                        array.addOne(basicStatesToEnter, s);
                    }
                } else {
                    array.addOne(statesToEnter, s);

                    if (s.kind === stateKinds.PARALLEL) {
                        statesToProcess.push.apply(statesToProcess,
                            s.children.filter(function (s) {
                                return s.kind !== stateKinds.HISTORY;
                            }));
                    } else if (s.kind === stateKinds.COMPOSITE) {
                        statesToProcess.push(s.initial);
                    } else if (s.kind === stateKinds.INITIAL || s.kind === stateKinds.BASIC || s.kind === stateKinds.FINAL) {
                        array.addOne(basicStatesToEnter, s);
                    }
                }

                array.addOne(statesProcessed, s);
            };

            //do the initial setup
            transitions.forEach(function (transition) {
                transition.targets.forEach(function (target) {
                    processTransitionSourceAndTarget(transition.source, target);
                });
            });

            //loop and add states until there are no more to add (we reach a stable state)
            while ((s = statesToProcess.shift()) !== undefined) {
                processState(s);
            }

            //sort based on depth
            sortedStatesEntered = enumerable.from(statesToEnter).orderBy('$.depth').toArray();

            return [basicStatesToEnter, sortedStatesEntered];
        }

        function performSmallStep(eventSet) {
            var selectedTransitions,
                selectedTransitionsWithTargets,
                exitedTuple,
                basicStatesExited,
                statesExited,
                enteredTuple,
                basicStatesEntered,
                statesEntered,
                eventsToAddToInnerQueue,
                sortedTransitions;

            runtime.beginSmallStep();

            if (printTrace) {
                log("selecting transitions with eventSet: ", eventSet);
            }

            selectedTransitions = selectTransitions(eventSet);

            if (selectedTransitions.length > 0) {
                if (printTrace) {
                    log("sorted transitions: ", selectedTransitions);
                }

                //we only want to enter and exit states from transitions with targets
                //filter out targetless transitions here - we will only use these to execute transition actions
                selectedTransitionsWithTargets = enumerable
                    .from(selectedTransitions)
                    .where('$.targets')
                    .toArray();

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

                statesExited.forEach(function (state) {
                    if (printTrace || logStatesEnteredAndExited) {
                        log("exiting ", state.id);
                    }

                    //invoke listeners
                    listeners.forEach(function (l) {
                        if (l.onExit) {
                            l.onExit(state.id);
                        }
                    });

                    if (state.onExit !== undefined) {
                        runtime.runAction(state.id, 'onExit', state.onExit, eventSet, eventsToAddToInnerQueue);
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
                sortedTransitions = enumerable.from(selectedTransitions).orderBy('$.documentOrder').toArray();

                if (printTrace) {
                    log("executing transitition actions");
                }


                sortedTransitions.forEach(function (transition) {
                    var targetIds = enumerable.from(transition.targets).select('$.id').toArray();

                    listeners.forEach(function (l) {
                        if (l.onTransition) {
                            l.onTransition(transition.source.id, targetIds);
                        }
                    });

                    if (transition.action) {
                        runtime.runAction(transition.source.id, 'action', transition.action, eventSet, eventsToAddToInnerQueue);
                    }
                });

                if (printTrace) {
                    log("executing state enter actions");
                }

                statesEntered.forEach(function (state) {
                    if (printTrace || logStatesEnteredAndExited) {
                        log("entering", state.id);
                    }

                    listeners.forEach(function (l) {
                        if (l.onEntry) {
                            l.onEntry(state.id);
                        }
                    });

                    if (state.onEntry) {
                        runtime.runAction(state.id, 'onEntry', state.onEntry, eventSet, eventsToAddToInnerQueue);
                    }
                });

                if (printTrace) {
                    log("updating configuration ");
                    log("old configuration ", configuration);
                }

                //update configuration by removing basic states exited, and adding basic states entered
                configuration = enumerable
                    .from(configuration)
                    .except(basicStatesExited)
                    .union(basicStatesEntered)
                    .toArray();

                if (printTrace) {
                    log("new configuration ", configuration);
                }

                //add set of generated events to the innerEventQueue -> Event Lifelines: Next small-step
                if (eventsToAddToInnerQueue.length > 0) {
                    if (printTrace) {
                        log("adding triggered events to inner queue ", eventsToAddToInnerQueue);
                    }
                    innerEventQueue.push(eventsToAddToInnerQueue);
                }

                if (printTrace) {
                    log("updating datamodel for next small step :");
                }
            }

            runtime.endSmallStep();
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
                selectedTransitions;

            while (keepGoing) {
                eventSet = innerEventQueue.length > 0 ? innerEventQueue.shift() : [];

                selectedTransitions = performSmallStep(eventSet);
                keepGoing = enumerable.from(selectedTransitions).any();
            }

            isInFinalState = enumerable.from(configuration).all(function (s) {
                return s.kind === stateKinds.FINAL;
            });
        }

        function getConfiguration() {
            var configurationIds = enumerable.from(configuration)
                .orderBy('$.documentOrder')
                .select('$.id')
                .toArray();

            return configurationIds;
        }

        function getFullConfiguration() {
            var configurationIds = enumerable
                .from(configuration)
                .selectMany(function (s) {
                    return model.getAncestorsOrSelf(s);
                })
                .select('$.id')
                .orderBy('$.documentOrder')
                .distinct()
                .toArray();

            return configurationIds;
        }

        function raiseEvent(event) {
            if (isStepping) {
                throw new Error('`raiseEvent` called before previous call to `raiseEvent` could complete. ' +
                                'If executed in single-threaded environment, this means it was called recursively,' +
                                'which is illegal, as it would break SCION step semantics.');
            }

            isStepping = true;
            performBigStep(event);
            isStepping = false;
        }

        function start() {
            //perform big step without events to take all default transitions and reach stable initial state
            if (printTrace) {
                log("performing initial big step");
            }

            performBigStep();

            return getConfiguration();
        }

        function getSpecification() {
            return factory.getSpec();
        }

        // initialize all parts
        transitionSelector = stateChartTransitionSelector();

        factory = stateChartFactory();
        root = factory.create.apply(null, arguments);

        configuration.push(root.initial || root);
        runtime = stateChartRuntime({
            printTrace: printTrace,
            getFullConfiguration: getFullConfiguration
        });

        return {
            factory: factory,
            start: start,
            raise: eventRaiser(raiseEvent),
            getConfiguration: getConfiguration,
            getFullConfiguration: getFullConfiguration,
            getSpecification: getSpecification
        };
    };
});


/*global define*/
define('scalejs.statechart',[
    'scalejs!core',
    './scalejs.statechart/statechart',
    './scalejs.statechart/builder'
], function (
    core,
    statechart,
    builder
) {
    

    var enumerable = core.linq.enumerable,
        has = core.object.has,
        state = builder.state,
        parallel = builder.parallel,
        applicationStatechartSpec,
        applicationStatechart;

    function findState(state, stateId) {
        function allStates(current) {
            if (has(current, 'states')) {
                return enumerable.make(current)
                    .concat(enumerable.from(current.states).selectMany(function (s) {
                        return allStates(s);
                    }));
            }

            return enumerable.make(current);
        }

        var found = allStates(state).firstOrDefault(function (s) { return s.id === stateId; });

        return found;
    }


    function registerState(parentStateId, stateBuilder) {
        if (core.isApplicationStarted()) {
            throw new Error('Can\'t add new state to application that is already running.');
        }

        var state = stateBuilder.toSpec(),
            parent,
            existing;

        parent = findState(applicationStatechartSpec, parentStateId);
        if (!parent) {
            throw new Error('Parent state "' + parentStateId + '" doesn\'t exist');
        }

        if (has(state, 'id')) {
            existing = findState(applicationStatechartSpec, state.id);
            if (existing) {
                throw new Error('State "' + state.id + '" already exists.');
            }
        }

        if (!has(parent, 'states')) {
            parent.states = [];
        }
        parent.states.push(state);
    }

    function raise(eventName, eventData, delay) {
        applicationStatechart.raise(eventName, eventData, delay);
    }

    applicationStatechartSpec = state('scalejs', parallel('root')).toSpec();

    core.onApplicationStarted(function () {
        applicationStatechart = statechart(applicationStatechartSpec);
        applicationStatechart.start();
    });

    core.registerExtension({
        state: {
            registerState: registerState,
            raise: raise,
            statechart: statechart,
            builder: builder
        }
    });
});


