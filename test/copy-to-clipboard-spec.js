describe('Test copy to clipboard functionality', function () {

    var dg;

    beforeEach(function () {
        jasmine.getFixtures().set('<div id="my-table"></div>');
        var tableContainer = $('#my-table')[0];

        dg = new Datagrid(tableContainer, {
            columns: [
                { field: 'firstName', title: 'First Name' },
                { field: 'lastName', title: 'Last Name' }
            ],
            datas: [
                { guid: 1, firstName: 'foo1', lastName: 'foo2' },
                { guid: 2, firstName: 'bar1', lastName: 'bar2\twith tab' },
                { guid: 3, firstName: 'baz1', lastName: 'baz2'}
            ]
        });
    });

    it('should get spreadsheet-ready data', function () {
        expect(dg.getSpreadsheetData([0])).toEqual('foo1\tfoo2');
        expect(dg.getSpreadsheetData([0, 2])).toEqual('foo1\tfoo2\nbaz1\tbaz2');
        //TODO: is it possible to escape tab?
        //expect(dg.getSpreadsheetData([1])).toEqual('bar1\tbar2');
    });
});