/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.statechart,
        goto = core.state.builder.goto,
        gotoInternally = core.state.builder.gotoInternally,
        on = core.state.builder.on,
        onEntry = core.state.builder.onEntry,
        onExit = core.state.builder.onExit,
        state = core.state.builder.state,
        parallel = core.state.builder.parallel;

    describe('satechart more parallel', function () {
        it('0', function () {
            var sc = statechart(
                    parallel('p',
                        state('a', on('t', gotoInternally('a'))),
                        state('b'))
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['b', 'a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['a', 'b']);
        });

        it('1', function () {
            var sc = statechart(
                    parallel('p',
                        state('a',
                            on('t', gotoInternally('a')),
                            state('a1'),
                            state('a2')),
                        state('b',
                            state('b1'),
                            state('b2')))
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['b1', 'a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b1', 'a1']);
        });

        it('2', function () {
            var sc = statechart(
                    parallel('p',
                        state('a',
                            on('t', gotoInternally('a')),
                            state('a1'),
                            state('a2')
                            ),
                        state('b',
                            state('b1', on('t', goto('b2'))),
                            state('b2')))
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['b1', 'a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['a1', 'b2']);
        });

        it('3', function () {
            var sc = statechart(
                    parallel('p',
                        state('a',
                            state('a1', on('t', goto('a2'))),
                            state('a2')),
                        state('b',
                            state('b1', on('t', goto('b2'))),
                            state('b2')))
                );



            sc.start();
            expect(sc.getConfiguration()).toEqual(['b1', 'a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b2', 'a2']);
        });

        it('4', function () {
            var sc = statechart(
                    parallel('p',
                        state('a',
                            on('t', gotoInternally('a')),
                            state('a1'),
                            state('a2')
                            ),
                        state('b',
                            on('t', gotoInternally('b')),
                            state('b1'),
                            state('b2')
                            ))
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['b1', 'a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b1', 'a1']);
        });

        it('5', function () {
            var sc = statechart(
                    parallel('p',
                        state('a',
                            on('t', gotoInternally('a2')),
                            state('a1'),
                            state('a2')
                            ),
                        state('b',
                            on('t', gotoInternally('b2')),
                            state('b1'),
                            state('b2')
                            ))
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['b1', 'a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b2', 'a2']);
        });

        it('6', function () {
            var sc = statechart(
                    parallel('p',
                        state('a',
                            state('a1',
                                state('a11'),
                                state('a12')),
                            state('a2',
                                on('t', gotoInternally('a22')),
                                state('a21'),
                                state('a22'))),
                        state('b',
                            state('b1',
                                state('b11', on('t', goto('b12'))),
                                state('b12')),
                            state('b2',
                                state('b21'),
                                state('b22')))
                        )
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['b11', 'a11']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b12', 'a22']);
        });

        it('7', function () {
            var sc = statechart(
                    parallel('p',
                        state('a',
                            state('a1',
                                state('a11'),
                                state('a12')),
                            state('a2',
                                on('t', gotoInternally('a22')),
                                state('a21'),
                                state('a22'))
                            ),
                        state('b',
                            state('b1',
                                state('b11'),
                                state('b12')),
                            state('b2',
                                on('t', gotoInternally('b22')),
                                state('b21'),
                                state('b22'))
                            )
                        )
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['b11', 'a11']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b22', 'a22']);
        });

        it('8', function () {
            var sc = statechart(
                    state('x', on('t', goto('a22'))),
                    parallel('p',
                        state('a',
                            state('a1',
                                state('a11'),
                                state('a12')),
                            state('a2',
                                state('a21'),
                                state('a22'))
                            ),
                        state('b',
                            state('b1',
                                state('b11'),
                                state('b12')),
                            state('b2',
                                state('b21'),
                                state('b22'))
                            )
                        )
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['x']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['a22', 'b11']);
        });

        it('9', function () {
            var sc = statechart(
                    state('x', on('t', goto('a22 b22'))),
                    parallel('p',
                        state('a',
                            state('a1',
                                state('a11'),
                                state('a12')),
                            state('a2',
                                state('a21'),
                                state('a22'))
                            ),
                        state('b',
                            state('b1',
                                state('b11'),
                                state('b12')),
                            state('b2',
                                state('b21'),
                                state('b22'))
                            )
                        )
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['x']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['a22', 'b22']);
        });
    });
});