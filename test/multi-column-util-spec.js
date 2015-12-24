'use strict';

describe('Multi Column Util Test Suite', function() {

	beforeEach(function() {
		this.GroupedColumnUtil = window.YAD.GroupedColumnUtil;
	});

	it ('should expose GroupedColumnUtil object', function() {
		expect(this.GroupedColumnUtil).toBeDefined();
	});

	it ('should work with flat column structure', function() {
		var columns = [
			{title: 'First Col'},
			{title: 'Second Col'},
			{title: 'Third Col'}
		];
		var result = [[
			{title: 'First Col', isColumn: true},
			{title: 'Second Col', isColumn: true},
			{title: 'Third Col', isColumn: true}
		]];
		expect(this.GroupedColumnUtil.buildHeadStructure(columns)).toEqual(result);
	});

	it ('should work with hierarhical column structure', function() {
		var columns = [
			{title: 'First Col', columns: [{title: 'First Child A'}, {title: 'Second Child A'}]},
			{title: 'Second Col', columns: [{title: 'First Child B'}, {title: 'Second Child B'}, {title: 'Third Child B'}]}
		];
		var result = [
			[
				{title: 'First Col', colspan: 2, columnGroup : true, firstColInGroup: {title: 'First Child A', isColumn: true}, lastColInGroup: {title: 'Second Child A', isColumn: true}},
				{title: 'Second Col', colspan: 3, columnGroup : true, firstColInGroup: {title: 'First Child B', isColumn: true}, lastColInGroup: {title: 'Third Child B', isColumn: true}}
		],
			[
				{title: 'First Child A', isColumn: true},
				{title: 'Second Child A', isColumn: true},
				{title: 'First Child B', isColumn: true},
				{title: 'Second Child B', isColumn: true},
				{title: 'Third Child B', isColumn: true}]
		];
		expect(this.GroupedColumnUtil.buildHeadStructure(columns)).toEqual(result);
	});

	it ('should not set colspan if there is no children columns', function() {
		var res = this.GroupedColumnUtil.buildHeadStructure([{title: 'column 1'}]);
		expect(res[0][0].colspan).toBeUndefined();
	});

	it ('should not set colspan if there is only one child', function() {
		var res = this.GroupedColumnUtil.buildHeadStructure([{title: 'column 1', columns: [{title: 'child col'}]}]);
		expect(res[0][0].colspan).toBeUndefined();
	});

	it ('should set colspan for top element to the total number of columns', function() {
		var columns = [
			{title: 'Top', columns: [
				{title: 'Second A', columns: [{title: 'Third A'}, {title: 'Third B'}]},
				{title: 'Second B', columns: [{title: 'Third C'}]}
			]}
		];

		var res = this.GroupedColumnUtil.buildHeadStructure(columns);
		expect(res[0][0].colspan).toBe(3);
		expect(res[1][0].colspan).toBe(2);
		expect(res[1][1].colspan).toBeUndefined();
	});

	it ('should normalize rowspans to one level', function() {
		var columns = [
			{title: 'No grouping'},
			{title: 'Grouped', columns: [{title: 'c1'}, {title: 'c2'}]},
			{title: 'Grouped Three Levels', columns: [{title: 'c1', columns: [{title: 'c11'}]}]}
		];
		var res = this.GroupedColumnUtil.buildHeadStructure(columns);

		expect(res[0][0].rowspan).toBe(3);
		expect(res[0][1].rowspan).toBe(2);
		expect(res[0][2].rowspan).toBeUndefined();
	});

	it ('should normalize number of rows in different header structures', function() {
		var headA = [[{title: 'col1'}, {title: 'col2'}]],
			headB = [[{title: 'row1col1'}, {title: 'row1col2'}], [{title: 'row2col1'}, {title: 'row2col2'}]];

		this.GroupedColumnUtil.normalizeHeights(headA, headB);
		
		expect(headA.length).toBe(2);
		expect(headA[0].length).toBe(1);
		expect(headA[0][0].colspan).toBe(2);
	})

});