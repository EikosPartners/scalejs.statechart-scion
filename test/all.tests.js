require.config({
    paths: {
        boot: '../lib/jasmine/boot',
        'jasmine-html': '../lib/jasmine/jasmine-html',
        jasmine: '../lib/jasmine/jasmine',
        'scalejs.statechart-scion': '../build/scalejs.statechart-scion'
    },
    shim: {
        jasmine: {
            exports: 'window.jasmineRequire'
        },
        'jasmine-html': {
            deps: [
                'jasmine'
            ],
            exports: 'window.jasmineRequire'
        },
        boot: {
            deps: [
                'jasmine',
                'jasmine-html'
            ],
            exports: 'window.jasmineRequire'
        }
    },
    scalejs: {
        extensions: [
            'scalejs.statechart-scion'
        ]
    }
});

require(['boot'], function () {
    require ([
        './scalejs.state.test',
        './builder.test',
        './basic.test',
        './raise-inner.test',
        './raise-outer.test',
        './order.test',
        './hierarchy.test',
        './hierarchy-order.test',
        './parallel.test',
        './more-parallel.test',
        //'./assign-current-small-step.test',
        './onEntry.test',
        './misc.test'
    ], function () {
        window.onload();
    });
});
