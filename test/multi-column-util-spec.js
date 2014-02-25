'use strict';

describe('Multi Column Util Test Suite', function() {

	beforeEach(function() {
		this.MultiColumnUtil = window.YAD.MultiColumnUtil;
	});

	it ('should expose MultiColumnUtil object', function() {
		expect(this.MultiColumnUtil).toBeDefined();
	});

	it ('should work with flat column structure', function() {
		var columns = [
			{title: 'First Col'},
			{title: 'Second Col'},
			{title: 'Third Col'}
		];
		var result = [[
			{title: 'First Col'},
			{title: 'Second Col'},
			{title: 'Third Col'}
		]];
		expect(this.MultiColumnUtil.splitLayers(columns)).toEqual(result);
	});

	it ('should work with hierarhical column structure', function() {
		var columns = [
			{title: 'First Col', columns: [{title: 'First Child A'}, {title: 'Second Child A'}]},
			{title: 'Second Col', columns: [{title: 'First Child B'}, {title: 'Second Child B'}, {title: 'Third Child B'}]}
		];
		var result = [
			[{title: 'First Col', colspan: 2}, {title: 'Second Col', colspan: 3}],
			[{title: 'First Child A'}, {title: 'Second Child A'}, {title: 'First Child B'}, {title: 'Second Child B'}, {title: 'Third Child B'}]
		];
		expect(this.MultiColumnUtil.splitLayers(columns)).toEqual(result);
	});

	it ('should not set colspan if there is no children columns', function() {
		var res = this.MultiColumnUtil.splitLayers([{title: 'column 1'}]);
		expect(res[0][0].colspan).toBeUndefined();
	});

	it ('should not set colspan if there is only one child', function() {
		var res = this.MultiColumnUtil.splitLayers([{title: 'column 1', columns: [{title: 'child col'}]}]);
		expect(res[0][0].colspan).toBeUndefined();
	});

	it ('should set colspan for top element to the total number of columns', function() {
		var columns = [
			{title: 'Top', columns: [
				{title: 'Second A', columns: [{title: 'Third A'}, {title: 'Third B'}]},
				{title: 'Second B', columns: [{title: 'Third C'}]}
			]}
		];

		var res = this.MultiColumnUtil.splitLayers(columns);
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
		var res = this.MultiColumnUtil.splitLayers(columns);

		expect(res[0][0].rowspan).toBe(3);
		expect(res[0][1].rowspan).toBe(2);
		expect(res[0][2].rowspan).toBeUndefined();
	});

});