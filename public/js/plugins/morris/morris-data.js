// Morris.js Charts sample data for SB Admin template

$(function() {

    // Area Chart
    Morris.Area({
        element: 'arms-day',
        data: [{
            date: '2016-01-15',
            squat: 4750,
            bench: 3450
        }, {
            date: '2016-01-16',
            squat: 5000,
            bench: 3500
        }, {
            date: '2016-01-17',
            squat: 5150,
            bench: 3500
        }, {
            date: '2016-01-18',
            squat: 5300,
            bench: 3550
        }, {
            date: '2016-01-19',
            squat: 5400,
            bench: 3650
        }, {
            date: '2016-01-20',
            squat: 5400,
            bench: 3750
        }, {
            date: '2016-01-21',
            squat: 5550,
            bench: 3750
        }, {
            date: '2016-01-22',
            squat: 5600,
            bench: 3800
        }, {
            date: '2016-01-23',
            squat: 5650,
            bench: 3750
        }, {
            date: '2016-01-24',
            squat: 5700,
            bench: 3800
        }],
        xkey: 'date',
        ykeys: ['squat', 'bench'],
        labels: ['Squats', 'Bench Press'],
        pointSize: 3,
        hideHover: 'auto',
        resize: true
    });

});
