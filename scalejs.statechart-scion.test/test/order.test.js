/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.statechart,
        state = core.state.builder.state,
        parallel = core.state.builder.parallel;

    describe('statechart document order', function () {
        it('0', function () {
            var sc = statechart(
                    state().goto('a'),
                    state('a')
                        .on('t').goto('b')
                        .on('t').goto('c'),
                    state('b'),
                    state('c')
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b']);
        });
    });
});