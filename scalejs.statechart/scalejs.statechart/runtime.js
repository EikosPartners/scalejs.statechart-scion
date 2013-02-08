/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core'
], function (
    core
) {
    'use strict';

    var // imports
        array = core.array,
        log = core.log.debug;

    return function runtime(context) {
        var performBigStep = context.performBigStep,
            getConfiguration = context.getConfiguration,
            printTrace = context.printTrace,
            isStepping = false,
            timeoutMap = {},
            datamodel = {};

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

        function evaluateAction(action, eventSet, datamodelForNextStep, eventsToAddToInnerQueue) {
            function $raise(event) {
                array.addOne(eventsToAddToInnerQueue, event);
            }

            var n = getScriptingInterface(datamodelForNextStep, eventSet, true);
            return action.call(null, n.getData, n.setData, n.events, $raise);
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
            var callback,
                timeoutId;

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

        return {
            evaluateAction: evaluateAction,
            getData: getData,
            setData: setData,
            send: send,
            cancel: cancel
        };
    };
});

