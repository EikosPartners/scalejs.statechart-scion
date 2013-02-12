/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core',
    './eventRaiser'
], function (
    core,
    eventRaiser
) {
    'use strict';

    var // imports
        has = core.object.has,
        array = core.array,
        log = core.log.debug,
        merge = core.object.merge;

    return function runtime() {
        var datamodel = {};

        function createActionContext(eventsToAddToInnerQueue) {
            /*
            function get(key) {
                return datamodelForNextStep.hasOwnProperty(key)
                        ? datamodelForNextStep[key]
                        : datamodel[key];
            }

            function set(key, value) {
                datamodelForNextStep[key] = value;
            }*/

            function raiseEvent(event) {
                // if eventsToAddToInnerQueue is not defined it means raiseEvent is called
                // from transitionEvaluator. This is now allowed. 
                if (!has(eventsToAddToInnerQueue)) {
                    throw {
                        name: 'Illegal Operation',
                        message: 'Raising events is not allowed in transition conditions.'
                    };
                }
                array.addOne(eventsToAddToInnerQueue, event);
            }

            return merge(datamodel, { raise: eventRaiser(raiseEvent) });
        }

        function runAction(action, eventSet, datamodelForNextStep, eventsToAddToInnerQueue) {
            log('Running action ' + action.name);

            var actionContext = createActionContext(eventsToAddToInnerQueue),
                result = action.call(actionContext, datamodelForNextStep, eventSet);

            delete actionContext.raise;

            datamodel = actionContext;

            log('Finished action ' + action.name);

            return result;
        }

        function transitionConditionEvaluator(eventSet, datamodelForNextStep) {
            var actionContext = createActionContext(datamodelForNextStep);

            return function (transition) {
                if (transition.condition) {
                    return transition.condition.call(actionContext, eventSet);
                }
            };
        }

        function commit(datamodelForNextStep) {
            var key;
            for (key in datamodelForNextStep) {
                if (datamodelForNextStep.hasOwnProperty(key)) {
                    datamodel[key] = datamodelForNextStep[key];
                }
            }
        }

        return {
            runAction: runAction,
            transitionConditionEvaluator: transitionConditionEvaluator,
            commit: commit
        };
    };
});

