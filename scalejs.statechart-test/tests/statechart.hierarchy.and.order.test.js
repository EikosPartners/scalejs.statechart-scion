/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.statechart;

    describe('statechart hierarchy and document order', function () {
        it('0', function () {
            var sc = statechart({
                states: [{
                    initial: true,
                    transitions: [{
                        target: 'a1'
                    }]
                }, {
                    states: [{
                        id: 'a1',
                        transitions: [{
                            target: 'a2',
                            event: 't'
                        }, {
                            target: 'c',
                            event: 't'
                        }]
                    }, {
                        id: 'a2'
                    }],
                    transitions: [{
                        target: 'b',
                        event: 't'
                    }]
                }, {
                    id: 'b'
                }, {
                    id: 'c'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a2']);
        });

        it('1', function () {
            /*statchart(
                initial(transition('a1')),
                state()
                    .state('a1'
                    state('a1',
                        transitionTo('b').on('t')
                        transitionTo('c').on('t'),
                    state('a2'))
                    transition('a2').on('t')),
                state('b'),
                state('c'));*/

            var sc = statechart({
                states: [{
                    initial: true,
                    transitions: [{
                        target: 'a1'
                    }]
                }, {
                    states: [{
                        id: 'a1',
                        transitions: [{
                            target: 'b',
                            event: 't'
                        }, {
                            target: 'c',
                            event: 't'
                        }]
                    }, {
                        id: 'a2'
                    }],
                    transitions: [{
                        target: 'a2',
                        event: 't'
                    }]
                }, {
                    id: 'b'
                }, {
                    id: 'c'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['b']);
        });
    });
});