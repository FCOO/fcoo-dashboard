/****************************************************************************
    fcoo-dashboard.js,

    (c) 2024, FCOO

    https://github.com/FCOO/fcoo-dashboard
    https://github.com/FCOO


Dashboard shows different information in widgets with different sizes.
The user select witch widgets to show and the placement of the widgets on the interface.

The providers of the different widgets are objects from different packages that provide
a number of methods (see below). This could be fcoo-maps-observations, fcoo-maps-niord etc.

The object must "add" themself with the method window.fcoo.dashboard.addToWidgetList( obj )

The object must provide a number of methods in obj.widget

****************************************************************************/

(function ($, window/*, document, undefined*/) {
    "use strict";

    //Create fcoo-namespace
    let ns = window.fcoo = window.fcoo || {},
        nsDB = ns.dashboard = ns.dashboard || {};

    /**************************************************************
    ***************************************************************
    nsDS.widgetProvider = {ID: CREATE_MAPLAYER_AND_MENU_FUNCTION}
    MAPLAYER_ID: STRING
    CREATE_MAPLAYER_AND_MENU_FUNCTION: function(options, addMenu: function(menuItem or []menuItem)
    Each widget-provider must add a CREATE_MAPLAYER_AND_MENU_FUNCTION-function to nsDS.widgetProviders:

        nsDB.nsDS.widgetProviders[ID] = function(options, addMenu){
            //Somewhere inside the function or inside a response call
            //addMenu({id:ID, icon:..., text:..., type:...}, or
            //addMenu(this.menuItemOptions())
        };
    ***************************************************************
    **************************************************************/
    nsDB.widgetProvider    = {};

    //Global list of widget-providers
    nsDB.widgetProviderList = [];


    nsDB.addToWidgetList = function( obj ){
        obj.widgetProviderId = 'wp'+nsDB.widgetProviderList.length; //Perhaps not needed

        nsDB.widgetProviderList.push(obj);
        nsDB.widgetProviders[obj.widgetId] = obj;  //Perhaps not needed

        obj.widget = obj.widget || {};
        $.extend(obj.widget, standarWidgetMethods);

        return obj;
    };


    /***********************************************************************
     ***********************************************************************
    Dashboard
    options:
    Grid Options
    acceptWidgets - Accept widgets dragged from other grids or from outside (default: false). Can be:
        true will accept HTML element having 'grid-stack-item' as class attribute, else false
        string for explicit class name to accept instead
        function (el: Element): boolean function called before an item will be accepted when entering a grid. the function will be passed the item being dragged, and should return true | false. See example

    alwaysShowResizeHandle - possible values (default: mobile) - does not apply to non-resizable widgets
        false the resizing handles are only shown while hovering over a widget
        true the resizing handles are always shown
        'mobile' if running on a mobile device, default to true (since there is no hovering per say), else false. See mobile

    animate - turns animation on to smooth transitions (default: true)

    auto - if false gridstack will not initialize existing items (default: true)

    cellHeight- one cell height (default?: 'auto'). Can be:
        an integer (px)
        a string (ex: '100px', '10em', '10rem', '10cm'). Note: % doesn't right - see CellHeight
        0, in which case the library will not generate styles for rows. Everything must be defined in your own CSS files.
        auto - height will be calculated for square cells (width / column) and updated live as you resize the window - also see cellHeightThrottle
        initial - similar to 'auto' (start at square cells) but stay that size during window resizing.

    cellHeightThrottle?: number - throttle time delay (in ms) used when cellHeight='auto' to improve performance vs usability (default?: 100).
        A value of 0 will make it instant at a cost of re-creating the CSS file at ever window resize event!

    children?: GridStackWidget[] - list of children item to create when calling load() or addGrid()

    column - Integer > 0 (default 12) which can change on the fly with column(N) API, or 'auto' for nested grids to size themselves to the parent grid container (to make sub-items are the same size). See column and nested

    columnOpts?:Responsive - describes the responsive nature of the column grid. see Responsive interface.

    class?: string - additional class on top of '.grid-stack' (which is required for our CSS) to differentiate this instance

    disableDrag - disallows dragging of widgets (default: false).

    disableResize - disallows resizing of widgets (default: false).

    draggable - allows to override draggable options - see DDDragOpt. (default: {handle: '.grid-stack-item-content', appendTo: 'body', scroll: true})

    engineClass - the type of engine to create (so you can subclass) default to GridStackEngine

    sizeToContent: boolean - make gridItems size themselves to their content, calling resizeToContent(el) whenever the grid or item is resized.

    float - enable floating widgets (default: false) See example

    handle - draggable handle selector (default: '.grid-stack-item-content')

    handleClass - draggable handle class (e.g. 'grid-stack-item-content'). If set handle is ignored (default: null)

    itemClass - widget class (default: 'grid-stack-item')

    margin - gap size around grid item and content (default: 10). Can be:
        an integer (px)
        a string (ex: '2em', '20px', '2rem')

    marginTop: numberOrString - can set individual settings (defaults to margin)

    marginRight: numberOrString

    marginBottom: numberOrString

    marginLeft: numberOrString

    maxRow - maximum rows amount. Default is 0 which means no max.

    minRow - minimum rows amount which is handy to prevent grid from collapsing when empty. Default is 0. You can also do this with min-height CSS attribute on the grid div in pixels, which will round to the closest row.

    nonce - If you are using a nonce-based Content Security Policy, pass your nonce here and GridStack will add it to the <style> elements it creates.

    placeholderClass - class for placeholder (default: 'grid-stack-placeholder')

    placeholderText - placeholder default content (default: '')

    resizable - allows to override resizable options. (default: {handles: 'se'}). handles can be any combo of n,ne,e,se,s,sw,w,nw or all.

    removable - if true widgets could be removed by dragging outside of the grid. It could also be a selector string, in this case widgets will be removed by dropping them there (default: false) See example

    removeTimeout - time in milliseconds before widget is being removed while dragging outside of the grid. (default: 2000)

    row - fix grid number of rows. This is a shortcut of writing minRow:N, maxRow:N. (default 0 no constrain)

    rtl - if true turns grid to RTL. Possible values are true, false, 'auto' (default: 'auto') See example

    staticGrid - removes drag|drop|resize (default false). If true widgets are not movable/resizable by the user, but code can still move and oneColumnMode will still work. You can use the smaller gridstack-static.js lib. A CSS class grid-stack-static is also added to the container.

    styleInHead - if true will add style element to <head> otherwise will add it to element's parent node (default false).

    ***********************************************************************
    ***********************************************************************/
    let dashboardId = 0;


    let defaultGridStackOptions = {
            acceptWidgets           : true,
            alwaysShowResizeHandle  : true,


            column: 12,
            class: '',


float: false, //TRY true -  - enable floating widgets (default: false) See example


        margin: 4,

//HER       marginTop: numberOrString - can set individual settings (defaults to margin)
//HER       marginRight: numberOrString
//HER       marginBottom: numberOrString
//HER       marginLeft: numberOrString

//    maxRow - maximum rows amount. Default is 0 which means no max.

            minRow   : 1,   //minimum rows amount which is handy to prevent grid from collapsing when empty. Default is 0. You can also do this with min-height CSS attribute on the grid div in pixels, which will round to the closest row.

            resizable: { handles: 's,se,e' },

        };


    function Dashboard( options = {}, widgetList = []) {
        this.options = $.extend({
            //Default options - MANGLER
            direction   : 'both', //for scrollBooster

//            column      : 12,
            widgetWidth : 200,
            widgetHeight: 200,
            margin      : 4,
            inclSubGrids: false, //true
        }, options);


        this.id = this.options.id || 'DB' + dashboardId++;

        //Calc column width from widgetWidth or reverse
        if (this.options.columnWidth)
            this.options.widgetWidth = this.options.columnWidth - 2*this.options.margin;
        else
            this.options.columnWidth = this.options.widgetWidth + 2*this.options.margin;

        this.options.widgetHeight = this.options.cellHeight = this.options.widgetHeight  + 2*this.options.margin;

        //this.options.gridStackWidth = (this.options.widgetWidth + 2*this.options.margin) * this.options.column;
        this.options.gridStackWidth = this.options.columnWidth * this.options.column;


        this.subGridOptions = {
            cellHeight      : this.options.cellHeight,
            column          : 'auto', // size to match container. make sure to include gridstack-extra.min.css
            acceptWidgets   : true, // will accept .grid-stack-item by default
            margin          : this.options.margin,
            subGridDynamic  : true, // make it recursive for all future sub-grids
        };

        this.gridStackOptions = $.extend({}, defaultGridStackOptions, {
            column      : this.options.column,
            cellHeight  : this.options.cellHeight,
            margin      : this.options.margin,
            subGridOpts : this.subGridOptions
        });


        this.widgetList = [];
        this.widgets = {};
        widgetList.forEach( widgetOptions => this.addWidget( widgetOptions ) );

/*
let menuOptions = {
    ownerList  : nsDB.widgetProvider,
    //keepAll: true,
    finallyFunc: function(menuList){ console.log('finallyFunc', menuList)}
}

ns.promiseList.appendLast({
    data: {},
    resolve: function(){
        ns.createFCOOMenu(menuOptions);
        ns.promiseList.getAll();
    }
});
//*/
    }


    // expose access to the constructor
    nsDB.Dashboard = Dashboard;

    nsDB.dashboard = function(options, arg2, arg3){
        return new Dashboard(options, arg2, arg3);
    };




    /**************************************************************
    Dashboard methods
    **************************************************************/
    nsDB.Dashboard.prototype = {

        /************************************************
        addWidget: function( widgetOptions )
        ************************************************/
        addWidget: function( widgetOptions, addToGrid ){
            let newWidget = new nsDB.DashboardWidget(widgetOptions, this);
            newWidget.index = this.widgetList.length;
            this.widgetList.push( newWidget );
            this.widgets[newWidget.id] = newWidget;

            if (addToGrid)
                newWidget.addToGrid();

            if (this.inEditMode){
                newWidget.editMode_added   = true;
                newWidget.editMode_removed = false;
            }

        },

        /************************************************
        addSubGrid: function(options)
        Not working
        ************************************************/
/*
        addSubGrid: function(options = {}){
            options = $.extend({
                w   : 1,
                h   : 1,
                minW: 1,
                maxW: this.options.column,
                minW: 1,
                maxW: this.options.column
            }, options);

            let subOptions = {
                    cellHeight: 208, // should be 50 - top/bottom
                    column: 'auto', // size to match container. make sure to include gridstack-extra.min.css
                    acceptWidgets: true, // will accept .grid-stack-item by default
                    margin: 4,
                    subGridDynamic: true
                };

            this.gridStack.addWidget({
                cellHeight  : this.options.cellHeight,
                x: 0, y: 0, w:2, h:2,
                sizeToContent: true,
                column: 'auto', // size to match container. make sure to include gridstack-extra.min.css
                acceptWidgets: true, // will accept .grid-stack-item by default
                margin: 4,
                subGridDynamic: true,
                subGridOpts: {
                    children: [{x:0, y:0}],
                    ...this.subGridOptions
                }
            });


DEMO:
            let $gridDiv = $('<div id="gsi-1" gs-x="0" gs-y="0" gs-w="3" gs-h="2" gs-auto-position="true"></div>').appendTo(this.$grid),
                $nested = $('<div class="grid-stack" id="nested-grid"></div>').appendTo($gridDiv);

            $('<div id="gsi-2" gs-x="0" gs-y="0" gs-w="3" gs-h="2" gs-auto-position="true"></div>').appendTo($nested);

            this.gridStack.makeSubGrid($nested.get(0));
        },
*/

        /************************************************
        removeWidget: function( widgetOrWidgetId )
        ************************************************/
        removeWidget: function( widgetOrWidgetId ){
            let widgetId = typeof widgetOrWidgetId == 'string' ? widgetOrWidgetId : widgetOrWidgetId.id,
                widget = this.widgets[widgetId];

            //Remove the widget from the lists
            this.widgetList.splice(widget.index, 1);
            delete this.widgets[widgetId];

            //Re-calc index
            this.widgetList.forEach( (w, index) => w.index = index);

            //Remove the widget from the grid
            if (widget.$gridStackItem)
                widget.remove(false);

        },

        /************************************************
        visitAllWidgets: function(func, method)
        ************************************************/
        visitAllWidgets: function(func, method){
            let _this = this;
            $.each( this.widgets, (id, widget) => {
                if (func)
                    func(widget, _this);
                if (method){
                    if (typeof method == 'string')
                        widget[method](_this);
                    else
                        method.bind(widget)(_this);
                }
            });
            return this;
        },

        /************************************************
        createContent: function($container){
        ************************************************/
        createContent: function($container){
            this.$container = $container;
            this.$container
                .css('overflow', 'scroll')
                .addClass('scrollbooster-container grid-stack-container')
                .on('scroll', this.updateScrollInfo.bind(this) )
                .resize( this.updateScrollInfo.bind(this) )
                .on('mouseleave', () => {
                    if (this.scrollBooster && this.scrollBooster.isDragging)
                        this.scrollBooster.events.pointerup();
                });

            (this.options.$modernizrContainer || this.$container).modernizrOff('edit-mode');

            this.$grid = $('<div class="grid-stack"></div>')
                            .width( this.options.gridStackWidth )
                            .appendTo(this.$container);

            this.$grid.get(0).style.setProperty('grid-widget-cell-height', this.options.cellHeight+'px');

            let gridStack = this.gridStack = window.GridStack.init(this.gridStackOptions);

            //Set min-height
            gridStack.on('change', this.onChange.bind(this) );

            //Add widgets to grid
            this.widgetList.forEach(widget => widget.addToGrid());


            //Create ScrollBooster to allow ccroll by mouse dragging
            this.scrollBooster = new window.ScrollBooster({
                viewport                        : this.$container.get(0),   //DOM Node    null    Content viewport element (required)
                content                         : this.$grid.get(0),        //DOM Node    viewport child element    Scrollable content element inside viewport
                scrollMode                      : 'native',                 //String    undefined    Scroll technique - via CSS transform or natively. Could be 'transform' or 'native'
                direction                       : this.options.direction == 'both' ? 'all' : this.options.direction,    //String    'all'    Scroll direction. Could be 'horizontal', 'vertical' or 'all'
                bounce                          : false, //Boolean   true    Enables elastic bounce effect when hitting viewport borders
              //textSelection                   : false, //Boolean   false   Enables text selection inside viewport
              //inputsFocus                     : true,  //Boolean   true    Enables focus for elements: 'input', 'textarea', 'button', 'select' and 'label'
              //pointerMode                     : 'all', //String    'all'   Specify pointer type. Supported values - 'touch' (scroll only on touch devices), 'mouse' (scroll only on desktop), 'all' (mobile and desktop)
              //friction                        : 0.05,  //Number    0.05    Scroll friction factor - how fast scrolling stops after pointer release
              //bounceForce                     : 0.1,   //Number    0.1     Elastic bounce effect factor
              //emulateScroll                   : false, //Boolean   false   Enables mouse wheel/trackpad emulation inside viewport
              //preventDefaultOnEmulateScroll   : false, //String    false   Prevents horizontal or vertical default when emulateScroll is enabled (eg. useful to prevent horizontal trackpad gestures while enabling vertical scrolling). Could be 'horizontal' or 'vertical'.
              //lockScrollOnDragDirection       : false, //String    false   Detect drag direction and either prevent default mousedown/touchstart event or lock content scroll. Could be 'horizontal', 'vertical' or 'all'
              //dragDirectionTolerance          : 40,    //Number    40      Tolerance for horizontal or vertical drag detection
              //onUpdate                        : this.sb_onUpdate.bind(this),  //Function  noop    Handler function to perform actual scrolling. Receives scrolling state object with coordinates
              //onClick                         : null,  //Function  noop    Click handler function. Here you can, for example, prevent default event for click on links. Receives object with scrolling metrics and event object. Calls after each click in scrollable area
              //onPointerDown                   : null,  //Function  noop    mousedown/touchstart events handler
              //onPointerUp                     : null,  //Function  noop    mouseup/touchend events handler
              //onPointerMove                   : null,  //Function  noop    mousemove/touchmove events handler
              //onWheel                         : null,  //Function  noop    wheel event handler
                shouldScroll                    : this.sb_shouldScroll.bind(this),  //Function  noop    Function to permit or disable scrolling. Receives object with scrolling state and event object. Calls on pointerdown (mousedown, touchstart) in scrollable area. You can return true or false to enable or disable scrolling
            });

            gridStack.disable();
        },


        /************************************************
        ScrollBooster events
        ************************************************/
        sb_onUpdate: function(/*state*/){
            //console.log('onUpdate state', state.position.x, state.position.y, state);
        },

        sb_shouldScroll: function(options, event){
            //If in edit-mode: prevent scrolling when dragging widget by only allowing scroll by certain elements
            if (this.inEditMode){
                let classList = event && event.target && event.target.classList ? event.target.classList : [];
                return classList.contains('scrollbooster-container') || classList.contains('grid-stack') || classList.contains('grid-stack-item');
            }
            else
                return true;
        },


        /************************************************
        createScrollInfo
        Create a element showing the visible columns
        ************************************************/
        _setScrollInfoVar: function(id, value){
            this.scrollInfo.style.setProperty('--'+id, value);
            return this;
        },

        createScrollInfo: function($container, options = {}){
            options = $.extend({
                'width'         : '100%',
                'max-width'     : '600px',
                'height'        : '20px',
                'font-size'     : '13px',
                'line-height'   : 1.5,
                'margin'        : '4px auto',
            }, options);

            this.$scrollInfo =
                $('<div/>')
                    .addClass('dashboard-scroll-info')
                    .css(options)
                    .on('click', this.scrollInfo_onClick.bind(this) )
                    .appendTo($container);
            this.scrollInfo = this.$scrollInfo.get(0);

            this._setScrollInfoVar('column', this.options.column );
            this.gridOuterWidth = this.$grid.outerWidth();

            for (var i=0; i<this.options.column; i++)
                $('<div style="text-align: center">'+(i+1)+'</div>')
                    .addClass('column')
                    .attr('db-si-column-index', i)
                    .appendTo(this.$scrollInfo);
        },

        /************************************************
        updateScrollInfo
        Update the scroll-info-element (if any) with the position and scroll
        ************************************************/
        updateScrollInfo: function(){
            if (this.$scrollInfo){
                let factor = this.$scrollInfo.width() / this.gridOuterWidth;
                this._setScrollInfoVar('scrollbar-width', (this.$container.width()      * factor) + 'px');
                this._setScrollInfoVar('scrollbar-left',  (this.$container.scrollLeft() * factor) + 'px');
            }
        },

        scrollInfo_onClick: function(event){
            if (event && event.target){
                let cIndex = parseInt($(event.target).attr('db-si-column-index')),
                    left = Math.max(0, (cIndex + .5)*this.options.columnWidth - this.$container.width()/2);
                if (this.scrollBooster){
                       this.scrollBooster.scrollTo({x: left, y: this.$container.scrollTop()});
                       this.scrollBooster.updateMetrics();
                }
                else
                    this.$container.scrollLeft(left);
            }
        },

        /************************************************
        set/unset edit-mode
        ************************************************/
        editModeOn : function(){ return this.toggleEditMode(true); },
        editModeOff: function(){ return this.toggleEditMode(false); },
        toggleEditMode: function(on){
            if (typeof on == 'boolean')
                this.inEditMode = on;
            else
                this.inEditMode = !this.inEditMode;

            (this.options.$modernizrContainer || this.$container).modernizrToggle('edit-mode', !!this.inEditMode);

            this.inEditMode ? this.gridStack.enable() : this.gridStack.disable();

            //Save current state and reset all widgets' editMode_added editMode_removed
            if (this.inEditMode){
                this.backupGrid = this.gridStack.save(false, false);

                this.visitAllWidgets(widget => {
                    widget.editMode_added   = false;
                    widget.editMode_removed = false;
                });
            }

            if (this.options.onEditMode)
                this.options.onEditMode(this.inEditMode, this);

        },

        /************************************************
        editOk: function(event)
        ************************************************/
        editOk: function(event){
            this.editModeOff();


            this.visitAllWidgets( widget => {
                //Removed added widgets and rebuild deleted widgets
                //if (widget.editMode_added){
                    // Nothing
                //}

                if (widget.editMode_removed)
                    this.removeWidget(widget);
            });

            [this.options.onEditOk, this.options.onEditEnd, event].forEach( func => {
                if (func)
                    func(this);
            });
        },

        /************************************************
        editCancel: function(event)
        ************************************************/
        editCancel: function(event){
            this.editModeOff();

            this.gridStack.load(this.backupGrid);

            this.visitAllWidgets( widget => {
                //Removed added widgets and rebuild deleted widgets
                //if (widget.editMode_added){
                //}

                if (widget.editMode_removed)
                    widget.restoreContent();

            });

            [this.options.onEditCancel, this.options.onEditEnd, event].forEach( func => {
                if (func)
                    func(this);
            });
        },


        //onScroll: function(){
        //},


        /************************************************
        onChange: function(event, widgetList)
        ************************************************/
        onChange: function(event, widgetList){
            if (this.scrollBooster)
                this.scrollBooster.updateMetrics();

            if (widgetList)
                widgetList.forEach(widget => {
                    widget.onChange(event);
                });
        },

    };


    /***********************************************************************
     ***********************************************************************
    DashboardWidget
    options:

    ***********************************************************************
    ***********************************************************************/
    let widgetIndex = 0;
    nsDB.DashboardWidget = function( options, dashboard ){
        this.options = $.extend({
            width   : 1,
            height  : 1
        }, options);

        this.id = this.options.id = this.options.id || dashboard.id + 'W' + widgetIndex++;

        this.dashboard = dashboard;

        this.options.minW = this.options.minWidth  = Math.min(this.options.minWidth  || this.options.width,  this.options.width );
        this.options.maxW = this.options.maxWidth  = Math.max(this.options.maxWidth  || this.options.width,  this.options.width );
        this.options.minH = this.options.minHeight = Math.min(this.options.minHeight || this.options.height, this.options.height);
        this.options.maxH = this.options.maxHeight = Math.max(this.options.maxHeight || this.options.height, this.options.height);

        this.resizableW = this.options.minWidth != this.options.maxWidth;
        this.resizableH = this.options.minHeight != this.options.maxHeight;
        this.resizable = this.resizableW || this.resizableH;
        this.resizeIcon = '';
        this.resizeIconPos = '';
        if (this.resizable){
            this.resizeIcon = 'far fa-arrows-up-down fa-rotate-45';
            this.resizeIconPos = 'se';
            if (!this.resizableH){
                this.resizeIcon = 'far fa-arrows-left-right';
                this.resizeIconPos = 'e';
            }
            if (!this.resizableW){
                this.resizeIcon = 'far fa-arrows-up-down';
                this.resizeIconPos = 's';
            }
        }

        this.options.content =
            '<div class="widget-edit-mode show-for-edit-mode"></div>' +
            '<div class="dashboard-widget-content">'+
                (typeof this.options.content == 'string' ? this.options.content : '') +
            '</div>';


        /*
        There are multiple ways to create the content of the widget
        1: Simple html-element options.content, or
        2: options.createContent: function($container, widget): create the content inside $container, or
        3: options.fcooOwnerId (and fcooOwnerOptions) (see MANGLER) that reference to an object with the method createWidgetContent (ELLER NOGET ANDET)
        */


    };


    nsDB.DashboardWidget.prototype = {
        gridStack: function(){
            return this.dashboard.gridStack;
        },

        /***********************************************************************
        ***********************************************************************/
        addToGrid: function(){
            let elem = this.dashboard.gridStack.addWidget( this.options ),
                $elem = this.$gridStackItem = $(elem);

            this.gridStackElem = elem;
            this.$container = $elem.find('.dashboard-widget-content');
            this.$editMode = $elem.find('.widget-edit-mode');

            if (this.resizeIcon)
                $elem.addClass('resize-at-'+this.resizeIconPos);

            this.createContent(this.$container);
        },

        /***********************************************************************
        ***********************************************************************/
        createContent: function($container){
            this.$editMode.addClass('no-drawing');
            //Create semi-transparent layer to show in edit-mode
            let $table = $('<table/>')
                            .width(this.dashboard.options.widgetWidth * 2/3)
                            .appendTo(this.$editMode);
            function addRow(){ return $('<td/>').appendTo( $('<tr/>').appendTo($table) ); }

            addRow()._bsAddHtml({icon:'far fa-arrows-up-down-left-right', text:{da:'Flyt', en:'Move'}});

            if (this.resizable)
                addRow()._bsAddHtml({icon:this.resizeIcon, text:{da:'Ændre str.', en:'Resize'}});
            else
                addRow()._bsAddHtml({text: '&nbsp;'});
            $.bsButton({
                icon     : 'fas fa-xmark',
                text     : {da:'Fjern', en:'Remove'},
                fullWidth: true,
                onClick  : function(){
                    this.editModeRemoved = true;
                    this.remove(!this.editModeAdded);
                }.bind(this)
            }).appendTo( addRow() );


            /*
            Create the content:
            1: Simple html-element options.content, or
            2: options.createContent: function($container, widget): create the content inside $container, or
            3: options.fcooOwnerId (and fcooOwnerOptions) (see MANGLER) that reference to an object with the method createWidgetContent (ELLER NOGET ANDET)
            */
            if (this.options.createContent)
                this.options.createContent($container, this);
            else
                if (this.options.fcooOwnerId){
                    /*
                    MANGLER, men noget i retning af
                    let owner = ns.fcooFindObj(this.options.fcooOwnerId);
                    if (owner && owner.createWidgetContent)
                        owner.createWidgetContent($container, this.options.fcooOwnerOptions);

                    */
                }

        },


        /***********************************************************************
        ***********************************************************************/
        onChange: function(/*event*/){

        },


        /***********************************************************************
        ***********************************************************************/
        remove: function(temporary){
            //If temporary: Save content by remove it from widget-elem. It permanent: set it to null to ensure removal from DOM
            temporary = (temporary === true);
            if (temporary){
                this.$container.detach();
                this.$editMode.detach();
                this.editMode_removed = true;

            }
            else {
                this.$container = null;
                this.$editMode  = null;
            }

            this.gridStack().removeWidget( this.$gridStackItem.get(0), true, !temporary);
            this.$gridStackItem = null;

            this.dashboard.scrollBooster.updateMetrics();
        },

        restoreContent: function(){
            //Find $gridStackItem and attach this.$container and this.$editMode
            this.$gridStackItem = this.dashboard.$grid.find('[gs-id='+this.id+']');
            let $content = this.$gridStackItem.find('.grid-stack-item-content');
            if ($content.length){
                this.$editMode.appendTo($content);
                this.$container.appendTo($content);
            }

            if (this.resizeIcon)
                this.$gridStackItem.addClass('resize-at-'+this.resizeIconPos);
        }
    };


    /**************************************************************
    **************************************************************/
    let standarWidgetMethods = {



    };


}(jQuery, this, document));
