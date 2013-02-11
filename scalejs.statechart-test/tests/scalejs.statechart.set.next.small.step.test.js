/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart.statechart;

    describe('statechart `set` next small step', function () {
        it('0', function () {
            var sc = statechart({
                states: [{
                    initial: true,
                    transitions: [{
                        target: 'a',
                        action: function () {
                            this.set('a', 100);
                        }
                    }]
                }, {
                    id: 'a',
                    transitions: [{
                        target: 'b',
                        event: 't',
                        condition: function () {
                            return this.get('a') === 100;
                        }
                    }, {
                        target: 'f',
                        event: 't'
                    }]
                }, {
                    id: 'b'
                }, {
                    id: 'f'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['b']);
        });

        it('1', function () {
            var sc = statechart({
                states: [{
                    id: 'a',
                    transitions: [{
                        target: 'b',
                        event: 't',
                        action: function () {
                            this.set('i', 0);
                        }
                    }]
                }, {
                    id: 'b',
                    transitions: [{
                        target: 'b',
                        condition: function () {
                            return this.get('i') < 100;
                        },
                        action: function () {
                            this.set('i', this.get('i') + 1);
                        }
                    }, {
                        target: 'c',
                        condition: function () {
                            return this.get('i') === 100;
                        }
                    }]
                }, {
                    id: 'c'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('2', function () {
            /*statechart({
                state('a')
                .on(function (data, event) { return data.i < 100; })
                .goto('b', function (data) { data.i = data.i += 1; }),
                state('A', 
                    state('b') 
                    .on(function (data) { return data.i < 100; })
                    .transit('c', function (data) { data.i = data.i += 1; }),

                    state('c')
                    .on(function (data) { return data.i < 100; })
                    .goto('b', function (data) { data.i = data.i += 1; }))
                .on(function (data) {
                    if (data.i == 100) {
                        return 'd';
                    }
                })
                .on(function () { return 'f'; }),
                state('d'),
                state('f')*/
            var sc = statechart({
                states: [{
                    id: 'a',
                    transitions: [{
                        target: 'b',
                        event: 't',
                        action: function () {
                            this.set('i', 0);
                        }
                    }]
                }, {
                    id: 'A',
                    states: [{
                        id: 'b',
                        transitions: [{
                            target: 'c',
                            condition: function () {
                                return this.get('i') < 100;
                            },
                            action: function () {
                                this.set('i', this.get('i') + 1);
                            }
                        }]
                    }, {
                        id: 'c',
                        transitions: [{
                            target: 'b',
                            condition: function () {
                                return this.get('i') < 100;
                            },
                            action: function () {
                                this.set('i', this.get('i') + 1);
                            }
                        }]
                    }],
                    transitions: [{
                        target: 'd',
                        condition: function () {
                            return this.get('i') === 100;
                        },
                        action: function () {
                            this.set('i', this.get('i') * 2);
                        }
                    }]
                }, {
                    id: 'd',
                    transitions: [{
                        target: 'e',
                        condition: function () { return this.get('i') === 200; }
                    }, {
                        target: 'f'
                    }]
                }, {
                    id: 'e'
                }, {
                    id: 'f'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['e']);
        });

        it('3', function () {
            // this demonstrates the difference between commited and not-commited data (see 'current.step')
            // all data changes during the small test are not commited right away but only after 'small step'
            // is complete. Therefore conditions on commited data should trigger only when a proper event is raised
            // (e.g. statechart would transition to 'd' only when 't3' fired and not right away when i == -1)
            var sc = statechart({
                states: [{
                    id: 'a',
                    transitions: [{
                        target: 'p',
                        event: 't1',
                        action: function () {
                            this.set('i', 0);
                        }
                    }]
                }, {
                    id: 'p',
                    parallel: true,
                    states: [{
                        id: 'b',
                        states: [{
                            id: 'b1',
                            transitions: [{
                                event: 't2',
                                target: 'b2',
                                action: function () {
                                    this.set('i', this.get('i') + 1);
                                }
                            }]
                        }, {
                            id: 'b2'
                        }]
                    }, {
                        id: 'c',
                        states: [{
                            id: 'c1',
                            transitions: [{
                                event: 't2',
                                target: 'c2',
                                action: function () {
                                    this.set('i', this.get('i') - 1);
                                }
                            }]
                        }, {
                            id: 'c2'
                        }]
                    }],
                    transitions: [{
                        event: 't3',
                        target: 'd',
                        condition: function () { return this.get('i') === -1; }
                    }, {
                        target: 'f',
                        condition: function () { return this.get('i') === 1; }
                    }]
                }, {
                    id: 'd'
                }, {
                    id: 'f'
                }]
            });

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t1');
            expect(sc.getConfiguration()).toEqual(['b1', 'c1']);

            sc.raise('t2');
            expect(sc.getConfiguration()).toEqual(['b2', 'c2']);

            sc.raise('t3');
            expect(sc.getConfiguration()).toEqual(['d']);
        });
    });
});