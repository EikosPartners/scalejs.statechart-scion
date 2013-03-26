/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.statechart,
        goto = core.state.builder.goto,
        on = core.state.builder.on,
        onEntry = core.state.builder.onEntry,
        onExit = core.state.builder.onExit,
        state = core.state.builder.state,
        parallel = core.state.builder.parallel;

    describe('satechart parallel', function () {
        it('0', function () {
            var sc = statechart(
                    state(goto('p')),
                    parallel('p',
                        state('a'),
                        state('b'))
                );



            sc.start();
            expect(sc.getConfiguration()).toEqual(['b', 'a']);
        });

        it('1', function () {
            var sc = statechart(
                    parallel('p',
                        state('a',
                            state(goto('a1')),
                            state('a1', on('t', goto('a2'))),
                            state('a2')),
                        state('b',
                            state(goto('b1')),
                            state('b1', on('t', goto('b2'))),
                            state('b2')))
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['b1', 'a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b2', 'a2']);
        });

        it('2', function () {
            var sc = statechart(
                    parallel('p1',
                        state('s1',
                            parallel('p2',
                                on('t', goto('p3')),
                                state('s3'),
                                state('s4')),

                            parallel('p3',
                                state('s5'),
                                state('s6'))),

                        state('s2',
                            parallel('p4',
                                on('t', goto('p5')),
                                state('s7'),
                                state('s8')),

                            parallel('p5',
                                state('s9'),
                                state('s10'))))
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['s8', 's7', 's4', 's3']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['s6', 's5', 's10', 's9']);
        });

        it('3', function () {
            var sc = statechart(
                    parallel('p1',
                        state('s1',
                            parallel('p2',
                                state('s3',
                                    state('s3.1', on('t', goto('s3.2'))),
                                    state('s3.2')),
                                state('s4')),

                            parallel('p3',
                                state('s5'),
                                state('s6'))),

                        state('s2',
                            parallel('p4',
                                on('t', goto('p5')),
                                state('s7'),
                                state('s8')),
                            parallel('p5',
                                state('s9'),
                                state('s10'))))
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['s8', 's7', 's4', 's3.1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['s4', 's3.2', 's10', 's9']);
        });
    });
});