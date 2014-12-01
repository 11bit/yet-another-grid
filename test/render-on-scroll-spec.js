/**
 *
 */

'use strict';

var getSampleData = function () {
    var sampleData = [];
    for (var i=0; i<100; i++) {
        sampleData.push({
            col1: i,
            col2: Math.random()
        })
    }
    return sampleData;
}

var scrollTo = function (dg, pos) {
    dg.bodyWrapper.scrollTop = pos;
    dg.bodyWrapper.dispatchEvent(new Event('scroll'));
}
var scrollToEnd = function (dg) {
    dg.bodyWrapper.scrollTop = dg.bodyWrapper.scrollHeight;
    dg.bodyWrapper.dispatchEvent(new Event('scroll'));
}

describe('Render on scroll behaviour', function() {
    beforeEach(function() {

        // use synchronous code for testing
        YAD.defer = function(func) {func()};
        YAD.debounce = function (f) {return f};

        jasmine.getFixtures().set('<div id="my-table"></div>');
        $('#my-table')
            .width(300)
            .height(300);
        this.tableContainer = $('#my-table').get()[0];


    });

    it ('should calculate row height', function () {
        var opts = {
            loadOnScroll: true,
            columns: [
                { field: 'col1', title: 'Col1' },
                { field: 'col2', title: 'Col2' },
            ],
            datas: getSampleData()
        };

        var dg = new Datagrid(this.tableContainer, opts);

        expect(dg.getRowHeight()).toBe($(dg.body.tbody).find('tr').height());
    })

    it ('should properly calculate visible area size', function (){
        var opts = {
            loadOnScroll: true,
            columns: [
                { field: 'col1', title: 'Col1' },
                { field: 'col2', title: 'Col2' },
            ]
        };

        var dg = new Datagrid(this.tableContainer, opts);

        // monkeypatching datagrid to be independent of styles and etc
        dg.getRowHeight = function() {
            return 30;
        };

        expect(dg.getRowsToFitCount()).toBe(10);
    });

    it ('should calculate visible area for scrolled datagrid', function () {
        var long_data = getSampleData();

        var opts = {
            loadOnScroll: true,
            columns: [
                { field: 'col1', title: 'Col1' },
                { field: 'col2', title: 'Col2' },
            ],
            datas: long_data
        };
        var dg = new Datagrid(this.tableContainer, opts);
        expect(dg.getRowsToFitCount()).toBe(13);
        expect($(dg.body.tbody).find('tr').length).toBe(13);

        scrollTo(dg, 100);
        expect(dg.getRowsToFitCount()).toBe(18);
        expect($(dg.body.tbody).find('tr').length).toBe(18);

        scrollToEnd(dg);
        expect(dg.getRowsToFitCount()).toBe(long_data.length);
        expect($(dg.body.tbody).find('tr').length).toBe(100);

        dg.sort([1]);
        expect(dg.getRowsToFitCount()).toBe(long_data.length);
        expect($(dg.body.tbody).find('tr').length).toBe(100);
    })

    it ('should create empty filler at the bottom of a grid to simulate correct vertical scroll bars', function () {
        var long_data = getSampleData();

        var opts = {
            loadOnScroll: true,
            columns: [
                { field: 'col1', title: 'Col1' },
                { field: 'col2', title: 'Col2' },
            ],
            datas: long_data
        };

        var dg = new Datagrid(this.tableContainer, opts);

        var rowNumber = $(dg.body.tbody).find('tr').length;
        var rowsRemaining = long_data.length - rowNumber;
        expect(dg.scrollFillers.scrollFiller.offsetHeight).toBe(rowsRemaining*dg.getRowHeight());

        scrollTo(dg, 100);

        rowNumber = $(dg.body.tbody).find('tr').length;
        rowsRemaining = long_data.length - rowNumber;
        expect(dg.scrollFillers.scrollFiller.offsetHeight).toBe(rowsRemaining*dg.getRowHeight());

        scrollToEnd(dg);

        expect(dg.scrollFillers.scrollFiller.offsetHeight).toBe(0);
    })

    it ('should sort scrolled data', function () {
        var long_data = getSampleData();

        var opts = {
            loadOnScroll: true,
            columns: [
                { field: 'col1', title: 'Col1' },
                { field: 'col2', title: 'Col2' },
            ],
            datas: long_data
        };

        var dg = new Datagrid(this.tableContainer, opts);

        var scrollPosBeforeSort = 100;
        scrollTo(dg, scrollPosBeforeSort);
        var numOfRowsBeforeSort = $(dg.body.tbody).find('tr').length;

        dg.sort([1]);
        expect(dg.bodyWrapper.scrollTop).toBe(scrollPosBeforeSort);
        expect($(dg.body.tbody).find('tr').length).toBe(numOfRowsBeforeSort)

        scrollToEnd(dg);
        expect($(dg.body.tbody).find('tr').length).toBe(long_data.length);

        dg.sort([1]);
        expect($(dg.body.tbody).find('tr').length).toBe(long_data.length);
    })

    it ('should add rows on resize', function () {
        var opts = {
            loadOnScroll: true,
            columns: [
                { field: 'col1', title: 'Col1' },
                { field: 'col2', title: 'Col2' },
            ],
            datas: getSampleData()
        };

        var dg = new Datagrid(this.tableContainer, opts);

        $('#my-table').height(500);
        dg.invalidateSize();

        expect($(dg.body.tbody).find('tr').length).toBe(dg.getRowsToFitCount());

    })
});
