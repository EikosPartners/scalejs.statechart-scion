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

    describe('statechart hierarchy and document order', function () {
        it('0', function () {
            var sc = statechart(
                    state().goto('a1'),
                    state('a',
                        state('a1')
                            .on('t').goto('a2')
                            .on('t').goto('c'),
                        state('a2')).on('t').goto('b'),
                    state('b'),
                    state('c')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['a2']);
        });

        it('1', function () {
            var sc = statechart(
                    state().goto('a1'),
                    state(
                        state('a1')
                            .on('t').goto('b')
                            .on('t').goto('c'),
                        state('a2')
                    ).on('t').goto('a2'),
                    state('b'),
                    state('c')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b']);
        });
    });
});