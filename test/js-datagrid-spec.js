/**
 *
 */

'use strict';

describe('Yet another datagrid Test Suite', function() {

	describe('Datagrid', function() {
		beforeEach(function() {

            // use synchronous code for testing
            YAD.defer = function(func) {func()};

            jasmine.getFixtures().set('<div id="my-table"></div>');
			this.tableContainer = $('#my-table').get()[0];
		});

		it('should initialize', function() {
			var opts = {};
			var dg = new Datagrid(this.tableContainer, opts);

			expect(dg.container).toEqual(this.tableContainer);

			expect(dg.datas).toEqual([]);
			expect(dg.columns).toEqual([]);
			expect(dg.length).toBe(0);

			expect(dg.options).toBeDefined();
			expect(dg.options).not.toBe(opts);
			expect(dg.options.datas).toBeUndefined();
		});

		it('should initialize and set columns', function() {
			var opts = {
				columns: [
					{ field: 'id', title: 'Identifier' },
					{ field: 'name', title: 'Name' }
				]
			};

			var dg = new Datagrid(this.tableContainer, opts);

			expect(dg.columns.length).toBe(2);
			expect(dg.options.columns).toBeUndefined();

			// Check columns
			expect(dg.columns[0].idx).toBe(0);
			expect(dg.columns[0].field).toBe('id');
			expect(dg.columns[0].title).toBe('Identifier');

			expect(dg.columns[1].idx).toBe(1);
			expect(dg.columns[1].field).toBe('name');
			expect(dg.columns[1].title).toBe('Name');
		});

        it ('should build internal dom structure', function () {
            var opts = {
                columns: [{field: 'id', title: 'id'}],
                datas: [{id: 1}]
            };

            var dg = new Datagrid(this.tableContainer, opts);

            var $table = $('#my-table'),
                head = $table.find('> .dt-head'),
                headWrapper = head.find('> .dt-head-wrapper'),
                body = $table.find('> .dt-body'),
                bodyWrapper = body.find('> .dt-body-wrapper');

            expect(dg.container).toBeTruthy();
            expect(dg.container).toEqual($table.get()[0]);
            expect($table.children().length).toBe(2);

            expect(dg.headContainer).toBeTruthy();
            expect(dg.headContainer).toEqual(head.get()[0]);
            expect(head.children().length).toBe(1);

            expect(dg.headWrapper).toBeTruthy();
            expect(dg.headWrapper).toEqual(headWrapper.get()[0]);

            expect(dg.bodyContainer).toBeTruthy();
            expect(dg.bodyContainer).toEqual(body.get()[0]);
            expect(body.children().length).toBe(1);

            expect(dg.bodyWrapper).toBeTruthy();
            expect(dg.bodyWrapper).toEqual(bodyWrapper.get()[0]);
        });

		it ('should build internal dom structure with frozen columns', function() {
			var opts = {
				columns: [
					{ field: 'id', title: 'Identifier' },
					{ field: 'name', title: 'Name' }
				],
				datas: [
					{id: 1, name: 'cell 1'}
				],
				frozenColumnsNum: 1
			};

			var dg = new Datagrid(this.tableContainer, opts);

            var $table = $('#my-table'),
                head = $table.find('> .dt-head'),
                body = $table.find('> .dt-body');

            expect(dg.container).toBeTruthy();
            expect(dg.container).toEqual($table.get()[0]);
            expect($table.children().length).toBe(2);

            expect($table.children(0)).toBe('div.dt-head');
            expect($table.children(1)).toBe('div.dt-body');

            expect(head.children(0)).toBe('div.dt-frozen-head-wrapper');
            expect(head.children(1)).toBe('div.dt-head-wrapper');

            expect(body.children(0)).toBe('div.dt-frozen-body-wrapper');
            expect(body.children(1)).toBe('div.dt-body-wrapper');
		});

		it('should initialize and render header', function() {

			var opts = {
				columns: [
					{ field: 'id', title: 'Identifier' },
					{ field: 'name', title: 'Name' },
					{ field: 'content', title: 'my ', headerRenderFunction: function(title) {return title + 'content'} }
				]
			};

			new Datagrid(this.tableContainer, opts);

			var tableHead = $('#my-table').find('.dt-head-wrapper thead').eq(1);
			expect(tableHead).toBeTruthy();

			// Header == 1 tr
			expect(tableHead.find('tr').get().length).toBe(1);

			var $th0 = tableHead.find('tr th').eq(0);
			expect($th0.attr('data-col-id')).toBe('0');
			expect($th0.text()).toBe('Identifier');

			var $th1 = tableHead.find('tr th').eq(1);
			expect($th1.attr('data-col-id')).toBe('1');
			expect($th1.text()).toBe('Name');

            var $th1 = tableHead.find('tr th').eq(2);
			expect($th1.attr('data-col-id')).toBe('2');
			expect($th1.text()).toBe('my content');
		});

        it('should add resize handlers for resizable columns', function() {

            var opts = {
                columns: [
                    { field: 'default', title: 'Resizable By Default' },
                    { field: 'sortable', title: 'Resizable Column', resizable: true },
                    { field: 'notsortable', title: 'Not Resizable Column', resizable: false}
                ]
            };

            new Datagrid(this.tableContainer, opts);
            var tableHead = $('#my-table').find('.dt-head-wrapper thead').eq(1);

            var $th0 = tableHead.find('tr th').eq(0);
            expect($th0).toContain('.dt-resize-handle-right');

            var $th1 = tableHead.find('tr th').eq(1);
            expect($th1).toContain('.dt-resize-handle-right');

            var $th2 = tableHead.find('tr th').eq(2);
            expect($th2).not.toContain('.dt-resize-handle-right');
        });

        it('should initialize and add datas', function() {
			var opts = {
				datas: [
					{ guid: 1 },
					{ guid: 2 },
					{ guid: 3 }
				]
			};

			var dg = new Datagrid(this.tableContainer, opts);

			expect(dg.datas.length).toEqual(3);
			expect(dg.length).toBe(3);
			expect(dg.options.datas).toBeUndefined();

			// Check datas
			expect(dg.datas[0].id).toBe(0);
			expect(dg.datas[0].visible).toBe(true);
			expect(dg.datas[0].obj).toBe(opts.datas[0]);
			expect(dg.datas[1].id).toBe(1);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[1].obj).toBe(opts.datas[1]);
			expect(dg.datas[2].id).toBe(2);
			expect(dg.datas[2].visible).toBe(true);
			expect(dg.datas[2].obj).toBe(opts.datas[2]);
		});

		it('should set datas and return this object', function() {
			var datas = [
				{ guid: 1 },
				{ guid: 2 },
				{ guid: 3 }
			];

			var dg = new Datagrid(this.tableContainer, {
				datas: datas
			});

			expect(dg.datas.length).toEqual(3);
			expect(dg.length).toBe(3);

			datas = [
				{ guid: 4 },
				{ guid: 5 }
			];

			var result = dg.set(datas);
			expect(result).toBe(dg);

			// Check datas
			expect(dg.datas.length).toEqual(2);
			expect(dg.length).toBe(2);

			expect(dg.datas[0].id).toBe(0);
			expect(dg.datas[0].obj).toBe(datas[0]);
			expect(dg.datas[1].id).toBe(1);
			expect(dg.datas[1].obj).toBe(datas[1]);
		});

		it('should add datas and return this object', function() {
			var datas1 = [
				{ guid: 1 },
				{ guid: 2 },
				{ guid: 3 }
			];

			var dg = new Datagrid(this.tableContainer, {
				datas: datas1
			});

			expect(dg.datas.length).toEqual(3);
			expect(dg.length).toBe(3);

			var datas2 = [
				{ guid: 4 },
				{ guid: 5 }
			];

			var result = dg.add(datas2);
			expect(result).toBe(dg);

			// Check datas
			expect(dg.datas.length).toEqual(5);
			expect(dg.length).toBe(5);

			expect(dg.datas[0].id).toBe(0);
			expect(dg.datas[0].obj).toBe(datas1[0]);
			expect(dg.datas[1].id).toBe(1);
			expect(dg.datas[1].obj).toBe(datas1[1]);
			expect(dg.datas[2].id).toBe(2);
			expect(dg.datas[2].obj).toBe(datas1[2]);
			expect(dg.datas[3].id).toBe(3);
			expect(dg.datas[3].obj).toBe(datas2[0]);
			expect(dg.datas[4].id).toBe(4);
			expect(dg.datas[4].obj).toBe(datas2[1]);
		});

		it('should add single data and return this object', function() {
			var datas = [
				{ guid: 1 },
				{ guid: 2 },
				{ guid: 3 }
			];

			var dg = new Datagrid(this.tableContainer, {
				datas: datas
			});

			expect(dg.datas.length).toEqual(3);
			expect(dg.length).toBe(3);

			var singleData = { guid: 4 };
			var result = dg.add(singleData);
			expect(result).toBe(dg);

			// Check datas
			expect(dg.datas.length).toEqual(4);
			expect(dg.length).toBe(4);

			expect(dg.datas[0].id).toBe(0);
			expect(dg.datas[0].obj).toBe(datas[0]);
			expect(dg.datas[1].id).toBe(1);
			expect(dg.datas[1].obj).toBe(datas[1]);
			expect(dg.datas[2].id).toBe(2);
			expect(dg.datas[2].obj).toBe(datas[2]);
			expect(dg.datas[3].id).toBe(3);
			expect(dg.datas[3].obj).toBe(singleData);
		});


		it('should render body of datagrid', function() {
			var dg = new Datagrid(this.tableContainer, {
				columns: [
					{ field: 'guid', title: 'Identifier' },
					{ field: 'name', title: 'Name' },
					{ field: 'money', title: 'Money', renderFunction: function(item) {return '$' + item;} }
				],
				datas: [
					{ guid: 1, name: 'foo', money: 100 },
					{ guid: 2, name: 'bar', money: 10 },
					{ guid: 3, name: '' }
				]
			});

			expect(dg.datas.length).toEqual(3);
			expect(dg.columns.length).toEqual(3);

			var tbody = $(dg.body.tbody);
			// 3 datas == 3 tr
			expect(tbody.find('tr').get().length).toBe(3);

			var $tr0 = tbody.find('tr').eq(0);
			expect($tr0.attr('data-data-id')).toBe('0');
			expect($tr0.find('td').length).toBe(3);
			expect($tr0.find('td').eq(0).html()).toBe('1');
			expect($tr0.find('td').eq(0).attr('data-col-id')).toBe('0');
			expect($tr0.find('td').eq(0).attr('data-data-id')).toBe('0');
			expect($tr0.find('td').eq(1).html()).toBe('foo');
			expect($tr0.find('td').eq(1).attr('data-col-id')).toBe('1');
			expect($tr0.find('td').eq(1).attr('data-data-id')).toBe('0');
			expect($tr0.find('td').eq(2).html()).toBe('$100');
			expect($tr0.find('td').eq(2).attr('data-col-id')).toBe('2');
			expect($tr0.find('td').eq(2).attr('data-data-id')).toBe('0');

			var $tr1 = tbody.find('tr').eq(1);
			expect($tr1.attr('data-data-id')).toBe('1');
			expect($tr1.find('td').length).toBe(3);
			expect($tr1.find('td').eq(0).html()).toBe('2');
			expect($tr1.find('td').eq(0).attr('data-col-id')).toBe('0');
			expect($tr1.find('td').eq(0).attr('data-data-id')).toBe('1');
			expect($tr1.find('td').eq(1).html()).toBe('bar');
			expect($tr1.find('td').eq(1).attr('data-col-id')).toBe('1');
			expect($tr1.find('td').eq(1).attr('data-data-id')).toBe('1');
			expect($tr1.find('td').eq(2).html()).toBe('$10');
			expect($tr1.find('td').eq(2).attr('data-col-id')).toBe('2');
			expect($tr1.find('td').eq(2).attr('data-data-id')).toBe('1');

			var $tr2 = tbody.find('tr').eq(2);
			expect($tr2.attr('data-data-id')).toBe('2');
			expect($tr2.find('td').length).toBe(3);
			expect($tr2.find('td').eq(0).html()).toBe('3');
			expect($tr2.find('td').eq(0).attr('data-col-id')).toBe('0');
			expect($tr2.find('td').eq(0).attr('data-data-id')).toBe('2');
			expect($tr2.find('td').eq(1).html()).toBe('&nbsp;');
			expect($tr2.find('td').eq(1).attr('data-col-id')).toBe('1');
			expect($tr2.find('td').eq(1).attr('data-data-id')).toBe('2');
			expect($tr2.find('td').eq(2).html()).toBe('$');
			expect($tr2.find('td').eq(2).attr('data-col-id')).toBe('2');
			expect($tr2.find('td').eq(2).attr('data-data-id')).toBe('2');
		});

		it('should not displayed filter datas (string)', function() {
			var dg = new Datagrid(this.tableContainer, {
				columns: [
					{ field: 'firstName', title: 'First Name' },
					{ field: 'lastName', title: 'Last Name' }
				],
				datas: [
					{ guid: 1, firstName: 'foo1', lastName: 'foo2' },
					{ guid: 2, firstName: 'bar1', lastName: 'bar2' },
					{ guid: 3}
				],
				filters: [
					{ field: 'firstName', value: 'foo' }
				]
			});

			var tbody = $(dg.body.tbody);

			expect(dg.datas.length).toEqual(3);
			expect(dg.columns.length).toEqual(2);
			expect(tbody.find('tr').get().length).toBe(2);

			expect(dg.datas[0].visible).toBe(false);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);

			var $tr0 = tbody.find('tr').eq(0);
			expect($tr0.find('td').eq(0).html()).toBe('bar1');
			expect($tr0.find('td').eq(0).attr('data-col-id')).toBe('0');
			expect($tr0.find('td').eq(1).html()).toBe('bar2');
			expect($tr0.find('td').eq(1).attr('data-col-id')).toBe('1');

			var $tr1 = tbody.find('tr').eq(1);
			expect($tr1.find('td').eq(0).html()).toBe('&nbsp;');
			expect($tr1.find('td').eq(0).attr('data-col-id')).toBe('0');
			expect($tr1.find('td').eq(1).html()).toBe('&nbsp;');
			expect($tr1.find('td').eq(1).attr('data-col-id')).toBe('1');
		});

		it('should not displayed filter datas (numbers)', function() {
			var dg = new Datagrid(this.tableContainer, {
				columns: [
					{ field: 'firstName', title: 'First Name' },
					{ field: 'lastName', title: 'Last Name' }
				],
				datas: [
					{ guid: 1, firstName: 'foo1', lastName: 'foo2' },
					{ guid: 2, firstName: 'bar1', lastName: 'bar2' },
					{ guid: 3}
				],
				filters: [
					{ field: 'guid', value: 1 }
				]
			});

			expect(dg.datas[0].visible).toBe(false);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);

			dg.addFilters({ field: 'guid', value: '1' }).render();
			expect(dg.datas[0].visible).toBe(false);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);
		});

		it('should not displayed filter datas (boolean)', function() {
			var dg = new Datagrid(this.tableContainer, {
				columns: [
					{ field: 'firstName', title: 'First Name' },
					{ field: 'lastName', title: 'Last Name' }
				],
				datas: [
					{ guid: 1, name: { firstName: 'foo1', lastName: 'foo2' }, flag: true },
					{ guid: 2, name: { firstName: 'bar1', lastName: 'bar2' }, flag: false },
					{ guid: 3, name: null, flag: false }
				],
				filters: [
					{ field: 'flag', value: true }
				]
			});

			expect(dg.datas[0].visible).toBe(false);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);

			dg.addFilters({ field: 'flag', value: 'true' }).render();
			expect(dg.datas[0].visible).toBe(false);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);
		});

		it('should not displayed filter datas (using equal filter)', function() {
			var dg = new Datagrid(this.tableContainer, {
				columns: [
					{ field: 'firstName', title: 'First Name' },
					{ field: 'lastName', title: 'Last Name' }
				],
				datas: [
					{ guid: 1, firstName: 'foo1', lastName: 'foo2' },
					{ guid: 2, firstName: 'bar1', lastName: 'bar2' },
					{ guid: 3}
				],
				filters: [
					{ field: 'firstName', type: 'equal', value: 'foo' }
				]
			});

			expect(dg.datas[0].visible).toBe(true);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);

			dg.addFilters({ field: 'firstName', type: 'equal', value: 'foo1' }).render();
			expect(dg.datas[0].visible).toBe(false);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);
		});

		it('should not displayed filter datas (using equal filter)', function() {
			var dg = new Datagrid(this.tableContainer, {
				columns: [
					{ field: 'firstName', title: 'First Name' },
					{ field: 'lastName', title: 'Last Name' }
				],
				datas: [
					{ guid: 1, firstName: 'foo1', lastName: 'foo2' },
					{ guid: 2, firstName: 'bar1', lastName: 'bar2' },
					{ guid: 3}
				],
				filters: [
					{ field: 'firstName', type: 'equal', value: 'foo' }
				]
			});

			expect(dg.datas[0].visible).toBe(true);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);

			dg.addFilters({ field: 'firstName', type: 'equal', value: 'foo1' }).render();
			expect(dg.datas[0].visible).toBe(false);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);
		});

		it('should not displayed filter datas (using \'in\' filter)', function() {
			var dg = new Datagrid(this.tableContainer, {
				columns: [
					{ field: 'firstName', title: 'First Name' },
					{ field: 'lastName', title: 'Last Name' }
				],
				datas: [
					{ guid: 1, firstName: 'foo1', lastName: 'foo2' },
					{ guid: 2, firstName: 'bar1', lastName: 'bar2' },
					{ guid: 3 }
				],
				filters: [
					{ field: 'firstName', type: 'in', value: ['foo1', 'bar'] }
				]
			});

			expect(dg.datas[0].visible).toBe(false);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[2].visible).toBe(true);
		});

        it('should sort', function() {
            var dg = new Datagrid(this.tableContainer, {
                columns: [
                    { field: 'firstName', title: 'First Name' },
                    { field: 'lastName', title: 'Last Name' }
                ],
                datas: [
                    { guid: 1, firstName: 'foo1', lastName: 'foo2' },
                    { guid: 2, firstName: 'bar1', lastName: 'bar2' },
                    { guid: 3, firstName: 'baz1', lastName: 'baz2' }
                ]
            });

            var tbody = $(dg.body.tbody);

            expect(tbody.find('tr:eq(0) td:eq(0)')).toHaveText('foo1');
            expect(tbody.find('tr:eq(1) td:eq(0)')).toHaveText('bar1');
            expect(tbody.find('tr:eq(2) td:eq(0)')).toHaveText('baz1');

            // sort by first column
            dg.sort([0]);

            expect(tbody.find('tr:eq(0) td:eq(0)')).toHaveText('bar1');
            expect(tbody.find('tr:eq(1) td:eq(0)')).toHaveText('baz1');
            expect(tbody.find('tr:eq(2) td:eq(0)')).toHaveText('foo1');

        });

        it('should reuse dom elements by default', function() {
            var dg = new Datagrid(this.tableContainer, {
                columns: [
                    { field: 'firstName', title: 'First Name' },
                    { field: 'lastName', title: 'Last Name' }
                ],
                datas: [
                    { guid: 1, firstName: 'foo1', lastName: 'foo2' },
                    { guid: 2, firstName: 'bar1', lastName: 'bar2' },
                    { guid: 3, firstName: 'baz1', lastName: 'baz2' }
                ]
            });

            var before_sort, after_sort;

            before_sort = Array.prototype.slice.call(dg.body.tbody.childNodes, 0);

            // sort by first column
            dg.sort([0]);

            after_sort = Array.prototype.slice.call(dg.body.tbody.childNodes, 0);

            expect(before_sort[0]).toBe(after_sort[2]);
            expect(before_sort[1]).toBe(after_sort[0]);
            expect(before_sort[2]).toBe(after_sort[1]);
        })
	});

	describe('Datagrid sizing mechanism', function() {
		beforeEach(function() {
			jasmine.getFixtures().set('<div id="my-table" width="400px" height="400px"></div>');
			$('html').append('<link rel="stylesheet" href="../src/css/grid.css">');
			this.tableContainer = $('#my-table').get()[0];
		});

		it('should set equal srollWidth for head wrapper and body wrapper', function() {
			var opts = {
				columns: [
					{ field: 'id', title: 'Identifier' },
					{ field: 'name', title: 'Name' }
				],
				datas: [
					{id: 1, name: 'cell 1'}
				],
				frozenColumnsNum: 1,
				tableClass: 'table table-striped table-bordered'
			};
			var dg = new Datagrid(this.tableContainer, opts);
			expect(dg.headWrapper.scrollWidth).toEqual(dg.bodyWrapper.scrollWidth);
		});

		it('should have equal scrollWidth for head wrapper and body wrapper with big number of columns', function() {
			var opts = {
				columns: [
					{ field: 'id', title: 'Identifier' },
					{ field: 'name', title: 'Name' },
					{ field: 'col1', title: 'Column 1' },
					{ field: 'col2', title: 'Column 2' },
					{ field: 'col3', title: 'Column 3' },
					{ field: 'col4', title: 'Column 4' },
					{ field: 'col5', title: 'Column 5' }
				],
				datas: [
					{id: 1, name: 'cell 1', col1: 'content 1', col2: 'content 2', col3: 'content 3', col4: 'content 4', col5: 'content5'},
					{id: 1, name: 'cell 1', col1: 'content 1', col2: 'content 2', col3: 'content 3', col4: 'content 4', col5: 'content5'}
				],
				frozenColumnsNum: 1,
				tableClass: 'table table-striped table-bordered'
			};
			var dg = new Datagrid(this.tableContainer, opts);
			expect(dg.headWrapper.scrollWidth).toEqual(dg.bodyWrapper.scrollWidth);
		});

        it ('should have equal column heights for ordinal and empty columns', function () {
            var opts = {
                columns: [
                    {field: 'a', title: 'a'},
                    {field: 'b', title: 'b'}
                ],
                datas: [
                    {a: 'content', b: 'content'},
                    {a: '', b: ''}
                ]
            };

            var dg = new Datagrid(this.tableContainer, opts);
            var col1 = $(dg.body.tbody).find('tr:eq(0) td:eq(0)'),
                col2 = $(dg.body.tbody).find('tr:eq(1) td:eq(0)');

            expect(col1.height()).toBe(col2.height());
        })
	});


	describe('Expandable datagrid', function() {

		beforeEach(function() {
			jasmine.getFixtures().set('<div id="my-table"></div>');
			this.tableContainer = $('#my-table').get()[0];
			this.dg = new Datagrid(this.tableContainer, {
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
			});
		});

		it('should have expand buttons for each row with children', function() {
			var dg = this.dg;
			function rows() {
				return $(dg.body.tbody).find('tr');
			}

			expect(rows().get().length).toBe(2);
			expect(rows().eq(0).find('.expand-children-button').get().length).toBe(1);
			expect(rows().eq(1).find('.expand-children-button').get().length).toBe(1);
		});

        it('should change expand icon to collapse icon on expand/collapse', function() {
            var dg = this.dg,
                toggle_collapse = $(dg.body.tbody).find('tr:eq(0) td:eq(0) .expand-children-button');

            expect(toggle_collapse).toHaveText('⊞');

            toggle_collapse.parent().mouseup();

            expect(toggle_collapse).toHaveText('⊟');

        });

		it('should expand and collapse children on click', function() {
			var dg = this.dg;
			function rows() {
				return $(dg.body.tbody).find('tr');
			}

            expect(rows().get().length).toBe(2);
            expect($('#my-table').find('.dt-right-filler td').length).toBe(2);

			// expand second row children
			rows().eq(1).find('.expand-children-button').mouseup();

			expect(rows().get().length).toBe(5);
            expect($('#my-table').find('.dt-right-filler td').length).toBe(5);


            var $row1 = rows().eq(1),
				$row2 = rows().eq(2),
				$row3 = rows().eq(3);

			expect($row1.attr('data-data-id')).toBe('1');
			expect($row1.find('td').eq(0).text()).toMatch(/.*?Smith/);
			expect($row1.find('td').eq(1).text()).toBe('5000');

			expect($row2.attr('data-parents')).toBe('1');
			expect($row2.find('td').eq(0).text()).toMatch(/.*?Jim/);
			expect($row2.find('td').eq(1).text()).toBe('1500');
			expect($row2.find('.expand-children-button').get().length).toBe(0);

			expect($row3.attr('data-parents')).toBe('1');
			expect($row3.find('td').eq(0).text()).toMatch(/.*?Bob/);
			expect($row3.find('td').eq(1).text()).toBe('2500');
			expect($row3.find('.expand-children-button').get().length).toBe(1);

			// collapse second row
			rows().eq(1).find('.expand-children-button').mouseup();
			expect(rows().get().length).toBe(2);
            expect($('#my-table').find('.dt-right-filler td').length).toBe(2);
        });

		it('should find data element by cell', function() {
			var dg = this.dg;
			function rows() {
				return $(dg.body.tbody).find('tr');
			}

			// expand second row children
			rows().eq(1).find('.expand-children-button').mouseup();
			expect(dg.getRowDataByCell(rows().eq(1).find('td').eq(0)[0]).get('name')).toBe('Smith');

			var childData = dg.getRowDataByCell(rows().eq(2).find('td').eq(0)[0]);
			expect(childData).toBeDefined();
			expect(childData.get('name')).toBe('Jim');
		});

		it('should expand third level', function() {
			var dg = this.dg;
			function rows() {
				return $(dg.body.tbody).find('tr');
			}

			// expand second second level
			rows().eq(1).find('.expand-children-button').mouseup();
			expect(rows().get().length).toBe(5);

			// expand third level
			rows().eq(3).find('.expand-children-button').mouseup();
			expect(rows().get().length).toBe(8);

			var $row = rows().eq(4);
			expect($row.attr('data-parents')).toBe('1,1');
			expect($row.find('td').eq(0).text()).toMatch(/.*?car/);
			expect($row.find('td').eq(1).text()).toBe('1000');
			expect($row.find('.expand-children-button').get().length).toBe(0);
		});

        it('should expand all if expandAll was called', function() {
            var dg = this.dg;
            function rows() {
                return $(dg.body.tbody).find('tr');
            }

            expect(rows().get().length).toBe(2);

            dg.expandAll(dg.datas, true);
            dg.render();
            expect(rows().get().length).toBe(10);

            dg.expandAll(dg.datas, false);
            dg.render();
            expect(rows().get().length).toBe(2);
        });
	});

    describe('Expandable datagrid with frozen column', function() {

		beforeEach(function() {
			jasmine.getFixtures().set('<div id="my-table"></div>');
			this.tableContainer = $('#my-table').get()[0];
			this.dg = new Datagrid(this.tableContainer, {
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
				expandable: true,
                frozenColumnsNum: 1
			});
		});

		it('should have expand buttons for each row with children', function() {
			var dg = this.dg;
			function rows() {
				return $(dg.frozenBody.tbody).find('tr');
			}

			expect(rows().get().length).toBe(2);
			expect(rows().eq(0)).toContain('.expand-children-button');
			expect(rows().eq(1)).toContain('.expand-children-button');
		});

		it('should expand and collapse children on click', function() {
			var dg = this.dg;

			// expand second row children
            $(dg.frozenBody.tbody).find('tr:eq(1) .expand-children-button').mouseup();

            var rows = $(dg.frozenBody.tbody).find('tr');
            expect(rows.get().length).toBe(5);


			expect($(dg.frozenBody.tbody).find('tr:eq(0)')).toHaveData('data-id', '0');
			expect($(dg.frozenBody.tbody).find('tr:eq(0) td:eq(0)').text()).toMatch(/.*?Brown/);
            expect($(dg.body.tbody).find('tr:eq(0) td:eq(0)')).toHaveText('1000');

            expect($(dg.frozenBody.tbody).find('tr:eq(1)')).toHaveData('data-id', '1');
			expect($(dg.frozenBody.tbody).find('tr:eq(1) td:eq(0)').text()).toMatch(/.*?Smith/);
            expect($(dg.body.tbody).find('tr:eq(1) td:eq(0)')).toHaveText('5000');

            expect($(dg.frozenBody.tbody).find('tr:eq(2)')).toHaveData('data-id', '0');
            expect($(dg.frozenBody.tbody).find('tr:eq(2)')).toHaveData('parents', '1');
			expect($(dg.frozenBody.tbody).find('tr:eq(2) td:eq(0)')).toHaveText(/.*?Jim/);
            expect($(dg.frozenBody.tbody).find('tr:eq(2)')).not.toContain('.expand-children-button');
            expect($(dg.body.tbody).find('tr:eq(2) td:eq(0)')).toHaveText('1500');

            expect($(dg.frozenBody.tbody).find('tr:eq(3)')).toHaveData('data-id', '1');
            expect($(dg.frozenBody.tbody).find('tr:eq(3)')).toHaveData('parents', '1');
            expect($(dg.frozenBody.tbody).find('tr:eq(3) td:eq(0)')).toHaveText(/.*?Bob/);
            expect($(dg.frozenBody.tbody).find('tr:eq(3)')).toContain('.expand-children-button');
            expect($(dg.body.tbody).find('tr:eq(3) td:eq(0)')).toHaveText('2500');

            // collapse second row
            $(dg.frozenBody.tbody).find('tr:eq(1) td:eq(0)').find('.expand-children-button').mouseup();
			expect($(dg.frozenBody.tbody).find('tr').get().length).toBe(2);
		});

		it('should find data element by cell', function() {
			var dg = this.dg;
            var rows = $(dg.frozenBody.tbody).find('tr');

            // expand second row children
			rows.eq(1).find('.expand-children-button').mouseup();
            rows = $(dg.frozenBody.tbody).find('tr');

			expect(dg.getRowDataByCell(rows.eq(1).find('td').eq(0)[0]).get('name')).toBe('Smith');

			var childData = dg.getRowDataByCell(rows.eq(2).find('td').eq(0)[0]);
			expect(childData).toBeDefined();
			expect(childData.get('name')).toBe('Jim');
		});

		it('should expand third level', function() {
			var dg = this.dg,
                rows = $(dg.frozenBody.tbody).find('tr');

			// expand second second level
			rows.eq(1).find('.expand-children-button').mouseup();

            rows = $(dg.frozenBody.tbody).find('tr');
			expect(rows.get().length).toBe(5);

			// expand third level
			rows.eq(3).find('.expand-children-button').mouseup();
            rows = $(dg.frozenBody.tbody).find('tr');

			expect(rows.get().length).toBe(8);

            expect($(dg.frozenBody.tbody).find('tr:eq(4)')).toHaveData('data-id', '0');
            expect($(dg.frozenBody.tbody).find('tr:eq(4)')).toHaveData('parents', '1,1');
            expect($(dg.frozenBody.tbody).find('tr:eq(4) td:eq(0)')).toHaveText(/.*?car/);
            expect($(dg.frozenBody.tbody).find('tr:eq(4)')).not.toContain('.expand-children-button');
            expect($(dg.body.tbody).find('tr:eq(4) td:eq(0)')).toHaveText('1000');
        });

        it('should remove all child columns all collapse', function() {
            var dg = this.dg;
            expect($(dg.frozenBody.tbody).find('tr').get().length).toBe(2);

            expect($(dg.body.tbody).find('tr').get().length).toBe(2);
            // expand second second level
            $(dg.frozenBody.tbody).find('tr').eq(1).find('.expand-children-button').mouseup();

            // expand third level
            $(dg.frozenBody.tbody).find('tr').eq(3).find('.expand-children-button').mouseup();
            expect($(dg.frozenBody.tbody).find('tr').get().length).toBe(8);

            expect($(dg.body.tbody).find('tr').get().length).toBe(8);

            // collapse
            $(dg.frozenBody.tbody).find('tr').eq(1).find('.expand-children-button').mouseup();
            expect($(dg.frozenBody.tbody).find('tr').get().length).toBe(2);
            expect($(dg.body.tbody).find('tr').get().length).toBe(2);
        });
    });

    describe('Datagrid with grouped columns', function() {
        beforeEach(function() {
            jasmine.getFixtures().set('<div id="my-table"></div>');
            this.tableContainer = $('#my-table').get()[0];
        });

        it ('should use frozenColumnsNum property for column groups', function() {
            var columns = [
                {title: 'group A', columns: [{title: 'nested A1', field: 'A1'}, {title: 'nested A2', field: 'A2'}]},
                {title: 'group B', columns: [{title: 'nested B1', field: 'B1'}, {title: 'nested B2', field: 'B2'}]},
                {title: 'group C', columns: [{title: 'nested C1', field: 'C1'}, {title: 'nested C2', field: 'C2'}]}
                ],
                data = [
                    {A1: 10, A2: 20, A3: 30, A4: 40}
                ];
            var dg = new Datagrid(this.tableContainer, {columns: columns, datas: data, frozenColumnsNum: 2});


            expect(dg.frozenColumns.length).toBe(4);
            expect(dg.ordinalColumns.length).toBe(2);

            expect($(dg.frozenHead.thead).find('tr:eq(0) th:eq(0)')).toHaveText('group A');

            var nestedA = $(dg.frozenHead.thead).find('tr:eq(1)');
            expect(nestedA.find('th:eq(0)')).toHaveText('nested A1');
            expect(nestedA.find('th:eq(0)')).toHaveData('col-id', 0);

            expect(nestedA.find('th:eq(1)')).toHaveText('nested A2');
            expect(nestedA.find('th:eq(1)')).toHaveData('col-id', 1);

            expect(nestedA.find('th:eq(2)')).toHaveText('nested B1');
            expect(nestedA.find('th:eq(2)')).toHaveData('col-id', 2);

            expect(nestedA.find('th:eq(3)')).toHaveText('nested B2');
            expect(nestedA.find('th:eq(3)')).toHaveData('col-id', 3);

            var nestedB = $(dg.head.thead).find('tr:eq(1)');
            expect(nestedB.find('th:eq(0)')).toHaveText('nested C1');
            expect(nestedB.find('th:eq(0)')).toHaveData('col-id', 4);

            expect(nestedB.find('th:eq(1)')).toHaveText('nested C2');
            expect(nestedB.find('th:eq(1)')).toHaveData('col-id', 5);
        })

    });
	describe('autoResizeColumn',function(){
		var container;
		var datagrid
			beforeEach(function(){
				jasmine.getFixtures().set('<div id="my-table"></div>');
				container=$('#my-table').get()[0];
				var columns = [
						{title: 'First Col blablablablabla' , width: 12, field: 'A2',resizable: true },
						{title: 'Hello' , width: 12, field: 'B2',resizable: true }
					],
					data = [
						{A2: 'Hello world',B2: "Hello world"}
					];
				datagrid= new Datagrid(container, {columns: columns, datas: data, frozenColumnsNum: 2});
			});
		it('should call autoResize on double click on header',function(){

			spyOn(datagrid, 'autoResize');
			$(datagrid.headContainer).find('.dt-resize-handle').trigger('dblclick');
			expect(datagrid.autoResize).toHaveBeenCalledWith(0);
		});
		it('should resize the column that was tapped',function(){
			$(datagrid.headContainer).find('.dt-resize-handle-right').trigger('dblclick');
			var RowWidth1=$(datagrid.headContainer).find('tr [data-col-id=0]').width();
			var RowWidth2=$(datagrid.headContainer).find('tr [data-col-id=1]').width();
			expect(RowWidth1>RowWidth2).toBeTruthy();
		});
		it('should resize the neighboring column of column that was tapped',function(){
			$(datagrid.headContainer).find('.dt-resize-handle-left').trigger('dblclick');
			var RowWidth1=$(datagrid.headContainer).find('tr [data-col-id=0]').width();
			var RowWidth2=$(datagrid.headContainer).find('tr [data-col-id=1]').width();
			expect(RowWidth1>RowWidth2).toBeTruthy();
		});
		it('auxiliary table should be deleeted from document',function(){
			expect($('#mytable')).not.toExist();
		});
	});
});
