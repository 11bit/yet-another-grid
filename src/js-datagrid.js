/**
 *
 */

'use strict';

(function(window, document, undefined, $) {

	// Save bytes in the minified
	var arrayProto = Array.prototype,
		slice = arrayProto.slice;

	// Constants
	var ATTR_COLUMN_ID = 'col-id';
	var ATTR_DATA_ID = 'data-id';
	var ATTR_PARENTS = 'parents';
	var MIN_COL_WIDTH = 40; //px

	/**
	 * No Operation function.
	 * @private
	 */
	var noop = function() {
	};

	/**
	 * Check if a data is an array.
	 * @param {*} data Data to check.
	 * @returns {boolean} True if data is an array, false otherwise.
	 * @private
	 */
	var isArray = function(data) {
		if (Array.isArray) {
			return Array.isArray(data);
		}
		var objectToStringFn = Object.prototype.toString;
		var arrayToStringResult = objectToStringFn.call([]);
		return objectToStringFn.call(data) === arrayToStringResult;
	};

	/**
	 * Check if a data is strictly equals to null or undefined.
	 * @param {*} data Data to check.
	 * @returns {boolean} True if data is equal to null or undefined, false otherwise.
	 * @private
	 */
	var isNullOrUndefined = function(data) {
		return data === undefined || data === null;
	};

	/**
	 * Check if a data is defined (i.e. not strictly equals to null or undefined).
	 * @param {*} data Data to check.
	 * @returns {boolean} True if data is defined, false otherwise.
	 * @private
	 */
	var isDefined = function(data) {
		return !isNullOrUndefined(data);
	};

	/**
	 * Extend property of an object with properties of a second object and return result.
	 * Parameters are not altered.
	 * @param {Object} src1 First object.
	 * @param {Object} src2 Second object.
	 * @returns {Object} Result.
	 * @private
	 */
	var extend = function(src1, src2) {
		var dst = {};
		for (var i1 in src1) {
			if (src1.hasOwnProperty(i1)) {
				dst[i1] = src1[i1];
			}
		}
		for (var i2 in src2) {
			if (src2.hasOwnProperty(i2)) {
				dst[i2] = src2[i2];
			}
		}
		return dst;
	};

	/**
	 * Create an html element.
	 * @param {string} nodeType Node type ('tr', 'td' etc.)
	 * @returns {HTMLElement} Created element.
	 * @private
	 */
	var createElement = function(nodeType, className) {
		var e = document.createElement(nodeType);
		if (className!==undefined) {
			e.className = className;
		}
		return e;
	};

	/**
	 * Set HTML value of an element.
	 * @param {HTMLElement} element HTML element.
	 * @param {string} text HTML value.
	 * @private
	 */
	var innerHTML = function(element, text) {
		element.innerHTML = text;
	};

	/**
	 * Set attribute of an html element.
	 * @param {HTMLElement} element HTML Element.
	 * @param {string} name Name of attribute.
	 * @param {string|number|boolean} value Attribute's value.
	 * @private
	 */
	var setAttribute = function(element, name, value) {
		element.setAttribute(name, value.toString());
	};

	/**
	 * Set 'data' attribute of html element.
	 * @param {HTMLElement} element HTML Element.
	 * @param {string} name Name of attribute (without 'data-' prefix).
	 * @param {string|number|boolean} value Attribute's value.
	 * @private
	 */
	var setDataAttribute = function(element, name, value) {
		setAttribute(element, 'data-' + name, value);
	};

	/**
	 * Get 'data' attribute of html element.
	 * @param {HTMLElement} element HTML Element.
	 * @param {string} name Name of attribute (without 'data-' prefix).
	 * @returns {string} value Attribute's value.
	 * @private
	 */
	var getDataAttribute = function(element, name) {
		return element.getAttribute('data-' + name);
	};

	/**
	 * Set 'data' attribute of html element to serialized array.
	 * @param {HTMLElement} element
	 * @param {string} name
	 * @param {Array} value
	 */
	var setDataArray = function(element, name, value) {
		var val = setDataAttribute(element, name, value.join(','));
	};

	/**
	 * Get array serrialized to 'data' attribute of html element
	 * @param  {HTMLElement} element
	 * @param  {name} name
	 * @return {Array}
	 */
	var getDataArray = function(element, name) {
		var val = element.getAttribute('data-' + name);

		if (val) {
			return val.split(',');
		}
	};

	/**
	 * Append an html element child to a parent.
	 * @param {HTMLElement|DocumentFragment} parent Parent element.
	 * @param {HTMLElement|DocumentFragment} child Chid element to append.
	 * @private
	 */
	var appendChild = function(parent, child) {
		parent.appendChild(child);
	};

	/**
	 * Get elements by tag name.
	 * @param {string} tagName Name of tag to find.
	 * @param {HTMLElement?} element Element, use document by default.
	 * @returns {NodeList} Founded elements.
	 * @private
	 */
	var byTag = function(tagName, element) {
		return (element || document).getElementsByTagName(tagName);
	};

	/**
	 * Creates table
	 * @param {string} tableClass specific css class for <table>
	 * @return {Object} returns dictionary with table, head and body element
	 */
	var createTable = function(tableClass) {
		var table = createElement('table'),
			sizerHead = createElement('thead'),
			thead = createElement('thead'),
			tbody = createElement('tbody');

		table.className = tableClass;
		sizerHead.className = 'sizer-head';

		appendChild(table, sizerHead);
		appendChild(table, thead);
		appendChild(table, tbody);

		return {
			table: table,
			thead: thead,
			sizerHead: sizerHead,
			tbody: tbody
		};
	};

	/**
	 * Get width of a td or th.
	 * @param {HTMLElement?} element Element.
	 * @returns {number} Width of an element.
	 * @private
	 */
	var getCellWidth = function(element) {
		return parseInt(element.offsetWidth, 10);
	};

	/**
	 * Get width of a scroll bar (jquery dependecy).
	 * @param {HTMLElement?} element Element.
	 * @returns {number} Width of an element.
	 * @private
	 */
	function measureScrollbar() {
	  var $c = $('<div style=\'position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;\'></div>').appendTo('body');
	  var dim = {
		width: $c.width() - $c[0].clientWidth,
		height: $c.height() - $c[0].clientHeight
	  };
	  $c.remove();
	  return dim;
	}

	var scrollBarSize = measureScrollbar();

	/**
	 * Utility code that helps to build html table headers from grouped columns defenitions
	 * @type {Object}
	 */
	var GroupedColumnUtil = {
		validateColumn: function(column) {
			if (column.columns && column.field) {
				throw 'Column group can\'t have field property';
			}
		},

		buildRow: function(columns, rows, depth) {
			var block_colspan = 0;
			if (rows.length===depth) {
				rows.push([]);
			}
			for (var i = 0; i < columns.length; i++) {
				var column = extend({}, columns[i]),
					colspan = 1;

				rows[depth].push(column);

				this.validateColumn(column);

				if (column.columns) {
					colspan = this.buildRow(column.columns, rows, depth+1);
					delete column.columns;
				} else {
					column.isColumn = true;
				}
				if (colspan>1){
					column.colspan = colspan;
				}
				block_colspan += colspan;
			}
			return block_colspan;
		},

		setRowSpans: function(columns) {
			var maxRowNum = 1;

			var i, column, rowNums = [], totalcols = columns.length;

			// precalculate number of rows each column has
			for (i = 0; i < totalcols; i++) {
				column = columns[i];
				var rowNum = column.columns ? this.setRowSpans(column.columns) + 1 : 1;

				if (rowNum>maxRowNum) {
					maxRowNum = rowNum;
				}
				rowNums.push(rowNum);
			}
			//add additional rowspans to align columns with different height
			for (i = 0; i < totalcols; i++) {
				column = columns[i];
				if (rowNums[i]<maxRowNum) {
					column.rowspan = maxRowNum - rowNums[i] + 1;
				}
			}
			return maxRowNum;
		},

		/**
		 * Build template object representing header's html structure for given hierarhical columns.
		 * buildHeadStructure adds colspans for column groups and rowspans for columns without grouping
		 * @param  {Array<Object>} columnGroups Array of hierarhical columns. 
		 * @return {Array<Array>} Array of rows. Each row is an array of objects with proper colspans and rowspans.
		 *     Row is renderend into tr block
		 *     Object is rendered into th
		 */
		buildHeadStructure: function(columnGroups) {
			var rows = [];
			this.setRowSpans(columnGroups);
			this.buildRow(columnGroups, rows, 0);
			return rows;
		},

		/**
		 * Get flat list of real columns from hierarhical columnGroup objects.
		 * @param  {Array<Object>} columnGroups array of hierarhical columnGroups
		 * @return {Array<Object>} Array of columns
		 */
		getColumns: function(columnGroups) {
			var columns = [];
			for (var i = 0; i < columnGroups.length; i++) {
				var columnGroup = columnGroups[i];
				if (columnGroup.columns) {
					columns = columns.concat(this.getColumns(columnGroup.columns));
				} else {
					columns.push(columnGroup);
				}
			}
			return columns;
		},

		/**
		 * Normalizes number of rows in two head structures. If one structure has less rows then another
		 * then it adds additional rows with appropriate collspan.
		 * @param  {Array<Array>} headA first structure
		 * @param  {Array<Array>} headB second structure
		 */
		normalizeHeights: function(headA, headB) {
			if (headA.length===0 || headA.length === headB.length) {
				return;
			}
			else if (headA.length>headB.length) {
				var tmp = headB;
				headB = headA;
				headA = tmp;
			}

			// here headA has less columns than headB
			var diff = headB.length - headA.length,
				colspan = (headA[0] || []).length;

			for (var i = 0; i < diff; i++) {
				var filler = {title: '&nbsp;'};
				if (colspan>1) {
					filler.colspan = colspan;
				}
				headA.unshift([filler]);
			}
		}
	};

	/**
	 * Filter object.
	 * @param {Object} obj Initialization object.
	 * @constructor
	 * @private
	 */
	var Filter = function(obj) {
		this.field = obj.field || '';
		this.value = obj.value || '';
		this.type = (obj.type || 'contains').toString();
		this.filterFunction = obj.filterFunction || this[this.type];
	};

	Filter.prototype = {
		/**
		 * Check if a data match the filter.
		 * @param {Object} data Data to check.
		 * @param {boolean} caseInsensitive Flag to known if comparison must be case insensitive or not.
		 * @return {boolean} True if filter match given data.
		 * @public
		 */
		match: function(data, caseInsensitive) {
			var value = data.get(this.field);
			if (isNullOrUndefined(value)) {
				return false;
			}
			return this.filterFunction.call(this, data, value, caseInsensitive);
		},

		/**
		 * Check if a value match given function.
		 * @param {number|string|boolean} value Value to check.
		 * @param {boolean} caseInsensitive Flag to known if comparison must be case insensitive or not.
		 * @param {function} fn Given function.
		 * @return {boolean} True if value match given function, false otherwise.
		 * @public
		 */
		checkValues: function(value, caseInsensitive, fn) {
			var filterValue = this.value;
			var array = isArray(filterValue) ? filterValue.slice() : [filterValue];

			for (var i = 0, ln = array.length; i < ln; ++i) {
				array[i] = isDefined(array[i]) ? array[i].toString() : '';
				if (caseInsensitive) {
					array[i] = array[i].toLowerCase();
				}
			}

			value = isDefined(value) ? value.toString() : '';
			if (caseInsensitive) {
				value = value.toLowerCase();
			}

			var val = isArray(filterValue) ? array : array[0];
			return fn.call(this, value, val);
		},

		/**
		 * Apply 'contains' filter.
		 * @param {Object} data Data to check.
		 * @param {number|string|boolean} value Value to check.
		 * @param {boolean} caseInsensitive Flag to known if comparison must be case insensitive or not.
		 * @return {boolean} True if data match contains filter value.
		 * @public
		 */
		contains: function(data, value, caseInsensitive) {
			return this.checkValues(value, caseInsensitive, function(value, filterValue) {
				return value.indexOf(filterValue) >= 0;
			});
		},

		/**
		 * Apply 'equal' filter.
		 * @param {Object} data Data to check.
		 * @param {number|string|boolean} value Value to check.
		 * @param {boolean} caseInsensitive Flag to known if comparison must be case insensitive or not.
		 * @return {boolean} True if data match equals filter value.
		 * @public
		 */
		equal: function(data, value, caseInsensitive) {
			return this.checkValues(value, caseInsensitive, function(value, filterValue) {
				return value === filterValue;
			});
		},

		/**
		 * Apply 'in' filter.
		 * @param {Object} data Data to check.
		 * @param {number|string|boolean} value Value to check.
		 * @param {boolean} caseInsensitive Flag to known if comparison must be case insensitive or not.
		 * @return {boolean} True if data match equals filter value.
		 * @public
		 */
		'in': function(data, value, caseInsensitive) {
			return this.checkValues(value, caseInsensitive, function(value, filterValue) {
				return filterValue.indexOf(value) >= 0;
			});
		}
	};

	/**
	 * Data displayed in datagrid.
	 * @param {number} id Internal id of data.
	 * @param {Object} obj Original object.
	 * @param {boolean} summaryRow Summary row flag (this row will always sort to bottom)
	 * @constructor
	 * @private
	 */
	var Data = function(id, obj, summaryRow, level) {
		this.id = id;
		this.obj = obj;
		this.visible = true;
		this.expanded = false;
		this.level = level || 0;
		this.summaryRow = summaryRow;
	};

	Data.prototype = {
		get: function(field) {
			//TODO: use flag to enable deep object getters?      
			// var fields = field.split('.'),
			// 	current = this.obj;

			// for (var i = 0, ln = fields.length; i < ln; ++i) {
			// 	current = current[fields[i]];
			// 	if (isNullOrUndefined(current)) {
			// 		break;
			// 	}
			// }
			var val = this.obj[field];
			if (val===undefined) {
				return '';
			} else {
				return val;
			}
		},

		/**
		 * Get children of a row
		 * @param  {string} childrenField
		 * @return {Array<Data>}
		 */
		getChildren: function(childrenField) {
			if (!this._children) {
				// create children on demand
				var raw = this.obj[childrenField],
					children = [];
				if (!raw) {
					return [];
				}
				for (var i=0, ln=raw.length; i<ln; i++) {
					children.push(new Data(i, raw[i], false, this.level + 1));
				}
				this._children = children;
			}
			return this._children;
		},

		/**
		 * Check if data object has children
		 * @param  {string}  childrenField
		 * @return {Boolean}
		 */
		hasChildren: function(childrenField) {
			return this.obj[childrenField] !== undefined;
		},

		/**
		 * Check if data match given filters.
		 * @param {Array<Filter>} filters Filters to check.
		 * @param {boolean} caseInsensitive Flag to known if comparison must be case insensitive or not.
		 * @return {boolean} True if data match given filters, false otherwise.
		 * @public
		 */
		matchFilters: function(filters, caseInsensitive) {
			for (var filter in filters) {
				if (filters.hasOwnProperty(filter) && filters[filter] && filters[filter].match(this, caseInsensitive)) {
					return true;
				}
			}
			return false;
		},

		/**
		 * Update visibility flag of data for given filters.
		 * @param {Array<Filter>} filters Filters to check.
		 * @param {boolean} caseInsensitive Flag to known if comparison must be case insensitive or not.
		 * @public
		 */
		updateVisibility: function(filters, caseInsensitive) {
			this.visible = !this.matchFilters(filters, caseInsensitive);
		}
	};

	/**
	 * Default sort function for Array.sort
	 */
	var defaultSort = function(x, y) {
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	};

	var numberSort = function(x, y) {
		return x - y;
	};

	var defaultRenderFunction = function(row, field) {
		return row.get(field);
	};

	/**
	 * Column displayed in datagrid.
	 * @param {number} idx Index of column in table.
	 * @param {Object} obj Column initialization.
	 * @constructor
	 * @private
	 */
	var Column = function(idx, obj) {
		this.idx = idx;
		this.field = obj.field;
		this.title = obj.title;
		this.cssClass = obj.cssClass;
		this.width = obj.width;
		this.minWidth = obj.minWidth || MIN_COL_WIDTH;

        this.resizable = obj.resizable === undefined || obj.resizable;

		this.sortable = obj.sortable === undefined || obj.sortable;
		this.sortAsc =  obj.sortAsc === undefined || obj.sortAsc;
		if (obj.sortFunction) {
			this.sortFunction = obj.sortFunction;
		} else if (obj.sortType === 'numeric' || obj.sortType === 'date') {
			this.sortFunction = numberSort;
		} else {
			this.sortFunction = defaultSort;
		}

		this.renderFunction = obj.renderFunction;
	};


	Column.prototype = {
		getCellValue: function(row) {
			if (this.renderFunction) {
				return this.renderFunction(row.get(this.field) || '', row, this.field);
			} else {
				return row.get(this.field);
			}
		}
	};

	/**
	 * Datagrid object.
	 * @param {HTMLTableElement} table Table.
	 * @param {Object} options Plugin settings.
	 * @constructor
	 * @public
	 */
	var Datagrid = function(container, options) {
		this.container = container;
		this.length = 0;
		this.columns = [];
		this.datas = [];
		this.filters = {};
		this.sortColumns = [];

		// Internal flags
		this.checkVisibility = false;
		this.options = extend(Datagrid.options, options);
		this.init();
	};

	Datagrid.prototype = {
		/**
		 * Call a callback function with datagrid object as context.
		 * @param {function} fn Callback function.
		 * @public
		 */
		call: function(fn) {
			fn.apply(this, slice.call(arguments, 1));
		},

		/**
		 * Initialize datagrid.
		 * @public
		 */
		init: function() {

			this
				.buildStructure()
				.setColumns(this.options.columns)
				.addFilters(this.options.filters)
				.set(this.options.datas)
				.render()
				.bindEventHandlers()
				.ivalidateBodyWrapperHeight()
				.invalidateColumnSizes()
				.invalidateRightFillerWidth();

			delete this.options.datas;
			delete this.options.columns;
			delete this.options.filters;
		},

		/**
		 * Build data grid structure.
		 * @returns {Datagrid} this object.
		 * @public
		 */
		buildStructure: function(columns) {
			this.headContainer = createElement('div', 'dt-head');
			this.bodyContainer = createElement('div', 'dt-body');

			appendChild(this.container, this.headContainer);
			appendChild(this.container, this.bodyContainer);

			this.frozenHeadWrapper = createElement('div', 'dt-frozen-head-wrapper');
			appendChild(this.headContainer, this.frozenHeadWrapper);
			
			this.headWrapper = createElement('div', 'dt-head-wrapper');
			this.headWrapper.style.marginRight = scrollBarSize.width + 'px';
			appendChild(this.headContainer, this.headWrapper);

			this.frozenBodyWrapper = createElement('div', 'dt-frozen-body-wrapper');
			appendChild(this.bodyContainer, this.frozenBodyWrapper);


			this.bodyWrapper = createElement('div', 'dt-body-wrapper');
			appendChild(this.bodyContainer, this.bodyWrapper);

			this.frozenHead = createTable(this.options.tableClass + ' dt-table dt-head-table');
			this.frozenBody = createTable(this.options.tableClass + ' dt-table dt-body-table');
			this.head = createTable(this.options.tableClass + ' dt-table dt-head-table');
			this.body = createTable(this.options.tableClass + ' dt-table dt-body-table');

			appendChild(this.headWrapper, this.head.table);
			appendChild(this.bodyWrapper, this.body.table);
			appendChild(this.frozenHeadWrapper, this.frozenHead.table);
			appendChild(this.frozenBodyWrapper, this.frozenBody.table);


			// create right filler

			this.rightFillerWrapper = createElement('div', 'dt-right-filler-wrapper');
			appendChild(this.bodyWrapper, this.rightFillerWrapper);
			this.rightFiller = createTable(this.options.tableClass + ' dt-table dt-right-filler');
			appendChild(this.rightFillerWrapper, this.rightFiller.table);

			this.rightFillerHeadWrapper = createElement('div', 'dt-right-filler-wrapper');
			appendChild(this.headWrapper, this.rightFillerHeadWrapper);
			this.rightHeadFiller = createTable(this.options.tableClass + ' dt-table dt-right-filler');
			appendChild(this.rightFillerHeadWrapper, this.rightHeadFiller.table);

			return this;
		},

		/**
		 * Bind scroll, sort, resize and other events to a DOM
		 * @return {Datagrid} this object.
		 */
		bindEventHandlers: function() {
			this.bindScrollEvents()
				.bindSortEvents()
				.bindExpandChildrenEvents()
				.bindResizeColumnEvent();
			return this;
		},

		/**
		 * Bind click events for table header to perform sort action
		 * @return {Datagrid} this object.
		 */
		bindSortEvents: function() {
			var self = this;
			// todo: remove jquery?
			$(this.headContainer).on('click', 'th.sortable', function (e) {
				var srcElement = e.originalEvent.srcElement || e.originalEvent.target;
				if ($(srcElement).hasClass('dt-resize-handle')) {
					return;
				}

				var col_id = parseInt(getDataAttribute(this, ATTR_COLUMN_ID), 10);

				if (isNaN(col_id)) {
					return;
				}

				var	column = self.columns[col_id];

				if (self.sortColumns.indexOf(col_id)!==-1) {
					column.sortAsc = !column.sortAsc;
				} else {
					self.sortColumns = [col_id];
				}

				self.sort(self.sortColumns);
			});
			return this;
		},

		/**
		 * Bind scroll events
		 * @returns {Datagrid} this object.
		 * @public
		 */
		bindScrollEvents: function() {
			var self = this;
			$(this.bodyWrapper).on('scroll', function scrollHandler() {
				var scrollTop = this.scrollTop,
					scrollLeft = this.scrollLeft;
				self.headWrapper.scrollLeft = scrollLeft;
				self.frozenBodyWrapper.scrollTop = scrollTop;
			});
			return this;
		},

		/**
		 * Bind event to an expand children button
		 * @return {Datagrid} this object.
		 */
		bindExpandChildrenEvents: function() {
			var self = this;

			$(this.container).on('click', '.expand-children-button', function(e) {
				var cell = $(this).closest('td');

				var data = self.getRowDataByCell(cell[0]);
				data.expanded = !data.expanded;
				self.render();
			});

			return this;
		},

		/**
		 * Bind event to resize handle for resizing
		 * @return {Datagrid} this object.
		 */
		bindResizeColumnEvent: function() {
			var self = this,
				column,
				baseWidth,
				pos,
				resizeHandlers = $(this.headContainer).find('.dt-resize-handle');

			resizeHandlers.drag('dragstart', function (e) {
				var col_id = parseInt(getDataAttribute(this.parentNode, ATTR_COLUMN_ID), 10);
				pos = e.pageX;
				column = self.columns[col_id];
				baseWidth = $(this.parentNode).width();
			});

			resizeHandlers.drag(function (e) {
				var pageX = e.pageX;
				if (pageX === 0) {
					return;
				}
				var newWidth = Math.max(baseWidth + pageX - pos, column.minWidth);
				self.setColumnSize(column, newWidth);
				self.invalidateRightFillerWidth();
			});

			return this;
		},

		setColumnSize: function(column, width) {
			column.headSizer.style.width = width + 'px';
			column.bodySizer.style.width = width + 'px';
			column.width = width;
		},

		/**
		 * Set columns to datagrid.
		 * @param {Array<Object>} columns Columns. Datagrid supports column groups:
		 * If column object has `columns` property it will be rendered as a column group with `columns` inside it.
		 * @returns {Datagrid} this object.
		 * @public
		 */
		setColumns: function(columnGroups) {
			this.columns = [];

			// find and initialize real columns
			var columnHeaders = GroupedColumnUtil.getColumns(columnGroups);
			for (var i = 0; i < columnHeaders.length; i++) {
				var header = columnHeaders[i];
				header.column = new Column(i, columnHeaders[i]);
				this.columns.push(header.column);
			}

			// 			
			var frozenGroup = columnGroups.slice(0, this.options.frozenColumnsNum),
				ordinalGroup = columnGroups.slice(this.options.frozenColumnsNum);



			// var frozenCols = GroupedColumnUtil.getColumns(frozenGroup),
			// 	ordinalCols = GroupedColumnUtil.getColumns(ordinalGroup);


			var frozenColsStructure = GroupedColumnUtil.buildHeadStructure(frozenGroup),
				ordinalColsStructure = GroupedColumnUtil.buildHeadStructure(ordinalGroup);

			GroupedColumnUtil.normalizeHeights(frozenColsStructure, ordinalColsStructure);

			this.frozenColumns = this.columns.slice(0, this.options.frozenColumnsNum);
			this.ordinalColumns = this.columns.slice(this.options.frozenColumnsNum);

			// draw frozen columns
			this
				.setThead(this.frozenHead.thead, frozenColsStructure)
				.createSizer(this.frozenHead.sizerHead, this.frozenColumns, 'headSizer')
				.createSizer(this.frozenBody.thead, this.frozenColumns, 'bodySizer');

			// draw other columns
			this
				.setThead(this.head.thead, ordinalColsStructure)
				.createSizer(this.head.sizerHead, this.ordinalColumns, 'headSizer')
				.createSizer(this.body.thead, this.ordinalColumns, 'bodySizer');

			// draw right filler
			var maxRows = Math.max(frozenColsStructure.length, ordinalColsStructure.length);
			this .setEmptyThead(this.rightHeadFiller.thead, maxRows);

			return this;
		},

		/**
		 * Render header of datagrid - separate table in head wrapper.
		 * @param {HTMLElement} thead Thead element in which we will create 
		 * @param {Array<Array>} headLayers head layers which should be rendered into trs
		 * @returns {Datagrid} this object.
		 * @public
		 */
		setThead: function(thead, headLayers) {
			innerHTML(thead, '');

			for (var i = 0; i < headLayers.length; i++) {
				var layer = headLayers[i],
					tr = this.createHeadRow(layer);
				appendChild(thead, tr);
			}

			return this;
		},

		createHeadRow: function(columns) {
			var tr = createElement('tr'), th, column, txt;
			for (var i = 0, ln = columns.length; i < ln; ++i) {
				column = columns[i];

				txt = column.title;
				if (this.options.fixEmptyCell && !txt) {
					txt = ' ';
				}

				th = createElement('th');
				if (column.colspan) {
					setAttribute(th, 'colspan', column.colspan);
				}
				if (column.rowspan) {
					setAttribute(th, 'rowspan', column.rowspan);
				}
				if (column.column) {
                    if (column.column.resizable) {
                        txt += '<div class="dt-resize-handle"></div>';
                        setDataAttribute(th, ATTR_COLUMN_ID, column.column.idx);
                    }
					if(column.column.sortable !== false) {
                        th.className += ' sortable';
                    }
                    column.column.th = th;
                }

				innerHTML(th, txt);
				appendChild(tr, th);
			}
			return tr;
		},

		/**
		 * Render empty header for right filler
		 * @param {HTMLElement} thead Thead element
		 */
		setEmptyThead: function(thead, rowNum) {
			innerHTML(thead, '');
			for (var i = 0; i < rowNum; i++) {
				var tr = createElement('tr'),
					th = createElement('th');
				th.innerHTML = '&nbsp;';
				appendChild(tr, th);
				appendChild(thead, tr);
			}
			return this;
		},

		/**
		 * Render ivisible header for sizing purposes. It is created as a first line in a table so tables with
		 * fixed layout can get size from it.
		 * @param {HTMLElement} thead thead to add invisible row
		 * @param {Array<Column>} columns columns
		 * @param {String} elementName name of property in Column object to save a reference to a th
		 * @returns {Datagrid} this object.
		 * @public
		 */
		 createSizer: function(thead, columns, elementName) {
			innerHTML(thead, '');

			var tr = createElement('tr');
			for (var i = 0, ln = columns.length; i < ln; i++) {
				var th = createElement('th');
				columns[i][elementName] = th;
				appendChild(tr, th);
			}
			appendChild(thead, tr);
			return this;
		 },

		/**
		 * Replace current datas stored in datagrid with given datas.
		 * @param {Array<Object>|Object} datas Datas to set.
		 * @return {Datagrid} this object.
		 * @public
		 */
		set: function(datas) {
			if (isDefined(datas)) {
				this.length = 0;
				this.datas = [];
				this.add(datas);
			}
			return this;
		},

		/**
		 * Get row data by list of ids. Each id represents a row in a level of hiearhical data
		 * @param {Array<Data>} rows Rows to search
		 * @param  {Array<number>} ids List of ids to get data from hierarchical structures
		 * @return {Data}
		 */
		getRowDataByIds: function(datas, ids) {
			var level_id = parseInt(ids.shift(), 10);
			for (var i=0, ln=datas.length; i<ln; i++) {
				if (datas[i].id === level_id) {
					if (ids.length===0) {
						return datas[i];
					} else {
						return this.getRowDataByIds(datas[i].getChildren(this.options.childrenField), ids);
					}
				}
			}
		},

		/**
		 * Get row data by cell element
		 * @param  {HTMLElement} cell
		 * @return {Data}
		 */
		getRowDataByCell: function(cell) {
			var row = cell.parentNode,
				data_id = parseInt(getDataAttribute(cell, ATTR_DATA_ID), 10),
				parents = getDataArray(row, ATTR_PARENTS) || [];

			parents.push(data_id);
			return this.getRowDataByIds(this.datas, parents);
		},

		/**
		 * Add new datas to datagrid.
		 * @param {*} datas Datas to add.
		 * @return {Datagrid} this object.
		 * @public
		 */
		add: function(datas) {
			var array = isArray(datas) ? datas : [datas];
			for (var i = 0, ln = array.length; i < ln; ++i) {
				var isSummaryRow = ln - i <= this.options.summaryRowNum;
				this.datas.push(new Data(this.length++, array[i], isSummaryRow));
			}
			return this;
		},

		removeSortStyles: function() {
			var columns = this.columns;
			for (var i = 0; i < columns.length; i++) {
				var col = columns[i],
					className = col.th.className;
				if (className.indexOf('sorted')!==-1) {
					
					className = className
						.replace('sorted', '')
						.replace('sort-asc', '')
						.replace('sort-desc', '')
						.replace('  ', ' ');
						
					col.th.className = className;
				}
			}
		},

		setSortStyles: function(column_ids) {
			for (var i = 0; i < column_ids.length; i++) {
				var col = this.columns[column_ids[i]];
				col.th.className = col.th.className + ' sorted ' + (col.sortAsc ? 'sort-asc' : 'sort-desc');
			}
		},

		/**
		 * Performs stable multisort by column ids
		 * @param  {Array<number>} column_ids for sort
		 * @return {Datagrid} this object
		 */
		sort: function(column_ids) {
			var row_order = [],
				columns = this.columns,
				sort_col_num = column_ids.length;

			this.removeSortStyles();
			this.setSortStyles(column_ids);

			// build array with row order for stable sort
			var row_num = this.datas.length;
			for (var data_id=0; data_id<row_num; data_id++) {
				var data = this.datas[data_id];
				row_order.push(data.id);
			}

			this.datas.sort(function (a, b) {
				var result = 0;

				if (a.summaryRow || b.summaryRow) {
					return defaultSort(a.id, b.id);
				}

				for (var i=0; i<sort_col_num; i++) {
					var col_id = column_ids[i],
						column = columns[col_id];

					result = column.sortFunction(a.get(column.field), b.get(column.field));

					if (!column.sortAsc) {
						result = -result;
					}

					if (result !== 0) {
						return result;
					}
				}

				return defaultSort(row_order[a.id], row_order[b.id]);
			});

			this.render();

			return this;
		},

		/**
		 * Add new filters to datagrid.
		 * @param {Array<Object>|Object} filters Filters to add.
		 * @return {Datagrid} this object.
		 * @public
		 */
		addFilters: function(filters) {
			filters = isArray(filters) ? filters : [filters];
			for (var i = 0, ln = filters.length; i < ln; ++i) {
				var filter = new Filter(filters[i]);
				this.filters[filter.field] = filter;
				this.checkVisibility = true;
			}
			return this;
		},

		/**
		 * Remove filters of datagrid. If no arguments is given, function remove all filters.
		 * @param {Array<string>|string?} fields Field where filters must be removed.
		 * @return {Datagrid} this object.
		 * @public
		 */
		removeFilters: function(fields) {
			if (isDefined(fields)) {
				fields = isArray(fields) ? fields : [fields];
				for (var i = 0, ln = fields.length; i < ln; ++i) {
					var field = fields[i];
					this.filters[field] = null;
				}
			}
			else {
				this.filters = {};
			}
			this.checkVisibility = true;
			return this;
		},

		/**
		 * Render datagrid.
		 * @return {Datagrid} this object.
		 * @public
		 */
		render: function() {
			var frozenColumns = this.createTableFragment(this.datas, this.frozenColumns);
			innerHTML(this.frozenBody.tbody, '');
			appendChild(this.frozenBody.tbody, frozenColumns);
			frozenColumns = undefined;

			var fragment = this.createTableFragment(this.datas, this.ordinalColumns);
			innerHTML(this.body.tbody, '');
			appendChild(this.body.tbody, fragment);

			//create right fillter
			var rightFillerBody = this.createEmptyTableFragment(this.datas);
			innerHTML(this.rightFiller.tbody, '');
			appendChild(this.rightFiller.tbody, rightFillerBody);

			this.checkVisibility = false;
			return this;
		},

		/**
		 * Create docuemnt fragment with table rows for given data and columns
		 * @param  {Array<object>} datas   Data to render
		 * @param  {Array<object>} columns Columns to render
		 * @return {DocumentFragment}      DocumentFragment with `tr` rows
		 */
		createTableFragment: function(datas, columns) {
			var fragment = document.createDocumentFragment();
			for (var i = 0, ln = datas.length; i < ln; ++i) {
				var data = datas[i];
				if (this.checkVisibility) {
					data.updateVisibility(this.filters, this.options.caseInsensitive);
				}

				if (data.visible) {
					appendChild(fragment, this.createRow(datas[i], columns));
				}
			}
			return fragment;
		},

		/**
		 * Create document fragment with one column with empty content
		 * @param  {Array<object>} datas Array of data which need an empty ow
		 * @return {DocumentFragment}    DocumentFragment with `tr` rows       
		 */
		createEmptyTableFragment: function(datas) {
			var fragment = document.createDocumentFragment();
			for (var i = 0, ln = datas.length; i < ln; ++i) {
				var data = datas[i];
				if (this.checkVisibility) {
					data.updateVisibility(this.filters, this.options.caseInsensitive);
				}

				if (data.visible) {
					var tr = createElement('tr'),
						td = createElement('td');
					td.innerHTML = '&nbsp;';
					appendChild(tr, td);
					appendChild(fragment, tr);
				}
			}
			return fragment;
		},

		/**
		 * Create row for data.
		 * @param {Data} data Data to render.
		 * @returns {HTMLElement} Row associated to data.
		 * @public
		 */
		createRow: function(data, columns, parents) {
			var tr = createElement('tr');
			setDataAttribute(tr, ATTR_DATA_ID, data.id);
			
			if (parents){
				setDataArray(tr, ATTR_PARENTS, parents);
			}

			for (var i = 0, ln = columns.length; i < ln; ++i) {
				appendChild(tr, this.createCell(data, columns[i]));
			}

			if (data.expanded) {
				parents = (parents || []);
				var children = this.createChildrenRows(data, columns, parents.concat(data.id)),
					withChildren = document.createDocumentFragment();
				appendChild(withChildren, tr);
				appendChild(withChildren, children);
				return withChildren;
			} else {
				return tr;
			}
		},

		/**
		 * Create child rows
		 * @param  {Data} data Data which children should be rendered
		 * @return {DocumentFragment}
		 * @public
		 */
		createChildrenRows: function(data, columns, parents) {
			var children = data.getChildren(this.options.childrenField),
				fragment = document.createDocumentFragment();

			for (var i = 0, ln = children.length; i < ln; i++) {
				appendChild(fragment, this.createRow(children[i], columns, parents));
			}

			return fragment;
		},

		/**
		 * Create cell for a data and a column.
		 * @param {Data} data Data to render.
		 * @param {Column} column Column to render.
		 * @returns {HTMLElement} Cell.
		 * @public
		 */
		createCell: function(data, column) {
			var td = createElement('td'),
				txt = column.getCellValue(data);

			if (isNullOrUndefined(txt)) {
				txt = '';
			}

			txt = txt.toString();
			if (this.options.fixEmptyCell && !txt) {
				txt = ' ';
			}

			if (column.idx === 0 && this.options.expandable && data.hasChildren(this.options.childrenField)) {
				var icon = data.expanded ?
							this.options.collapseChildrenButton :
							this.options.expandChildrenButton;
				txt = '<span class="expand-children-button">'+ icon + '</span>' + txt; // expand arrow
			}

			innerHTML(td, txt);
			setDataAttribute(td, ATTR_DATA_ID, data.id);
			setDataAttribute(td, ATTR_COLUMN_ID, column.idx);

			if (column.cssClass) {
				td.className = column.cssClass;
			}

			return td;
		},

		/**
		 * Changes the size of all internal elementes than container is chaging it's size
		 * @return {Datagrid} this object.
		 * @public
		 */
		invalidateSize: function() {
			//todo: don't run all resize functions if only one dimension is changed
			var heightChanged = true,
				widthChanged = true;
			if (heightChanged) {
				this.ivalidateBodyWrapperHeight();
			}

			if (widthChanged) {
				this.invalidateRightFillerWidth();
			}
			return this;
		},

		/**
		 * Invalidates and synchonize column sizes and header sizes
		 * @returns {Datagrid} this object.
		 * @public
		 */
		invalidateColumnSizes: function() {
			this.syncHeaderAndBodyWidths(
				this.frozenHead.sizerHead.getElementsByTagName('th'),
				this.frozenBody.thead.getElementsByTagName('th'),
				this.frozenColumns );

			this.frozenHead.table.style.tableLayout = 'fixed';
			this.frozenBody.table.style.tableLayout = 'fixed';

			this.syncHeaderAndBodyWidths(
				this.head.sizerHead.getElementsByTagName('th'),
				this.body.thead.getElementsByTagName('th'),
				this.ordinalColumns );

			this.head.table.style.tableLayout = 'fixed';
			this.body.table.style.tableLayout = 'fixed';

			return this;
		},

		syncHeaderAndBodyWidths: function(head_ths, body_ths, columns) {
			var colnum = columns.length;

			for (var i=0; i<colnum; i++) {
				var column = columns[i],
					head_col_width = getCellWidth(head_ths[i]),
					body_col_width = getCellWidth(body_ths[i]),
					maxWidth = Math.max(head_col_width, body_col_width),
					narrowMode = column.narrowMode;

				if (column.width && column.width<maxWidth) {
					maxWidth = column.width;
					narrowMode = true;
				} else {
					narrowMode = false;
				}

				if (narrowMode !== Boolean(column.narrowMode)) {
					// head_ths[i].style.overflow = narrowMode ? 'hidden' : 'auto';
					// body_ths[i].style.overflow = narrowMode ? 'hidden' : 'auto';
					column.narrowMode = narrowMode;
				}

				head_ths[i].style.width = maxWidth + 'px';
				body_ths[i].style.width = maxWidth + 'px';
			}
		},

		/**
		 * Cacluates appropriate margin for right filler
		 * @return {Datagrid} this object.
		 */
		invalidateRightFillerWidth: function() {
			var margin = this.body.table.offsetWidth + 'px';
			this.rightFillerWrapper.style.left = margin;
			this.rightFillerHeadWrapper.style.left = margin;
			return this;
		},

		/**
		 * Set up the height of bodyWrapper
		 * @returns {Datagrid} this object.
		 * @public
		 */
		ivalidateBodyWrapperHeight: function() {
			var fullHeight = this.container.offsetHeight,
				headerHeight = this.headWrapper.offsetHeight,
				bodyHeight = fullHeight - headerHeight;

			this.bodyWrapper.style.height = bodyHeight + 'px';
			this.frozenBodyWrapper.style.height = bodyHeight - scrollBarSize.width + 'px';

			return this;
		}
	};

	/**
	 * Default options of datagrid.
	 * @type {Object}
	 * @public
	 */
	Datagrid.options = {
		datas: [],
		columns: [],
		filters: [],
		fixEmptyCell: true,
		caseInsensitive: true,
		frozenColumnsNum: 0,
		summaryRowNum: 0,               // number of summary rows at the bottom which don't take part in sort
		childrenField: 'children',      // name of a list with children in data
		expandChildrenButton: '⊞',
		collapseChildrenButton: '⊟'
	};

	// Expose to global object
	window.Datagrid = Datagrid;
	window.YAD = {
		GroupedColumnUtil: GroupedColumnUtil
	};
})(window, document, void 0, window.jQuery);