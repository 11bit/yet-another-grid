/**
 *
 */

'use strict';

describe('Yet another datagrid Test Suite', function() {

	describe('Datagrid', function() {
		beforeEach(function() {
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

		it ('should build internal dom structure', function() {
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
			
			expect(dg.container).toEqual($('#my-table').get()[0]);

			expect(dg.headContainer).toBeTruthy();
			expect(dg.headContainer).toEqual($('#my-table > .dt-head').get()[0]);

			expect(dg.frozenHeadWrapper).toBeTruthy();
			expect(dg.frozenHeadWrapper).toEqual($('#my-table .dt-head > .dt-frozen-head-wrapper').get()[0]);

			expect(dg.headWrapper).toBeTruthy();
			expect(dg.headWrapper).toEqual($('#my-table .dt-head > .dt-head-wrapper').get()[0]);

			expect(dg.bodyContainer).toBeTruthy();
			expect(dg.bodyContainer).toEqual($('#my-table > .dt-body').get()[0]);

		});

		it('should initialize and render header', function() {

			var opts = {
				columns: [
					{ field: 'id', title: 'Identifier' },
					{ field: 'name', title: 'Name' }
				]
			};

			var dg = new Datagrid(this.tableContainer, opts);

			var tableHead = $('#my-table .dt-head-wrapper thead').first();
			expect(tableHead).toBeTruthy();

			// Header == 1 tr
			expect(tableHead.find('tr').get().length).toBe(1);

			var $th0 = tableHead.find('tr th').eq(0);
			expect($th0.attr('data-col-id')).toBe('0');
			expect($th0.text()).toBe('Identifier');

			var $th1 = tableHead.find('tr th').eq(1);
			expect($th1.attr('data-col-id')).toBe('1');
			expect($th1.text()).toBe('Name');
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
			expect(dg.datas[0].id).toBe(1);
			expect(dg.datas[0].visible).toBe(true);
			expect(dg.datas[0].obj).toBe(opts.datas[0]);
			expect(dg.datas[1].id).toBe(2);
			expect(dg.datas[1].visible).toBe(true);
			expect(dg.datas[1].obj).toBe(opts.datas[1]);
			expect(dg.datas[2].id).toBe(3);
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

			expect(dg.datas[0].id).toBe(1);
			expect(dg.datas[0].obj).toBe(datas[0]);
			expect(dg.datas[1].id).toBe(2);
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

			expect(dg.datas[0].id).toBe(1);
			expect(dg.datas[0].obj).toBe(datas1[0]);
			expect(dg.datas[1].id).toBe(2);
			expect(dg.datas[1].obj).toBe(datas1[1]);
			expect(dg.datas[2].id).toBe(3);
			expect(dg.datas[2].obj).toBe(datas1[2]);
			expect(dg.datas[3].id).toBe(4);
			expect(dg.datas[3].obj).toBe(datas2[0]);
			expect(dg.datas[4].id).toBe(5);
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

			expect(dg.datas[0].id).toBe(1);
			expect(dg.datas[0].obj).toBe(datas[0]);
			expect(dg.datas[1].id).toBe(2);
			expect(dg.datas[1].obj).toBe(datas[1]);
			expect(dg.datas[2].id).toBe(3);
			expect(dg.datas[2].obj).toBe(datas[2]);
			expect(dg.datas[3].id).toBe(4);
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
			expect($tr0.attr('data-data-id')).toBe('1');
			expect($tr0.find('td').length).toBe(3);
			expect($tr0.find('td').eq(0).html()).toBe('1');
			expect($tr0.find('td').eq(0).attr('data-col-id')).toBe('0');
			expect($tr0.find('td').eq(0).attr('data-data-id')).toBe('1');
			expect($tr0.find('td').eq(1).html()).toBe('foo');
			expect($tr0.find('td').eq(1).attr('data-col-id')).toBe('1');
			expect($tr0.find('td').eq(1).attr('data-data-id')).toBe('1');
			expect($tr0.find('td').eq(2).html()).toBe('$100');
			expect($tr0.find('td').eq(2).attr('data-col-id')).toBe('2');
			expect($tr0.find('td').eq(2).attr('data-data-id')).toBe('1');

			var $tr1 = tbody.find('tr').eq(1);
			expect($tr1.attr('data-data-id')).toBe('2');
			expect($tr1.find('td').length).toBe(3);
			expect($tr1.find('td').eq(0).html()).toBe('2');
			expect($tr1.find('td').eq(0).attr('data-col-id')).toBe('0');
			expect($tr1.find('td').eq(0).attr('data-data-id')).toBe('2');
			expect($tr1.find('td').eq(1).html()).toBe('bar');
			expect($tr1.find('td').eq(1).attr('data-col-id')).toBe('1');
			expect($tr1.find('td').eq(1).attr('data-data-id')).toBe('2');
			expect($tr1.find('td').eq(2).html()).toBe('$10');
			expect($tr1.find('td').eq(2).attr('data-col-id')).toBe('2');
			expect($tr1.find('td').eq(2).attr('data-data-id')).toBe('2');

			var $tr2 = tbody.find('tr').eq(2);
			expect($tr2.attr('data-data-id')).toBe('3');
			expect($tr2.find('td').length).toBe(3);
			expect($tr2.find('td').eq(0).html()).toBe('3');
			expect($tr2.find('td').eq(0).attr('data-col-id')).toBe('0');
			expect($tr2.find('td').eq(0).attr('data-data-id')).toBe('3');
			expect($tr2.find('td').eq(1).html()).toBe(' ');
			expect($tr2.find('td').eq(1).attr('data-col-id')).toBe('1');
			expect($tr2.find('td').eq(1).attr('data-data-id')).toBe('3');
			expect($tr2.find('td').eq(2).html()).toBe('$');
			expect($tr2.find('td').eq(2).attr('data-col-id')).toBe('2');
			expect($tr2.find('td').eq(2).attr('data-data-id')).toBe('3');
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
			expect($tr1.find('td').eq(0).html()).toBe(' ');
			expect($tr1.find('td').eq(0).attr('data-col-id')).toBe('0');
			expect($tr1.find('td').eq(1).html()).toBe(' ');
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

		it('should have equal srollWidth for head wrapper and body wrapper with big number of columns', function() {
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
	});

	describe('Expandable datagrid', function() {
		return;

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
			})
		});

		it("should have expand buttons for each row with children", function() {
			var dg = this.dg;
			function rows() {
				return $(dg.table).find('> tbody tr');
			}

			expect(rows().get().length).toBe(2);
			expect(rows().eq(0).find('.expand-children-button').get().length).toBe(1);
			expect(rows().eq(1).find('.expand-children-button').get().length).toBe(1);
		});

		it("should expand and collapse children on click", function() {
			var dg = this.dg;
			function rows() {
				return $(dg.table).find('> tbody tr');
			}

			// expand second row children
			rows().eq(1).find('.expand-children-button').click();
			expect(rows().get().length).toBe(5);
			
			var $row1 = rows().eq(1),
				$row2 = rows().eq(2),
				$row3 = rows().eq(3);

			expect($row1.attr('data-data-id')).toBe('2')
			expect($row1.find('td').eq(0).text()).toMatch(/.*?Smith/);
			expect($row1.find('td').eq(1).text()).toBe('5000');

			expect($row2.attr('data-parents')).toBe('2')
			expect($row2.find('td').eq(0).text()).toMatch(/.*?Jim/);
			expect($row2.find('td').eq(1).text()).toBe('1500');
			expect($row2.find('.expand-children-button').get().length).toBe(0)

			expect($row3.attr('data-parents')).toBe('2')
			expect($row3.find('td').eq(0).text()).toMatch(/.*?Bob/);
			expect($row3.find('td').eq(1).text()).toBe('2500');
			expect($row3.find('.expand-children-button').get().length).toBe(1)

			// collapse second row
			$(dg.table).find('> tbody tr').eq(1).find('.expand-children-button').click();
			expect(rows().get().length).toBe(2);
		})	

		it("should find data element by cell", function() {
			var dg = this.dg;
			function rows() {
				return $(dg.table).find('> tbody tr');
			}

			// expand second row children
			rows().eq(1).find('.expand-children-button').click();
			expect(dg.getRowDataByCell(rows().eq(1).find('td').eq(0)[0]).get('name')).toBe('Smith');

			var childData = dg.getRowDataByCell(rows().eq(2).find('td').eq(0)[0]);
			expect(childData).toBeDefined();
			expect(childData.get('name')).toBe('Jim');
		});


		it("should expand third level", function() {
			var dg = this.dg;
			function rows() {
				return $(dg.table).find('> tbody tr');
			}

			// expand second second level
			rows().eq(1).find('.expand-children-button').click();
			expect(rows().get().length).toBe(5);

			// expand third level
			rows().eq(3).find('.expand-children-button').click();
			expect(rows().get().length).toBe(8);

			var $row = rows().eq(4);
			expect($row.attr('data-parents')).toBe('2,1')
			expect($row.find('td').eq(0).text()).toMatch(/.*?car/);
			expect($row.find('td').eq(1).text()).toBe('1000');
			expect($row.find('.expand-children-button').get().length).toBe(0)
		})
	})

});
