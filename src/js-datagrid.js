/**
 *
 */

'use strict';

(function(window, document, navigator, undefined, $) {

	// Save bytes in the minified
	var arrayProto = Array.prototype,
		slice = arrayProto.slice;

	// Constants
	var ATTR_COLUMN_ID = 'col-id';
	var ATTR_DATA_ID = 'data-id';
	var ATTR_PARENTS = 'parents';
	var MIN_COL_WIDTH = 40; //px

    var NBSP = '\u00A0'; // non breaking space

	var agent = '', IS_IE9;
	if (navigator && navigator.userAgent) {
		agent = navigator.userAgent;
	}
	var ie = /msie (\d+)/.exec(agent.toLowerCase()), ieVer;
	if (ie && ie.length>1) {
		IS_IE9 = parseInt(ie[1], 10) === 9;
	}

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
     * @param {string} [className] optional css class name for an element
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
     * set text content of an element
     * @param element
     * @param text
     */
    var textContent = function(element, text) {
        element.textContent = text;
    };

    /**
     * Remove all children of a DOM node
     * @param node {HTMLElement} Node to remove children
     */
    var removeChildren = function(node) {
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
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
		setDataAttribute(element, name, value.join(','));
	};

	/**
	 * Get array serialized to 'data' attribute of html element
	 * @param  {Element} element
	 * @param  {string} name
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
	 * Debounce function (stolen from underscore.js
	 */
	var debounce = function(func, wait, immediate) {
		var timeout, result;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) result = func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) result = func.apply(context, args);
			return result;
		};
	};

	/**
	  Returns a function that will be executed at most one time, no matter how
	  often you call it. Useful for lazy initialization.
	  Stolen from underscore.js
	 */
	var once = function(func) {
		var ran = false, memo;
		return function() {
			if (ran) return memo;
			ran = true;
			memo = func.apply(this, arguments);
			func = null;
			return memo;
		};
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
     * Create span block with specidied padding
     * @param padding
     * @returns {HTMLElement}
     */
    var createIndentBlock = function (padding) {
        var indent = document.createElement('span');
        indent.className = 'child-indent';
        indent.style.paddingLeft = padding + 'px';
        return indent;
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
	 * @returns {{width: number, height: number}} Width and height of an element.
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

    var defer = function(func) {
        setTimeout(func, 10);
    };

    /**
     * Searchs for widest column in a collection
     * @param {Array<Column>} columns
     * @returns {Column}
     */
    var getWidestCol = function (columns) {
        var widest = columns[columns.length-1];
        for (var i=columns.length-1; i>=0; i--) {
            if (widest.width<columns[i].width) {
                widest = columns[i];
            }
        }
        return widest;
    }

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
			var array = isArray(filterValue) ? filterValue.slice(0) : [filterValue];

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
     * @param {number} [level] level of data for hierarchical data objects
     * @param {Array} [parents] List of parent ids
	 * @constructor
	 * @private
	 */
	var Data = function(id, obj, summaryRow, level, parents) {
		/*
		@public
		 */
		this.id = id;
		this.obj = obj;
		this.visible = true;
		this.expanded = false;
		this.level = level || 0;
		this.summaryRow = summaryRow;


        this.parents = parents || [];
        this.uid = this.parents.join('-') + '-' + this.id;

        //internals
        this._expandIconState = false;
    };

	Data.prototype = {
		get: function(field) {
			var val = this.obj[field];
			if (val===undefined) {
				return '';
			} else {
				return val;
			}
		},

        /**
         * Get a row data.
         * @returns {Object} Source data of a row
         */
        getData: function() {
            return this.obj;
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
					children = [],
                    parents = this.parents.concat(this.id);

				if (!raw) {
					return [];
				}
				for (var i=0, ln=raw.length; i<ln; i++) {
					children.push(new Data(i, raw[i], false, this.level + 1, parents));
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
        this.isHTML = obj.isHTML;
        this.sortByField = obj.sortByField || obj.field;
		this.title = obj.title;
		this.cssClass = obj.cssClass;
		this.width = obj.width;
		this.minWidth = obj.minWidth || MIN_COL_WIDTH;

        this.resizable = obj.resizable === undefined || obj.resizable;

		this.sortable = obj.sortable === undefined || obj.sortable;
		this.sortAsc =  obj.sortAsc === undefined || obj.sortAsc;
		if (obj.sortFunction) {
			this.sortFunction = obj.sortFunction;
		} else {
		    //noinspection JSUnresolvedVariable
            if (obj.sortType === 'numeric' || obj.sortType === 'date') {
                        this.sortFunction = numberSort;
                    } else {
                        this.sortFunction = defaultSort;
                    }
        }

		this.renderFunction = obj.renderFunction;
        this.headerRenderFunction = obj.headerRenderFunction;
		this.postRenderFunction = obj.postRenderFunction;
	};


	Column.prototype = {
		getCellValue: function(row) {
			if (this.renderFunction) {
				return this.renderFunction(row.get(this.field) || '', row, this.field);
			} else {
				return row.get(this.field);
			}
		},

        getRawValue: function(row) {
            return row.get(this.field);
        },

        getHeader: function() {
            if (this.headerRenderFunction) {
                return this.headerRenderFunction(this.title);
            } else {
                return this.title;
            }
        }
	};

	/**
	 * Datagrid object.
	 * @param {HTMLTableElement} container Container for table.
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
        this.resizeFlag = false;
		this.options = extend(Datagrid.options, options);

		this.lastRenderedIndex  = 0;

		if (this.options.takeAllHeight) {
			this.options.loadOnScroll = false;
		}

		this.init();
	};

	//noinspection JSUnusedGlobalSymbols
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

            if (this.options.reuseDom) {
                this.domCache = {
                    frozenCols: {},
                    ordinalCols: {}
                }
            }

			this._cachedBodyHeight = -1;
			this._heightIsChanged = true;

			this.appendVisibleRowsDebounced = YAD.debounce(this.appendVisibleRows, 30);

			this
				.buildStructure()
				.setColumns(this.options.columns)
				.addFilters(this.options.filters)
				.set(this.options.datas)
				.render()
				.bindEventHandlers()
				.invalidateColumnSizes()
				.invalidateRightFillerWidth()
                .ivalidateBodyWrapperHeight();

			delete this.options.datas;
			delete this.options.columns;
			delete this.options.filters;
		},

		/**
		 * Build data grid structure.
		 * @returns {Datagrid} this object.
		 * @public
		 */
		buildStructure: function() {
			this.headContainer = createElement('div', 'dt-head');
			this.bodyContainer = createElement('div', 'dt-body');

			appendChild(this.container, this.headContainer);
			appendChild(this.container, this.bodyContainer);

            if (this.options.frozenColumnsNum>0) {
                this.frozenHeadWrapper = createElement('div', 'dt-frozen-head-wrapper');
                this.frozenBodyWrapper = createElement('div', 'dt-frozen-body-wrapper');
                this.frozenBody = createTable(this.options.tableClass + ' dt-table dt-body-table');
                this.frozenHead = createTable(this.options.tableClass + ' dt-table dt-head-table');

                appendChild(this.headContainer, this.frozenHeadWrapper);
                appendChild(this.bodyContainer, this.frozenBodyWrapper);
                appendChild(this.frozenHeadWrapper, this.frozenHead.table);
                appendChild(this.frozenBodyWrapper, this.frozenBody.table);

				this.scrollSpacer = createElement('div', 'dt-scroll-spacer');
				this.scrollSpacer.style.height = scrollBarSize.width + 'px';
				appendChild(this.bodyContainer, this.scrollSpacer);
            }

            this.headWrapper = createElement('div', 'dt-head-wrapper');
            this.headWrapper.style.marginRight = scrollBarSize.width + 'px';
            appendChild(this.headContainer, this.headWrapper);

            this.bodyWrapper = createElement('div', 'dt-body-wrapper');
            appendChild(this.bodyContainer, this.bodyWrapper);

            this.head = createTable(this.options.tableClass + ' dt-table dt-head-table');

            this.body = createTable(this.options.tableClass + ' dt-table dt-body-table');

            appendChild(this.headWrapper, this.head.table);
            appendChild(this.bodyWrapper, this.body.table);

            // create right filler
			this.rightFillerWrapper = createElement('div', 'dt-right-filler-wrapper');
			appendChild(this.bodyWrapper, this.rightFillerWrapper);
			this.rightFiller = createTable(this.options.tableClass + ' dt-table dt-right-filler');
			appendChild(this.rightFillerWrapper, this.rightFiller.table);

			this.rightFillerHeadWrapper = createElement('div', 'dt-right-filler-wrapper');
			appendChild(this.headWrapper, this.rightFillerHeadWrapper);
			this.rightHeadFiller = createTable(this.options.tableClass + ' dt-table dt-right-filler');
			appendChild(this.rightFillerHeadWrapper, this.rightHeadFiller.table);

            if (this.options.takeAllHeight) {
                this.bodyWrapper.style.overflow = 'auto';
                if (this.options.frozenColumnsNum>0) {
                    this.frozenBodyWrapper.style.overflow = 'auto';
                }
            }

			if (this.options.loadOnScroll) {
				this.createScrollFillers();
			}

			return this;
		},

		/**
		 * If table renders additional rows on scroll we need empty containers to have scroll bars of proper height
		 */
		createScrollFillers: function () {
			var frozenScrollFiller;
			if (this.options.frozenColumnsNum>0) {
				frozenScrollFiller = createElement('div');
				frozenScrollFiller.className = 'empty-div';
				this.frozenBodyWrapper.appendChild(frozenScrollFiller);
			}

			var scrollFiller = createElement('div');
			scrollFiller.className = 'empty-div';
			this.bodyWrapper.appendChild(scrollFiller);

			this.scrollFillers = {
				frozenScrollFiller: frozenScrollFiller,
				scrollFiller: scrollFiller
			};

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
				.bindResizeColumnEvent()
				.bindAutoResizeColumnEvents()

            if(this.options.clipboardEnabled) {
                this
                    //.bindCopyToClipboardEvent()
                    .bindSelectRowEvent();
            }
			return this;
		},
		 autoResize: function(col_id){
			 var hTable=document.createElement('table');
			 hTable.style.cssText = this.body.table.style.cssText;
			 $(hTable).css({
				 'top':'-1500px',
				 'left':'-1500px',
				 'position':'absolute'
			 });
			 document.body.appendChild(hTable);
			 var rows=$('[data-col-id='+col_id+']');
			 for(var i=0;i<rows.length;++i) {
				 var row = hTable.insertRow(i);
				 var cell=(rows[i]).cloneNode(true);
				 row.appendChild(cell);
			 }
			 $(row).css('width','auto');
			 var column=this.columns[col_id];
			 this.setColumnSize(column,$(cell).width());
			 document.body.removeChild(hTable);
		 },

		/**
		 * Bind double click events for autosize the column
		 * @return {Datagrid} this object
		 */
		bindAutoResizeColumnEvents: function(){
			var self = this;

            $(this.headContainer).on(this.options.doubleClickEvent,'.dt-resize-handle-left',function(e){
				var col_id;
				col_id = parseInt(getDataAttribute(this.parentNode, ATTR_COLUMN_ID), 10)-1;
				self.autoResize(col_id);

			});

			$(this.headContainer).on(this.options.doubleClickEvent,'.dt-resize-handle-right',function(e){
				var col_id;
				col_id = parseInt(getDataAttribute(this.parentNode, ATTR_COLUMN_ID), 10);
				self.autoResize(col_id);
					self.invalidateRightFillerWidth();
			})


			return this;
		},

		/**
		 * Bind click events for table header to perform sort action
		 * @return {Datagrid} this object.
		 */
		bindSortEvents: function() {
			var self = this;

				$(this.headContainer).on('mousedown','th.sortable',function(e){
					self.resizeFlag=false;
				})
				$(this.headContainer).on('click', 'th.sortable', function (e) {
                    if (self.resizeFlag) {
                        return;
                    }

                    var srcElement = e.originalEvent.srcElement || e.originalEvent.target;
                    if ($(srcElement).hasClass('dt-resize-handle')) {
                        return;
                    }

                    var col_id = parseInt(getDataAttribute(srcElement, ATTR_COLUMN_ID), 10);

                    if (isNaN(col_id)) {
                        return;
                    }

                    var column = self.columns[col_id];

                    if (self.sortColumns.indexOf(col_id) !== -1) {
                        column.sortAsc = !column.sortAsc;
                    } else {
                        self.sortColumns = [col_id];
                    }

                    self.sort(self.sortColumns);
                });
				return this;

		},


		/**
		 * Calculates how many rows we need to fill visible area.
		 * @returns {number} number of rows to fill visible area including hidden space on top if container was scrolled.
		 */
		getRowsToFitCount: function(){
			var visibleHeight = this.getBodyHeight();
			return Math.ceil((this.bodyWrapper.scrollTop + visibleHeight) / this.getRowHeight());
		},

		/**
		 * Bind scroll events
		 * @returns {Datagrid} this object.
		 * @public
		 */
		bindScrollEvents: function() {
			var self = this,
				bodyWrapper = this.bodyWrapper,
				fBodyWrapper = this.frozenBodyWrapper;

			var rowHeight = this.getRowHeight();
			var scrollTop, scrollLeft, prevScrollTop = 0, prevScrollLeft =0;

			function mouseWheelHandler(event, delta, deltaX, deltaY) {
				scrollTop = Math.max(0, bodyWrapper.scrollTop - (deltaY * rowHeight));
				scrollLeft = bodyWrapper.scrollLeft + (deltaX * 10);
				_scrollHandler(true);
				event.preventDefault();
			}

			function keyDownHandler(e) {
				var needScroll = false;
				if (e.which == 34) { // Page Down
					needScroll = true;
					scrollTop = Math.max(0, bodyWrapper.scrollTop + (10 * rowHeight));
				} else if (e.which == 33) { // Page Up
					needScroll = true;
					scrollTop = Math.max(0, bodyWrapper.scrollTop - (10 * rowHeight));
				} else if (e.which == 37) { // Left Arrow
					needScroll = true;
					scrollLeft = bodyWrapper.scrollLeft + 10;
				} else if (e.which == 39) { // Right Arrow
					needScroll = true;
					scrollLeft = bodyWrapper.scrollLeft - 10;
				} else if (e.which == 38) { // Up Arrow
					needScroll = true;
					scrollTop = Math.max(0, bodyWrapper.scrollTop - rowHeight);
				} else if (e.which == 40) { // Down Arrow
					needScroll = true;
					scrollTop = Math.max(0, bodyWrapper.scrollTop + rowHeight);
				}

				if (needScroll) {
					_scrollHandler(true);
					e.preventDefault();
				}
			}
			function scrollHandler() {
				scrollTop = bodyWrapper.scrollTop;
				scrollLeft = bodyWrapper.scrollLeft;
				_scrollHandler(false);
			}

			function _scrollHandler(isMouseWheel) {
				var maxScrollDistanceY = bodyWrapper.scrollHeight - bodyWrapper.clientHeight;
				var maxScrollDistanceX = bodyWrapper.scrollWidth - bodyWrapper.clientWidth;

				// Ceiling the max scroll values
				if (scrollTop > maxScrollDistanceY) {
					scrollTop = maxScrollDistanceY;
				}
				if (scrollLeft > maxScrollDistanceX) {
					scrollLeft = maxScrollDistanceX;
				}

				var vScrollDist = Math.abs(scrollTop - prevScrollTop);
				var hScrollDist = Math.abs(scrollLeft - prevScrollLeft);

				if (vScrollDist) {
					prevScrollTop = scrollTop;

					if (isMouseWheel || IS_IE9) {
						// we should also do it for ie9 because it's smooth scroll functionality works far from perfect
						// This leads to small 1 or 2 pixel difference btw frozen and common parts of a grid
						bodyWrapper.scrollTop = scrollTop;
					}

					if (self.options.frozenColumnsNum > 0) {
						fBodyWrapper.scrollTop = scrollTop;
					}

					// perform load on scroll if
					// on desktop platform &
					// end of the dataprovider is not reached &
					// scrolling down
					if(self.options.loadOnScroll && self.lastRenderedIndex<self.datas.length){
						self.appendVisibleRowsDebounced();
					}
				}

				if (hScrollDist) {
					prevScrollLeft = scrollLeft;

					if (isMouseWheel) {
						bodyWrapper.scrollLeft = scrollLeft;
					}

					self.headWrapper.scrollLeft = scrollLeft;
				}
			}

			if (self.options.frozenColumnsNum > 0) {
				$(fBodyWrapper)
					.on('mousewheel', mouseWheelHandler);
			}

			$(bodyWrapper)
				.on('mousewheel', mouseWheelHandler)
				.on('scroll', scrollHandler)
				.on('keydown', keyDownHandler);

            return this;
		},

		/**
		 * Bind event to an expand children button
		 * @return {Datagrid} this object.
		 */
		bindExpandChildrenEvents: function() {
			var self = this;

			$(this.container).on('mouseup', '.expand-children-cell', function expandChildrenHandler(event) {
                if (event.offsetX>self.options.expandChildrenButtonOffset) {
                    return true;
                }

                var cell = $(this).closest('td');
                var data = self.getRowDataByCell(cell[0]);
    
                if (event.shiftKey) {
                    self.expandAll(self.datas, !data.expanded);
                    self.render();
                    self.ivalidateBodyWrapperHeight();
                } else {
                    data.expanded = !data.expanded;
                    var button = $(cell).find('.expand-children-button')[0];
                    self.changeExpandIcon(button, data);

                    YAD.defer(function(){
                        if (data.expanded) {
                            var rowNum = cell.parent().index();
                            self.expandThat(data, rowNum);
                        } else {
                            self.collapseThat(data);
                        }
                        self.ivalidateBodyWrapperHeight();
                    });
                }
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
				maxWidth = -1,
				pos,
				resizeHandlersRight = $(this.headContainer).find('.dt-resize-handle-right'),
				resizeHandlersLeft = $(this.headContainer).find('.dt-resize-handle-left');
			var col_id;

			function dragInit(e){
				self.resizeFlag=true;
				pos = e.pageX;
				baseWidth = column.width>0?column.width : getCellWidth(column.headSizer);
				if (col_id<self.options.frozenColumnsNum) {
					// max total width of frozen columns should not be more than 70% of container
					maxWidth = self.getBodyWidth() * 0.7 - self.getFrozenColumnsWidth() + baseWidth;
				} else {
					maxWidth = -1;
				}
			}

			function dragEvent(e) {
				var pageX = e.pageX;
				if (pageX === 0) {
					return;
				}
				var newWidth = Math.max(baseWidth + pageX - pos, column.minWidth);
				if (maxWidth != -1 && newWidth>maxWidth) {
					newWidth = maxWidth;
				}
				self.setColumnSize(column, newWidth);
				self.invalidateRightFillerWidth();
			};

			resizeHandlersRight.drag('dragstart', function (e) {
				var col_id = parseInt(getDataAttribute(this.parentNode, ATTR_COLUMN_ID), 10);
                column = self.columns[col_id];
                dragInit(e);
			});

			resizeHandlersLeft.drag('dragstart', function (e) {
				var col_id = parseInt(getDataAttribute(this.parentNode, ATTR_COLUMN_ID), 10) - 1;
                column = self.columns[col_id]
				dragInit(e);
			});

			resizeHandlersLeft.drag(dragEvent);
            resizeHandlersRight.drag(dragEvent);

			return this;
		},

		setColumnSize: function(column, width) {
			//noinspection JSUnresolvedVariable
            column.headSizer.style.width = width + 'px';
			//noinspection JSUnresolvedVariable
            column.bodySizer.style.width = width + 'px';
			column.width = width;
		},

        /**
         * Expands or collapses all given rows
         * @param {Array<Data>} rows Rows to expand
         * @param {boolean} expand Expand or collapse rows
         */
        expandAll: function(rows, expand) {
            for(var i=0; i<rows.length; i++) {
                rows[i].expanded = expand;

                if (rows[i].hasChildren(this.options.childrenField)) {
                    this.expandAll(rows[i].getChildren(this.options.childrenField), expand);
                }
            }
        },

		/**
		 * Set columns to datagrid.
		 * @param {Array<Object>} columnGroups Columns or column groups. Datagrid supports column groups:
		 * If column object has `columns` property it will be rendered as a column group with `columns` inside it.
		 * @returns {Datagrid} this object.
		 * @public
		 */
		setColumns: function(columnGroups) {
			this.columns = [];

            function createColumns(colDescs, start_id) {
                var columns = [];
                for (var i=0; i<colDescs.length; i++) {
                    var colDesc = colDescs[i];
                    colDesc.column = new Column(i+start_id, colDesc);
                    columns.push(colDesc.column);
                }
                return columns;
            }

            var frozenHeaders = GroupedColumnUtil.getColumns(columnGroups.slice(0, this.options.frozenColumnsNum));
            var ordinalHeaders = GroupedColumnUtil.getColumns(columnGroups.slice(this.options.frozenColumnsNum));

            this.frozenColumns = createColumns(frozenHeaders, 0);
            this.ordinalColumns = createColumns(ordinalHeaders, frozenHeaders.length);

            this.columns = this.frozenColumns.concat(this.ordinalColumns);

			var frozenGroup = columnGroups.slice(0, this.options.frozenColumnsNum),
				ordinalGroup = columnGroups.slice(this.options.frozenColumnsNum);

			var frozenColsStructure = GroupedColumnUtil.buildHeadStructure(frozenGroup),
				ordinalColsStructure = GroupedColumnUtil.buildHeadStructure(ordinalGroup);

			GroupedColumnUtil.normalizeHeights(frozenColsStructure, ordinalColsStructure);

            if (this.options.frozenColumnsNum>0) {
                // draw frozen columns
                this
                    .setThead(this.frozenHead.thead, frozenColsStructure)
                    .createSizer(this.frozenHead.sizerHead, this.frozenColumns, 'headSizer')
                    .createSizer(this.frozenBody.thead, this.frozenColumns, 'bodySizer');
            }

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

			this._heightIsChanged = true;
			return this;
		},


		createHeadRow: function(columns) {
			var tr = createElement('tr'), th, column, txt;

			for (var i = 0, ln = columns.length; i < ln; ++i) {
				column = columns[i];
    
				txt = column.column && column.column.getHeader() || column.title;
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
					setDataAttribute(th, ATTR_COLUMN_ID, column.column.idx);

					if(column.column.idx>0 && this.columns[column.column.idx-1].resizable) {
                        txt = '<div class="dt-resize-handle dt-resize-handle-left"></div>'+txt;
                    }

                    if (column.column.resizable) {
                        txt += '<div class="dt-resize-handle dt-resize-handle-right"></div>';
                    }

					if(column.column.sortable !== false) {
                        th.className += ' sortable';
                    }

                    if (column.column.cssClass) {
                        th.className += ' ' + column.column.cssClass;
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
		 * @param {HTMLElement} thead THead element
         * @param {number} rowNum Number of empty rows to create
         * @return {Datagrid} this object
		 */
		setEmptyThead: function(thead, rowNum) {
			innerHTML(thead, '');
			for (var i = 0; i < rowNum; i++) {
				var tr = createElement('tr'),
					th = createElement('th');
                textContent(th, NBSP);
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
			var row_positions = {},
				columns = this.columns,
				sort_col_num = column_ids.length;

			this.removeSortStyles();
			this.setSortStyles(column_ids);

			// build array with row order for stable sort
			var row_num = this.datas.length;
			for (var index=0; index<row_num; index++) {
				var data = this.datas[index];
				row_positions[data.id] = index;
			}

			this.datas.sort(function (a, b) {
				var result = 0;

				if (a.summaryRow || b.summaryRow) {
					return defaultSort(a.id, b.id);
				}

				for (var i=0; i<sort_col_num; i++) {
					var col_id = column_ids[i],
						column = columns[col_id];

					result = column.sortFunction(a.get(column.sortByField), b.get(column.sortByField));

					if (!column.sortAsc) {
						result = -result;
					}

					if (result !== 0) {
						return result;
					}
				}

				return defaultSort(row_positions[a.id], row_positions[b.id]);
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

        changeExpandIcon: function(iconContainer, data) {
            iconContainer.innerHTML = data.expanded ?
                this.options.collapseChildrenButton :
                this.options.expandChildrenButton;
        },

        expandThat: function(data, rowNum) {
            var children = data.getChildren(this.options.childrenField);
            if (this.options.frozenColumnsNum>0) {
                var frozenColumns = this.createChildrenRows(data, this.frozenColumns, data.parents.concat([data.id]), this.domCache.frozenCols);
                this.frozenBody.tbody.insertBefore(frozenColumns, this.frozenBody.tbody.childNodes[rowNum].nextSibling);
            }

            var fragment = this.createChildrenRows(data, this.ordinalColumns, data.parents.concat([data.id]), this.domCache.ordinalCols);
            this.body.tbody.insertBefore(fragment,this.body.tbody.childNodes[rowNum].nextSibling);

            //create right filler
            var rightFillerBody = this.createEmptyTableFragment(children);
            this.rightFiller.tbody.insertBefore(rightFillerBody, this.rightFiller.tbody.childNodes[rowNum].nextSibling);

            return this;
        },

        collapseThat: function(data) {
            var children = data.getChildren(this.options.childrenField);
            for (var i=0; i<children.length; i++) {
                var child = children[i];

                if (this.options.frozenColumnsNum>0) {
                    this.frozenBody.tbody.removeChild(this.domCache.frozenCols[child.uid]);
                }
                this.body.tbody.removeChild(this.domCache.ordinalCols[child.uid]);

                if (child.expanded) {
                    this.collapseThat(child);
                }

                this.rightFiller.tbody.removeChild(this.rightFiller.tbody.firstChild);
            }
        },

		/**
		 * Remove all dom from table structure
		 */
		clearAll: function() {
			if (this.options.frozenColumnsNum>0) {
				removeChildren(this.frozenBody.tbody);
			}
			removeChildren(this.body.tbody);
			removeChildren(this.rightFiller.tbody);
		},

		/**
		 * Rerender full datagrid.
		 * @return {Datagrid} this object.
		 * @public
		 */
		render: function() {
			var renderTo;

			if(this.options.loadOnScroll){
				renderTo = this.getRowsToFitCount();
			} else  {
				renderTo = this.datas.length;
			}

			this.clearAll();
			this.drawPortion(0, renderTo);
			this.checkVisibility = false;
			return this;
		},

		appendVisibleRows: function () {
			var rowsToFit = this.getRowsToFitCount();

			if(rowsToFit>this.lastRenderedIndex) {
				if (rowsToFit > this.datas.length)
					rowsToFit = this.datas.length;
				this.drawPortion(this.lastRenderedIndex, rowsToFit);
			}
		},

		/**
		 * Render certain rows of data and append them to datagrid
		 * @param {Number} from Index of the first row to draw
		 * @param {Number} to Index of the last row to draw
		 * @returns {Datagrid} this object
		 */
		drawPortion:function(from, to){
			var data_frame = this.datas.slice(from, to);
			this.lastRenderedIndex = to;

			if (this.options.frozenColumnsNum>0) {
				var frozenColumns = this.createTableFragment(data_frame, this.frozenColumns, this.domCache.frozenCols);
				appendChild(this.frozenBody.tbody, frozenColumns);
			}

			var fragment = this.createTableFragment(data_frame, this.ordinalColumns, this.domCache.ordinalCols);
			appendChild(this.body.tbody, fragment);

			//create right filter
			var rightFillerBody = this.createEmptyTableFragment(data_frame);
			appendChild(this.rightFiller.tbody, rightFillerBody);

			if (this.options.loadOnScroll) {
				//decrease height of the empty div
				var newFillerHeight = (this.datas.length - to)*this.getRowHeight() + 'px';
				this.scrollFillers.scrollFiller.style.height = newFillerHeight;

				if (this.scrollFillers.frozenScrollFiller) {
					this.scrollFillers.frozenScrollFiller.style.height = newFillerHeight;
				}
			}

			return this;
		},

        /**
         * Create docuemnt fragment with table rows for given data and columns
         * @param  {Array<Data>} datas   Data to render
         * @param  {Array<Column>} columns Columns to render
         * @param {Object} domCache Dictionary with cached DOM nodes
         * @return {DocumentFragment}      DocumentFragment with `tr` rows
         */
		createTableFragment: function(datas, columns, domCache) {
			var fragment = document.createDocumentFragment();
			for (var i = 0, ln = datas.length; i < ln; ++i) {
				var data = datas[i];
				if (this.checkVisibility) {
					data.updateVisibility(this.filters, this.options.caseInsensitive);
				}

				if (data.visible) {
                    appendChild(fragment, this.createRow(data, columns, false, domCache));
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

            var countRows = function(datas) {
                var rowNum = 0;
                for (var i=0;i<datas.length; i++) {

                    if (!datas[i].visible) continue;

                    rowNum++;
                    if (datas[i].expanded) {
                        rowNum += countRows(datas[i].getChildren('children'));
                    }
                }
                return rowNum;
            };
            var rowNum = countRows(datas);

			var fragment = document.createDocumentFragment();
			for (var i = 0, ln = rowNum; i < ln; ++i) {
                var tr = createElement('tr'),
                    td = createElement('td');
                textContent(td, NBSP);
                appendChild(tr, td);
                appendChild(fragment, tr);
			}
			return fragment;
		},

		/**
		 * Create row for data.
		 * @param {Data} data Data to render.
         * @param {Array<Column>} columns to render
         * @param {Array<number> | boolean} parents List of parent ids.
         * @param {Object} domCache Dictionary with cached DOM nodes
         * @returns {HTMLElement | DocumentFragment} Row associated to data.
		 * @public
		 */
		createRow: function(data, columns, parents, domCache) {
            if (!(this.options.reuseDom && domCache[data.uid])) {
                var tr = createElement('tr');
                setDataAttribute(tr, ATTR_DATA_ID, data.id);

                if (data.level>0) {
                    tr.className = 'children-level-' + data.level;
                } else {
                    tr.className = 'dt-parent-row';
                }

                if (parents){
                    setDataArray(tr, ATTR_PARENTS, parents);
                }

                for (var i = 0, ln = columns.length; i < ln; ++i) {
                    appendChild(tr, this.createCell(data, columns[i]));
                }

                if (this.options.reuseDom) {
                    domCache[data.uid] = tr;
                }
            } else {
                tr = domCache[data.uid];
            }

            if (data.expanded != data._expandIconState && tr.children.length>0) {
                var button = tr.children[0].querySelector('.expand-children-button');
                if (button) {
                    this.changeExpandIcon(button, data);
                }
                data._expandIconState = true;
            }

			if (data.expanded) {
				parents = (parents || []);
				var children = this.createChildrenRows(data, columns, parents.concat(data.id), domCache),
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
		 * @param {Data} data Data which children should be rendered
         * @param {Array<Column>} columns Columns to render
         * @param {Array<number>} parents List of parent ids.
         * @param {Object} domCache Dictionary with cached DOM nodes
		 * @return {DocumentFragment}
		 * @public
		 */
		createChildrenRows: function(data, columns, parents, domCache) {
			var children = data.getChildren(this.options.childrenField),
				fragment = document.createDocumentFragment();

			for (var i = 0, ln = children.length; i < ln; i++) {
                appendChild(fragment, this.createRow(children[i], columns, parents, domCache));
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

            if (column.cssClass) {
                td.className = column.cssClass;
            }

            if (isNullOrUndefined(txt)) {
				txt = '';
			}

			txt = txt.toString();
			if (this.options.fixEmptyCell && !txt) {
				txt = NBSP;
			}

            if (column.idx === 0 && this.options.expandable) {
                if (data.hasChildren(this.options.childrenField)) {
                    var icon = data.expanded ?
                        this.options.collapseChildrenButton :
                        this.options.expandChildrenButton,
                        iconContainer = document.createElement('span');

                    iconContainer.className = 'expand-children-button';
                    iconContainer.innerHTML = icon;

//                    txt = '<span class="expand-children-button">'+ icon + '</span>' + txt; // expand arrow
                    td.className += ' expand-children-cell';
                    td.appendChild(iconContainer);
                } else {
                    td.appendChild(createIndentBlock(this.options.childrenPadding));
                }
			}

            if (column.idx === 0 && data.level>0 && this.options.childrenPadding>0) {
                td.insertBefore(createIndentBlock(this.options.childrenPadding * data.level), td.firstChild);
            }

            if (column.isHTML) {
                var el = document.createElement('span');
                td.appendChild(el);
                el.outerHTML = txt;
            } else {
                td.appendChild(document.createTextNode(txt));
            }
			setDataAttribute(td, ATTR_DATA_ID, data.id);
			setDataAttribute(td, ATTR_COLUMN_ID, column.idx);

			if (column.postRenderFunction)
				column.postRenderFunction(td, data);

			return td;
		},

		getBodyHeight: function() {
			if (!this._heightIsChanged) {
				this._heightIsChanged = false;
				return this._cachedBodyHeight;
			}

			var fullHeight = this.container.offsetHeight,
				headerHeight = this.headContainer.offsetHeight;

			this._cachedBodyHeight = fullHeight - headerHeight;
			return this._cachedBodyHeight;
		},

        getBodyWidth: function () {
            return this.container.offsetWidth;
        },

        getFrozenColumnsWidth: function() {
            return this.frozenBodyWrapper.offsetWidth;
        },

		/**
		 * Changes the size of all internal elements than container is changing it's size
		 * @return {Datagrid} this object.
		 * @public
		 */
        invalidateSize: function() {
			var heightChanged = true,
				widthChanged = true;

			if (widthChanged) {
				this.invalidateRightFillerWidth();

                if (this.options.frozenColumnsNum>0) {
                    this.adjustFrozenColumnsWidth();
                }
			}

            if (heightChanged) {
				this._heightIsChanged = true;
				this.ivalidateBodyWrapperHeight();

				if(this.options.loadOnScroll && this.lastRenderedIndex<this.datas.length) {
					this.appendVisibleRowsDebounced();
				}
            }
            
            return this;
		},

		/**
		 * Invalidates and synchonize column sizes and header sizes
		 * @returns {Datagrid} this object.
		 * @public
		 */
		invalidateColumnSizes: function() {
            if (this.options.frozenColumnsNum>0) {
                this.syncHeaderAndBodyWidths(
                    this.frozenHead.sizerHead.getElementsByTagName('th'),
                    this.frozenBody.thead.getElementsByTagName('th'),
                    this.frozenColumns );

                this.frozenHead.table.style.tableLayout = 'fixed';
                this.frozenBody.table.style.tableLayout = 'fixed';
            }

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
                    colWidth = column.width || 0,
					maxWidth = Math.max(head_col_width, body_col_width, colWidth);

				if (column.width>0 && column.width<maxWidth) {
					maxWidth = column.width;
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
            // Use scrollWidth instead of offsetWidth because on IOS offsetWidth was equal to
            // parent container width (which works wrong for grids with horizontal scrolling)
			var margin = this.body.table.scrollWidth + 'px';
			this.rightFillerWrapper.style.left = margin;
			this.rightFillerHeadWrapper.style.left = margin;
			return this;
		},

        /**
         * adjustFrozenColumnsWidth makes the width of the widest frozen column smaller
         * if frozen block width is wider than 70% of grid. It is used to automatically resize
         * frozen block when whole grid is resized.
         * @return {Datagrid} this object
         */
        adjustFrozenColumnsWidth: function() {
            var maxFCWidth = this.getBodyWidth()*0.7;
            if (this.getFrozenColumnsWidth() > maxFCWidth) {

                var widestCol = getWidestCol(this.frozenColumns),
                    newWid = maxFCWidth - this.getFrozenColumnsWidth() + widestCol.width;
                this.setColumnSize(widestCol, newWid);
            }
            return this;
        },

		/**
		 * Set up the height of bodyWrapper
		 * @returns {Datagrid} this object.
		 * @public
		 */
		ivalidateBodyWrapperHeight: function() {
            if (this.options.takeAllHeight) {
                return this;
            }

			var bodyHeight = this.getBodyHeight();

			this.bodyWrapper.style.height = bodyHeight + 'px';

            if (this.options.frozenColumnsNum) {
                var sb = this.hasHorizontalScroll() ? scrollBarSize.width : 0;
                this.frozenBodyWrapper.style.height = bodyHeight - sb + 'px';

				if (sb>0) {
					this.scrollSpacer.style.display = 'block';
					this.scrollSpacer.style.width = this.frozenBody.table.offsetWidth + 'px';
				} else {
					this.scrollSpacer.style.display = 'none';
				}


            }

			return this;
		},

        hasHorizontalScroll: function() {
            return this.bodyWrapper.clientHeight < this.bodyWrapper.offsetHeight;
        },


		/**
		 * Get height of one row
		 * @returns {number|*}
		 */
		getRowHeight: function(){
			if (!this._rowHeight) {
				var tr = createElement('tr'),
					td = createElement('td');

				td.appendChild(document.createTextNode('test'));
				tr.appendChild(td);

				this.body.tbody.appendChild(tr);
				this._rowHeight = tr.offsetHeight;
				this.body.tbody.removeChild(tr);
			}
			return this._rowHeight;
		},


        /** Copy To Clipboard **/
        bindSelectRowEvent: function() {
            var self = this;
            var from, to, selectionMode = false;

            function getRowId(row) {
                return getDataAttribute(row, ATTR_DATA_ID)
            }

            function getRowsBtw(from, to) {
                var btw = $(from)
                    .nextUntil(to)

                return $(from).add(btw).add(to);
            }

            function getRowById(row_id) {
                return $(self.container).find('[data-data-id=' + row_id + ']')
            }

            function unselectAll() {
                $(self.container).find('tr').removeClass('selected-row');
            }

            function selectRowRange(from, to) {
                var a = getRowById(from),
                    b = getRowById(to);

                if (a.first().index() > b.first().index()) {
                    var tmp = a; a = b; b = tmp;
                }

                var rows = getRowsBtw(a.first(), b.first()).addClass('selected-row').get();
                self.selectedRowIds = rows.map(function(row) {
                    return getRowId(row);
                });

                //for frozen cols
                for (var i = 1; i< a.length; i++) {
                    getRowsBtw(a.get(i), b.get(i)).addClass('selected-row');
                }
            }

            function selectText(element) {
                var doc = document
                    , range, selection;

                if (doc.body.createTextRange) {
                    range = document.body.createTextRange();
                    range.moveToElementText(element)
                    range.select();
                } else if (window.getSelection) {
                    selection = window.getSelection();
                    range = document.createRange();
                    range.selectNodeContents(element);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }

            self.selectionHelper = $('<div>&nbsp;</div>')
                .appendTo(self.container)
                .css({
                    position: 'absolute',
                    left: '-1000px',
                    top: '-10000px',
                    '-webkit-user-select': 'text',
                    'user-select': 'text'
                })[0];

            // IE<10 workaround to disable select
            //this.container.onselectstart = function() {return false};

            $(this.container).on('mousedown', 'tr', function (e) {
                unselectAll();
                from = getRowId(e.currentTarget);
                selectionMode = true;
            });

            $(this.container).on('mouseover', 'tr', function (e) {
                if (selectionMode) {
                    to = getRowId(e.currentTarget);

                    unselectAll();

                    if (from === to) {
                        getRowById(from).addClass('selected-row');
                        self.selectedRowIds = [from];
                    } else {
                        selectRowRange(from, to);
                    }
                }
            });

            $(this.container).on('mouseup', 'td', function(e) {
                var ids = [];
                if (selectionMode) {
                    selectionMode = false;
                    selectText(self.selectionHelper);
                }

            });
            this.bindCopyToClipboardEvent();
            return this;
        },

        bindCopyToClipboardEvent: function() {
            var self = this;
            this.selectionHelper.addEventListener('copy', function(e) {
                var spData = self.getSpreadsheetData(self.selectedRowIds);
                if (e.clipboardData) {
                    e.preventDefault();
                    e.clipboardData.setData('text/plain', spData)
                }

                if (window.clipboardData) {
                    event.returnValue = false;
                    window.clipboardData.setData('Text', spData)
                }
            });
            return this;
        },

        /**
         * Get tab seprated row data (ready for pasting to Excel or other spreadsheets.
         * @param {Array<String>} row_ids Ids of rows to get data for.
         * @returns {string}
         */
        getSpreadsheetData: function(row_ids) {
            var self = this;

            var rows_data = row_ids.map(function(row_id) {
                return self.getRowDataByIds(self.datas, [row_id]);
            })

            var rendered = rows_data.map(function(row_data) {
                return (self.columns.map(function(col) {
                    if (col.isHTML) {
                        return '';
                    } else {
                        return col.getRawValue(row_data);
                    }
                })).join('\t');
            });

            return rendered.join('\n');
        },


        /** Data API */

        /**
         * Get row data by list of ids. Each id represents a row in a level of hierarchical data
         * @param {Array<Data>} datas Rows to search
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
         * @param  {Element} cell
         * @return {Data}
         */
        getRowDataByCell: function(cell) {
            //noinspection JSCheckFunctionSignatures
            var row = cell.parentNode,
                data_id = parseInt(getDataAttribute(cell, ATTR_DATA_ID), 10),
                parents = getDataArray(row, ATTR_PARENTS) || [];

            parents.push(data_id);
            return this.getRowDataByIds(this.datas, parents);
        },

        /**
         * Returns column by cell
         * @param cell {HTMLElement} cell to get data
         * @returns {Column} column
         */
        getColumnByCell: function(cell) {
            if (cell===undefined || cell.getAttribute===undefined) {
                throw 'Can not get column by cell. ' + cell + ' is not a data grid cell';
            }

            var colId = cell.getAttribute('data-col-id');
            return this.columns[colId];
        },

        /**
         * Get list of cell parent's ids. Returns empty list for top level.
         * @param cell {HTMLElement} cell
         * @returns {Array} parent's ids
         */
        getParentIdsByCell: function(cell) {
            if (cell===undefined || cell.getAttribute===undefined) {
                throw 'Can not get column by cell. ' + cell + ' is not a data grid cell';
            }

            var parents = cell.parentNode.getAttribute('data-parents'),
                parentsList = parents ? parents.split(',') : [];

            for (var i=0; i<parentsList.length; i++) {
                parentsList[i] = parseInt(parentsList[i], 10);
            }

            return parentsList;
        },

        getRowById: function(datas, level_id) {
            for (var i=0, ln=datas.length; i<ln; i++) {
                if (datas[i].id === level_id) {
                    return datas[i];
                }
            }
        },

        getParentRowsByCell: function(cell) {
            var ids = this.getParentIdsByCell(cell),
                data = this.datas,
                rows = [];

            while (ids.length>0) {
                var row = this.getRowById(data, ids.shift());
                rows.push(row);
                data = row.getChildren(this.options.childrenField);
            }
            return rows;
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
        reuseDom: true,                 // store already created dom nodes for rows and cells and reuse in on rerendering
		frozenColumnsNum: 0,
		summaryRowNum: 0,               // number of summary rows at the bottom which don't take part in sort

        childrenField: 'children',      // name of a list with children in data
		expandChildrenButton: '⊞',
		collapseChildrenButton: '⊟',
        expandChildrenButtonOffset: 30, // clickable area in the first cell that will expand children

        childrenPadding: 10,
        takeAllHeight: false,            // take all height or use vertical scrolling
        clipboardEnabled: false,
		doubleClickEvent: 'dblclick'
    };

	// Expose to global object
	window.Datagrid = Datagrid;
	window.YAD = {
		GroupedColumnUtil: GroupedColumnUtil,
		defer: defer,
		debounce: debounce
	};
})(window, document, navigator, void 0, window.jQuery);
