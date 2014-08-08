'use strict';

describe('API spec', function() {
    describe('getColumnByCell', function() {
        beforeEach(function () {

            // use synchronous code for testing
            YAD.defer = function(func) {func()};

            jasmine.getFixtures().set('<div id="my-table"></div>');
            this.tableContainer = $('#my-table').get()[0];
            this.options = {
                columns: [
                    {field: 'name', title: 'Name'},
                    {field: 'expenses', title: 'Expenses'}
                ],
                datas: [
                    {guid: 1, name: 'Brown', expenses: 1000, children: [
                        {name: 'Alice', expenses: 400},
                        {name: 'John', expenses: 600}
                    ]},
                    {guid: 1, name: 'Smith', expenses: 5000, children: [
                        {name: 'Jim', expenses: 1500},
                        {name: 'Bob', expenses: 2500, children: [
                            {name: 'car', expenses: 1000},
                            {name: 'house', expenses: 1000},
                            {name: 'dog', expenses: 500}
                        ]},
                        {name: 'Margaret', expenses: 1000}
                    ]}
                ],
                expandable: true
            };
        });

        it ('should get column by cell', function() {
            var dg = new Datagrid(this.tableContainer, this.options);

            var cell1 = $(dg.body.tbody).find('td:eq(0)');
            var cell2 = $(dg.body.tbody).find('td:eq(1)');
            expect(cell1).toContainText('Brown');
            expect(cell2).toContainText('1000');

            var column1 = dg.getColumnByCell(cell1[0]);
            expect(column1.field).toBe('name');
            expect(column1.title).toBe('Name');

            var column2 = dg.getColumnByCell(cell2[0]);
            expect(column2.field).toBe('expenses');
            expect(column2.title).toBe('Expenses');
        });

        it ('should get column by children cell', function() {
            var dg = new Datagrid(this.tableContainer, this.options);

            $(dg.body.tbody).find('td:eq(0) .expand-children-button').mouseup();

            var childCell1 = $(dg.body.tbody).find('tr:eq(1) td:eq(0)'),
                column1 = dg.getColumnByCell(childCell1[0]);
            expect(childCell1).toHaveText('Alice');
            expect(column1.field).toBe('name');
            expect(column1.title).toBe('Name');
        });

        it ('should work with frozen columns', function() {
            this.options.frozenColumnsNum = 1;
            var dg = new Datagrid(this.tableContainer, this.options);

            var cell1 = $(dg.frozenBody.tbody).find('td:eq(0)');
            var cell2 = $(dg.body.tbody).find('td:eq(0)');
            expect(cell1).toContainText('Brown');
            expect(cell2).toContainText('1000');

            var column1 = dg.getColumnByCell(cell1[0]);
            expect(column1.field).toBe('name');
            expect(column1.title).toBe('Name');

            var column2 = dg.getColumnByCell(cell2[0]);
            expect(column2.field).toBe('expenses');
            expect(column2.title).toBe('Expenses');
        });

        it ('should throw exception if no cell is provided', function() {
            var dg = new Datagrid(this.tableContainer, this.options);

            expect(dg.getColumnByCell).toThrow('Can not get column by cell. undefined is not a data grid cell');
            expect(function() {
                dg.getColumnByCell($(dg.tbody).find('td:eq(0)'))
            }).toThrow('Can not get column by cell. [object Object] is not a data grid cell')
        })
    });

    describe('getParentIdsByCell', function() {
        beforeEach(function () {
            jasmine.getFixtures().set('<div id="my-table"></div>');
            this.tableContainer = $('#my-table').get()[0];
            this.options = {
                columns: [
                    {field: 'name', title: 'Name'},
                    {field: 'expenses', title: 'Expenses'}
                ],
                datas: [
                    {guid: 1, name: 'Brown', expenses: 1000, children: [
                        {name: 'Alice', expenses: 400},
                        {name: 'John', expenses: 600}
                    ]},
                    {guid: 1, name: 'Smith', expenses: 5000, children: [
                        {name: 'Jim', expenses: 1500},
                        {name: 'Bob', expenses: 2500, children: [
                            {name: 'car', expenses: 1000},
                            {name: 'house', expenses: 1000},
                            {name: 'dog', expenses: 500}
                        ]},
                        {name: 'Margaret', expenses: 1000}
                    ]}
                ],
                expandable: true
            };
        });

        it ('should get list of parent ids', function (){
            var dg = new Datagrid(this.tableContainer, this.options);

            var cell = $(dg.body.tbody).find('td:eq(0)');
            expect(dg.getParentIdsByCell(cell[0])).toEqual([]);

            $(dg.body.tbody).find('td:eq(0) .expand-children-button').mouseup();

            var child_cell = $(dg.body.tbody).find('tr:eq(1) td:eq(0)');
            expect(dg.getParentIdsByCell(child_cell[0])).toEqual([0]);
        })
    });

    describe('getParentRowsByCell', function() {
        beforeEach(function () {
            jasmine.getFixtures().set('<div id="my-table"></div>');
            this.tableContainer = $('#my-table').get()[0];
            this.options = {
                columns: [
                    {field: 'name', title: 'Name'},
                    {field: 'expenses', title: 'Expenses'}
                ],
                datas: [
                    {guid: 1, name: 'Brown', expenses: 1000, children: [
                        {name: 'Alice', expenses: 400},
                        {name: 'John', expenses: 600}
                    ]},
                    {guid: 1, name: 'Smith', expenses: 5000, children: [
                        {name: 'Jim', expenses: 1500},
                        {name: 'Bob', expenses: 2500, children: [
                            {name: 'car', expenses: 1000},
                            {name: 'house', expenses: 1000},
                            {name: 'dog', expenses: 500}
                        ]},
                        {name: 'Margaret', expenses: 1000}
                    ]}
                ],
                expandable: true
            };
        });

        it ('should get parent rows of a cell', function (){
            var dg = new Datagrid(this.tableContainer, this.options);

            $(dg.body.tbody).find('tr:eq(1) td:eq(0) .expand-children-button').mouseup();
            $(dg.body.tbody).find('tr:eq(3) td:eq(0) .expand-children-button').mouseup();

            var child_cell = $(dg.body.tbody).find('tr:eq(4) td:eq(0)');
            var parentDatas = dg.getParentRowsByCell(child_cell[0]);

            expect(parentDatas[0].get('name')).toBe('Smith');
            expect(parentDatas[1].get('name')).toBe('Bob');
        });

        it ('should get parent rows of a cell after table sort', function (){
            var dg = new Datagrid(this.tableContainer, this.options);

            dg.columns[0].sortAsc = false;
            dg.sort([0]);

            $(dg.body.tbody).find('tr:eq(0) td:eq(0) .expand-children-button').mouseup();
            $(dg.body.tbody).find('tr:eq(2) td:eq(0) .expand-children-button').mouseup();

            var child_cell = $(dg.body.tbody).find('tr:eq(3) td:eq(0)');
            var parentDatas = dg.getParentRowsByCell(child_cell[0]);

            expect(parentDatas[0].get('name')).toBe('Smith');
            expect(parentDatas[1].get('name')).toBe('Bob');
        });
    });
});