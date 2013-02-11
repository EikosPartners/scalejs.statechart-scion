/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart.statechart;

    describe('statechart `set` current small step', function () {
        it('0', function () {
            var sc = statechart({
                states: [{
                    id: 'a',
                    onEntry: function () {
                        this.set('a', -1);
                        this.set('a', 99);
                    },
                    transitions: [{
                        event: 't',
                        target: 'b',
                        condition: function () {
                            return this.get('a') === 99;
                        },
                        action: function () {
                            this.set('a', this.get('a') + 1);
                        }
                    }]
                }, {
                    id: 'b',
                    onEntry: function () {
                        this.set('a', this.get('a') * 2);
                    },
                    transitions: [
                        {target: 'c', condition: function () { return this.get('a') === 200; }},
                        {target: 'f'}
                    ]
                }, {
                    id: 'c'
                }, {
                    id: 'f'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('1', function () {
            var sc = statechart({
                states: [{
                    id: 'a',
                    transitions: [{
                        target: 'b',
                        event: 't',
                        action: function () { this.set('i', 0); }
                    }]
                }, {
                    id: 'b',
                    transitions: [{
                        target: 'b',
                        condition: function () { return this.get('i') < 100; },
                        action: function () { this.set('i', this.get('i') + 1); }
                    }, {
                        target: 'c',
                        condition: function () { return this.get('i') === 100; }
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
            var sc = statechart({
                states: [{
                    id: 'a',
                    transitions: [{
                        target: 'b',
                        event: 't',
                        action: function () { this.set('i', 0); }
                    }]
                }, {
                    id: 'A',
                    states: [{
                        id: 'b',
                        transitions: [{
                            target: 'c',
                            condition: function () { return this.get('i') < 100; },
                            action: function () { this.set('i', this.get('i') + 1); }
                        }]
                    }, {
                        id: 'c',
                        transitions: [{
                            target: 'b',
                            condition: function () { return this.get('i') < 100; },
                            action: function () { this.set('i', this.get('i') + 1); }
                        }]
                    }],
                    transitions: [{
                        target: 'd',
                        condition: function () { return this.get('i') === 100; },
                        action: function () { this.set('i', this.get('i') * 2); }
                    }]
                }, {
                    id: 'd',
                    transitions: [
                        {target: 'e', condition: function () { return this.get('i') === 200; }},
                        {target: 'f'}
                    ]
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
            var sc = statechart({
                states: [{
                    id: 'a',
                    transitions: [{
                        target: 'p',
                        event: 't1',
                        action: function () { this.set('i', 0); }
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
                    transitions: [
                        {event: 't3', target: 'd', condition: function () { return this.get('i') === 0; } },
                        {event: 't3', target: 'f'}
                    ]
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

        it('4', function () {
            var sc = statechart({
                states: [{
                    id: 'a',
                    onEntry: function () {
                        this.set('x', 2);
                    },
                    transitions: [{event: 't', target: 'b1'}]
                }, {
                    id: 'b',
                    onEntry: function () {
                        this.set('x', this.get('x') * 3);
                    },
                    states: [{
                        id: 'b1',
                        onEntry: function () {
                            this.set('x', this.get('x') * 5);
                        }
                    }, {
                        id: 'b2',
                        onEntry: function () {
                            this.set('x', this.get('x') * 7);
                        }
                    }],
                    transitions: [
                        {target: 'c', condition: function () { return this.get('x') === 30; }},
                        {target: 'f'}
                    ]
                }, {
                    id: 'c'
                }, {
                    id: 'f'
                }]
            });

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });
    });
});