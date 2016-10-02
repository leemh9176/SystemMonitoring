jui.define("chart.widget.dragselect", [ "util.base" ], function(_) {

    /**
     * @class chart.widget.dragselect
     * @extends chart.widget.core
     * @alias DragSelectWidget
     * @requires util.base
     *
     */
    var DragSelectWidget = function() {
        var thumb = null;

        this.setDragEvent = function(brush) {
            var self = this,
                axis = this.chart.axis(brush.axis),
                isMove = false,
                mouseStartX = 0,
                mouseStartY = 0,
                thumbWidth = 0,
                thumbHeight = 0,
                startValueX = 0,
                startValueY = 0;

            this.on("axis.mousedown", function(e) {
                if(isMove) return;

                isMove = true;
                mouseStartX = e.bgX;
                mouseStartY = e.bgY;
                startValueX = axis.x.invert(e.chartX);
                startValueY = axis.y.invert(e.chartY);

                this.chart.emit("dragselect.start");
            }, brush.axis);

            this.on("axis.mousemove", function(e) {
                if(!isMove) return;

                thumbWidth = e.bgX - mouseStartX;
                thumbHeight = e.bgY - mouseStartY;

                // Reset drag
                resetDragDraw();

                // Draw drag
                this.onDrawStart(mouseStartX, mouseStartY, thumbWidth, thumbHeight);
            }, brush.axis);

            this.on("axis.mouseup", endZoomAction, brush.axis);
            this.on("chart.mouseup", endZoomAction);
            this.on("bg.mouseup", endZoomAction);

            function endZoomAction(e) {
                isMove = false;
                if(thumbWidth == 0 || thumbHeight == 0) return;

                searchDataInDrag(axis.x.invert(e.chartX), axis.y.invert(e.chartY));
                resetDragStatus();
            }

            function searchDataInDrag(endValueX, endValueY) {
                // x축 값 순서 정하기
                if(startValueX > endValueX) {
                    var temp = startValueX;
                    startValueX = endValueX;
                    endValueX = temp;
                }

                // y축 값 순서 정하기
                if(startValueY > endValueY) {
                    var temp = startValueY;
                    startValueY = endValueY;
                    endValueY = temp;
                }

                if(self.widget.dataType == "area") {
                    emitDragArea(startValueX, startValueY, endValueX, endValueY);
                } else {
                    emitDataList(startValueX, startValueY, endValueX, endValueY);
                }
            }

            function emitDataList(startValueX, startValueY, endValueX, endValueY) {
                var xType = axis.x.type,
                    yType = axis.y.type,
                    datas = axis.data,
                    targets = brush.target,
                    dataInDrag = [];

                // 해당 브러쉬의 데이터 검색
                for(var i = 0; i < datas.length; i++) {
                    var d = datas[i];

                    for(var j = 0; j < targets.length; j++) {
                        var v = d[targets[j]];

                        // Date + Range
                        if(xType == "date" && yType == "range") {
                            var date = d[axis.get("x").key];

                            if(_.typeCheck("date", date)) {
                                if( (date.getTime() >= startValueX.getTime() && date.getTime() <= endValueX.getTime()) &&
                                    (v >= startValueY && v <= endValueY) ) {
                                    dataInDrag.push(getTargetData(i, targets[j], d));
                                }
                            }
                        } else if(xType == "range" && yType == "date") {
                            var date = d[axis.get("y").key];

                            if(_.typeCheck("date", date)) {
                                if( (date.getTime() >= startValueY.getTime() && date.getTime() <= endValueY.getTime()) &&
                                    (v >= startValueX && v <= endValueX) ) {
                                    dataInDrag.push(getTargetData(i, targets[j], d));
                                }
                            }
                        }

                        // Block + Range
                        if(xType == "block" && yType == "range") {
                            if( (i >= startValueX - 1 && i <= endValueX - 1) &&
                                (v >= startValueY && v <= endValueY)) {
                                dataInDrag.push(getTargetData(i, targets[j], d));
                            }
                        } else if(xType == "range" && yType == "block") {
                            if( (i >= startValueY - 1 && i <= endValueY - 1) &&
                                (v >= startValueX && v <= endValueX) ) {
                                dataInDrag.push(getTargetData(i, targets[j], d));
                            }
                        }
                    }
                }

                function getTargetData(index, key, data) {
                    return {
                        brush: brush,
                        dataIndex: index,
                        dataKey: key,
                        data: data
                    };
                }

                self.chart.emit("dragselect.end", [ dataInDrag ]);
            }

            function emitDragArea(startValueX, startValueY, endValueX, endValueY) {
                self.chart.emit("dragselect.end", [ {
                    x1: startValueX,
                    y1: startValueY,
                    x2: endValueX,
                    y2: endValueY
                } ]);
            }

            function resetDragStatus() { // 엘리먼트 및 데이터 초기화
                isMove = false;
                mouseStartX = 0;
                mouseStartY = 0;
                thumbWidth = 0;
                thumbHeight = 0;
                startValueX = 0;
                startValueY = 0;

                resetDragDraw();
            }

            function resetDragDraw() {
                self.onDrawEnd(
                    self.chart.area("x") + axis.area("x"),
                    self.chart.area("y") + axis.area("y"),
                    axis.area("width"),
                    axis.area("height")
                );
            }
        }

        this.onDrawStart = function(x, y, w, h) {
            thumb.attr({
                width: (w >= 0) ? w : Math.abs(w),
                height: (h >= 0) ? h : Math.abs(h)
            });

            thumb.translate(
                (w >= 0) ? x : x + w,
                (h >= 0) ? y : y + h
            );
        }

        this.onDrawEnd = function(x, y, w, h) {
            thumb.attr({
                width: 0,
                height: 0
            });
        }

        this.draw = function() {
            var g = this.chart.svg.group(),
                bIndex = this.widget.brush,
                bIndexes = (_.typeCheck("array", bIndex) ? bIndex : [ bIndex ]);

            for(var i = 0; i < bIndexes.length; i++) {
                var brush = this.chart.get("brush", bIndexes[i]);

                if(brush != null) {
                    thumb = this.svg.rect({
                        width: 0,
                        height: 0,
                        stroke: this.chart.theme("dragSelectBorderColor"),
                        "stroke-width": this.chart.theme("dragSelectBorderWidth"),
                        fill: this.chart.theme("dragSelectBackgroundColor"),
                        "fill-opacity": this.chart.theme("dragSelectBackgroundOpacity")
                    });

                    this.setDragEvent(brush);
                    g.append(thumb);
                }
            }

            return g;
        }
    }

    DragSelectWidget.setup = function() {
        return {
            brush: [ 0 ],
            dataType: "list" // or area
        }
    }

    return DragSelectWidget;
}, "chart.widget.core");