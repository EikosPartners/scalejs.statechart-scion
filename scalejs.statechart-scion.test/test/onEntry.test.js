/*global define,describe,expect,it,jasmine*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.statechart,
        state = core.state.builder.state,
        onEntry = core.state.builder.onEntry,
        parallel = core.state.builder.parallel;

    describe('onEntry', function () {
        describe('`state`', function () {
            it('onEntry in document order', function () {
                var calls = [],
                    sc = statechart(
                        parallel('s',
                            state('a', onEntry(function () { calls.push('a'); })),
                            state('b', onEntry(function () { calls.push('b'); })))
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['b', 'a']);

                expect(calls).toEqual(['b', 'a']);
            });
        });
    });
});