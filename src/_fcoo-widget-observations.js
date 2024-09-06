/****************************************************************************
	fcoo-widget-observations.js,

	(c) 2024, FCOO

	https://github.com/FCOO/fcoo-widget-observations
	https://github.com/FCOO

****************************************************************************/

(function ($, window/*, document, undefined*/) {
	"use strict";

    //Create fcoo-namespace
    let ns = window.fcoo = window.fcoo || {},
        nsObservations = ns.observations = ns.observations || {},
        //nsParameter = ns.parameter = ns.parameter || {},
        //nsUnit = nsParameter.unit = nsParameter.unit || {},
        nsWidget = ns.widget = ns.widget || {},
        nsDB = ns.dashboard = ns.dashboard || {};


    //envBackgroundParam = {paramId: envBackgroundOptions or id}
    const envBackgroundParam = {
        'surface_sea_water_velocity': 'sea_near_surface'
    };

    nsObservations.updateLastObservationFuncList.push('updateLastObservation_widget');
    //nsObservations.updateObservationFuncList.push('updateObservation_widget');
    //nsObservations.updateForecastFuncList


    nsWidget.onClickCurentTime = null;

    nsWidget.contentTextValue = function( $content/*, widgetOptions */){
        $content.append(
            $('<span/>')._bsAddHtml({
textClass: 'THE_VALUE fw-bold',
text: 'Her kommer VALUE',
            })
        );
    },

    $.extend(nsObservations.Location.prototype, {
        //**********************************************************
        updateLastObservation_widget: function(){
            if (!this.observationGroupWidgets)
                return;

            //Update widget
            let _this = this;
            $.each(this.observationGroupStations, function(observationGroupId, station){
                let widget = _this.observationGroupWidgets[observationGroupId];

                if (!widget) return;

                let param    = station.primaryParameter,
                    dataSet  = station.getDataSet(true, false), //Last observation
                    showData = station.datasetIsRealTime(dataSet);


                if (showData){
                    //Update widget with last observation
                    if (param.type == 'vector'){
                        let parts = station.getVectorFormatParts(dataSet, false).find( (part) => part.vectorParameterId == param.id );
                        if (parts){
                            widget.setDirection(parts.direction);

widget.$container.find('.THE_VALUE').html(parts.speedAndUnitStr);
                        }
                        else
                            showData = false;
                    }
                    else {
                        //Scale data TODO
                    }
                }

//HER                   if (!showData){
//HER                   }

                //Hide or show data
                widget.toggleDataAvailable( !!showData );


                //Set time of update
                widget.$edge['bottomright'].find('span').vfValue( moment() );
            });

        },



        //**********************************************************
        updateObservation_widget: function(){

        },

        //**********************************************************
        getWidget: function(observationGroupId, options = {}){

            let ogw = this.observationGroupWidgets = this.observationGroupWidgets || {};
            ogw[observationGroupId] = ogw[observationGroupId] || this.createWidget(observationGroupId, options);
            return ogw[observationGroupId];
        },

        //**********************************************************
        createWidget: function(observationGroupId, options){
                let obsGroup = this.observationGroups[observationGroupId],
                    station  = this.observationGroupStations[observationGroupId],
                    param    = station.primaryParameter;

            let envBackground = envBackgroundParam[param.id];
            if (typeof envBackground == 'string')
                envBackground = nsWidget.envBackgroundOptions[envBackground];

            let widgetOptions = $.extend(true, {}, {
                innerWidth : 300,
                innerHeight: 300,
                //noPadding: true,

                envBackground: envBackground,

                header       : {icon: obsGroup.faIcon, iconClass:'obs-group-icon-container', text: this.name},
                fixedHeader  : param.name, //without unit
                //or
                //fixedHeader  : obsGroup.header, //With unit
                minimized: {
                    fixed: true,
                    noPadding     : false,
//HER                       content: inclDir ? [{content: '_DIRECTION_', size:'lg'}] : id,
                    widgetContent : true,
                    envBackground : true,
                    noData        : true,
                    noDataFontSize: 'nl',
                    innerHeight   : '2em'
                },
                widgetContent   : true,
                relativeFontSize: true,
                direction       : true, //or false or 'from'
                directionCircle : true,

                content: [{
                        text: param.name
                    },{
                        content: nsWidget.contentTextValue,
                        _size:'sm',
                        textClass:'fw-bold'
                    },{
                        content: '_DIRECTION_',
                        _size:'sm'
                    }
                ],

                noData        : true,
                noDataFontSize: 'xl',

                edge: {
                    //topcenter: {icon:'fat fa-home', size: 'lg'},
                    //middleleft: {icon:'fat fa-ruler-vertical', size:'xl'},
                    //middleright: {icon: 'fat fa-temperature-full', size:'xl'},
                    bottomright: {
                        //Time of last update
                        vfFormat: 'time_now_sup',
                        vfValue : moment(),
                        size    : 'xxs',
                        onClick : nsWidget.onClickCurentTime
                    }
                }
            }, options);

            var widget = new nsWidget.Widget( widgetOptions );

            return widget;
        },

        updateWidget: function(){

        }
    });


    /**********************************************************
    Add all
    **********************************************************/
    nsDB.widgetProvider['OBSERVATIONS'] = function(options, addMenu, adjustParentMenuOptions){

        nsObservations.getFCOOObservations( (fcooObservations) => {
            let menuList = [];
            fcooObservations.observationGroupList.forEach(observationGroup => {

console.log(observationGroup);
                menuList.push({
                    id       : observationGroup.id,
                    icon     : observationGroup.faIcon,
                    iconClass: 'obs-group-icon-container',
                    text     : observationGroup.name,
                    type     : 'checkbox'
                });
            });
            addMenu( menuList );
        }/*, {
            locationFileName: 'locations.json',
            fileName: [
                'observations-sealevel.json',
                'observations-current-surface.json',
                'observations-current-seafloor.json'
            ],
            lastObservationFileName : 'LastObservations_SEALVL.json LastObservations_CURRENT.json',
        }*/);

        adjustParentMenuOptions({icon: {colorName:'observations', round: false}});


    }
}(jQuery, this, document));