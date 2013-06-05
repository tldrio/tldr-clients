define(
[ 'lib/environment'
, 'jquery'
, 'underscore'
, 'backbone'
, 'Mustache'
, 'lib/mediator'
, 'text!templates/shared/widget-install-bm.mustache']
, function(env, $, _, Backbone, Mustache, app, Template) {

    // Definition of the possible states during the BM DnD
    var STATE_NOTHING_HAPPENED = 0
      , STATE_MOUSE_OVER_LINK = 1
      , STATE_MOUSE_ESCAPED_LINK = 2
      , STATE_MOUSE_IS_DOWN_DRAGGING_NOT_YET_STARTED = 3
      , STATE_DRAGGING = 4
      , STATE_ALMOST_THERE = 5
      , STATE_OVER_BM_BAR = 6
      , STATE_FAILED = 7
      , STATE_DONE = 8

      // Definition of help messages
      , helpMessages = { onTheLink: 'You are on the button, now try to click and hold it.'
                      , backOnTheLink: 'Great, you\'re back. Come on try again!'
                      , comeBack: 'Hey where did you go?'
                      , youJustClicked: 'Sweet you got it! Now follow the arrow!'
                      , draaag: 'Sweet you got it! Now follow the arrow!'
                      , almostThere: 'Almost there, keep going!'
                      , whatAreYouDoing: 'Hey, what are you doing? You were doing great until now.'
                      , overBmBar: '<strong>You\'re over the bookmark bar, drop the button!</strong>'
                      , wtfYouWereRight: 'Huh? You were over the right spot, come back!'
                      , whoops: 'Whoops you dropped it. Please try again'
                      , youDidIt: '<strong>Nice! You did it!</strong> You can now click it on any webpage!'
                      , startDraggingNow: '&lt;-- Start dragging this button now!'
                      }

      , WidgetView = Backbone.View.extend({
          tagName: 'section'

        , events: function () {
            var events = {};
            events['dragstart #'+ 'install-bm-btn']= 'draggingStartHandler';
            events['drag #'+ 'install-bm-btn']= 'imDraggingBabyHandler';
            events['dragend #'+ 'install-bm-btn'] = 'draggingEndHandler';
            events['mouseenter #'+ 'install-bm-btn'] = 'mouseMovedOverLinkHandler';
            events['mouseleave #'+ 'install-bm-btn'] = 'mouseMovedOutOfLinkHandler';
            events['mouseup #'+ 'install-bm-btn'] = 'mouseUpHandler';
            events['mousedown #'+ 'install-bm-btn'] = 'mouseDownHandler';
            events['click #'+ 'install-bm-btn'] = 'clickHandler';
            return events;
          }

        , render: function () {
            DEVMODE && console.log('[Install BM Widget] Render');

            // We cannot use feature detection here. We display the "show bookmark bar"
            // instructions for Chrome by default, or for firefox if we detect it
            // We may need to include a safari detection too
            this.$el.html(Mustache.render(Template, { isFirefox: 'MozBoxSizing' in document.documentElement.style
                                                    , onWindows: navigator.platform.indexOf("Win") !== -1 || navigator.platform.indexOf("win") !== -1 }));


            return this;
          }

        , initialize: function(options) {
            var self = this;

            DEVMODE && console.log('[Install BM Widget] Init ');

            _.bindAll(this, 'toggleCallToActionAnimation');

            // FF cant get the mouse position with the 'drag' event
            // https://bugzilla.mozilla.org/show_bug.cgi?id=505521
            $('body').on('dragover', function (event) {
              self.currentPosition = { x: event.originalEvent.clientX
                                     , y: event.originalEvent.clientY };
            });

            // Initializing state
            this.successfullInstall = false;
            this.currentState = STATE_NOTHING_HAPPENED;

            // Rendering the widget and attaching to DOM if a parentEl is specified (if none is specified,
            // we can assume an $el was specified so no need to manually attach to the DOM)
            this.render();
            if (this.options.parentEl) { $(this.options.parentEl).append(this.$el); }


            // Preloading the arrowHead image and getting the jQuery pointer
            this.$arrowHead = $(document.createElement('img'));
            this.$arrowHead.attr('src', 'assets/img/arrowHead.png');
            this.$arrowHead.attr('draggable', 'false');
            // Setting the original widths
            this.$arrowHead.css("width", "40px");
            this.$arrowHead.css("height", "291px");
            this.$arrowHead.originalWidth = 40;
            this.$arrowHead.originalHeight = 291;

            // Create the svg element that will be used to display the arrow body
            this.$el.append('<svg style="position:fixed;"><path stroke="#ff9515" stroke-width="4" fill="none"></path></svg>');
            this.$arrowBody = this.$el.find('svg');

            // Append arrow to the DOM, invisible but with the highest z-index
            this.hideArrow();
            this.$arrowBody.css('z-index', '300000');
            this.$arrowHead.css('z-index', '300000');
            $('body').append(this.$arrowBody);
            $('body').append(this.$arrowHead);

            // General arrow parameters
            this.arrowTarget = {x: 500, y: 3};   // The coordinates for the end of the arrow
            this.arrowBottomMinY = 70;   // When displaying the arrow, when the bottom (the mouse), moves above this limit, arrow disappears

            // Use to have a bit of throttling in the arrow display
            this.lastRedraw = new Date();
            this.redrawInterval = 15;

            // Used to get the desired behaviour with FF (which is stupid) or any other browser that doesnt
            // make mouse position available in the drag event
            // If getYPosition() gives 0 yEqualZeroLimit times in a row while dragging,
            // we assume we're dealing with FF
            this.currentPosition = {};
            this.firefoxWasDetected = false;
            this.yEqualZeroCount = 0;
            this.yEqualZeroLimit = 10;
            this.yWasJustZero = false;

            // Setting a permanent pointers
            this.$installBmComment = this.$('#' + 'install-bm-comment-action');
            this.$installBmLink = this.$('#' + 'install-bm-btn');
          }

          // Display the comment box that helps users install the bookmarklet
        , displayComment: function() {
            if (this.commentTimeoutId) { clearTimeout(this.commentTimeoutId); }
            this.$installBmComment.css('display', 'inline');
          }

          // Hide the comment box either right now (if no timeout or zero is supplied) or in timeout ms
        , hideComment: function(timeout) {
            var self = this;

            if (! timeout || timeout === 0) {
              this.$installBmComment.html(helpMessages.startDraggingNow);
            } else {
              self.commentTimeoutId = setTimeout(function() { self.hideComment(); }, timeout);
            }
          }

        , mouseMovedOverLinkHandler: function () {
            // toggle animation
            this.toggleCallToActionAnimation();

            if (this.currentState === STATE_NOTHING_HAPPENED) {
              this.$installBmComment.html(helpMessages.onTheLink);
              this.displayComment();
              this.currentState = STATE_MOUSE_OVER_LINK;
            }

            if (this.currentState === STATE_MOUSE_ESCAPED_LINK || this.currentState === STATE_FAILED) {
              this.$installBmComment.html(helpMessages.backOnTheLink);
              this.displayComment();
              this.currentState = STATE_MOUSE_OVER_LINK;
            }
          }

        , mouseMovedOutOfLinkHandler: function () {
            // toggle animation
            this.toggleCallToActionAnimation();

            if (this.currentState === STATE_MOUSE_OVER_LINK) {
              this.$installBmComment.html(helpMessages.comeBack);
              this.hideComment(2500);
              this.currentState = STATE_MOUSE_ESCAPED_LINK;
            }
          }

        , mouseDownHandler: function(event) {
            mixpanel.tldr_d4a6ebe3.track("[BM Install] Tried to install the BM", { timeStamp: (new Date()).toISOString() });

            if (this.currentState === STATE_MOUSE_OVER_LINK) {
              this.$installBmComment.html(helpMessages.youJustClicked);
              this.currentState = STATE_MOUSE_IS_DOWN_DRAGGING_NOT_YET_STARTED;

              // Displaying arrow
              this.showArrow();
              this.redrawArrow(event.clientX + 3, event.clientY - 10);
            }
          }

        , mouseUpHandler: function() {
            if (this.currentState === STATE_MOUSE_IS_DOWN_DRAGGING_NOT_YET_STARTED) {
              this.$installBmComment.html(helpMessages.whoops);
              this.currentState = STATE_MOUSE_OVER_LINK;
              this.hideArrow();

            }
          }

        , draggingStartHandler: function() {
            if (this.currentState === STATE_MOUSE_IS_DOWN_DRAGGING_NOT_YET_STARTED) {
              this.$installBmComment.html(helpMessages.draaag);
              this.currentState = STATE_DRAGGING;
            }
          }

        , imDraggingBabyHandler: function(event) {
            // This is used to detect that we're dealing with FF (or any other strange browser which
            // doesn't give the mouse coordinates when dragging)
            if (this.getYPosition(event) === 0) {
              if (this.yWasJustZero) {
                this.yEqualZeroCount += 1;
                if (this.yEqualZeroCount >= this.yEqualZeroLimit) { this.firefoxWasDetected = true; }
              } else {
                this.yEqualZeroCount = 1;
                this.yWasJustZero = true;
              }
            } else {
                this.yWasJustZero = false;
            }

            if (this.currentState === STATE_DRAGGING) {
              if (this.getYPosition(event) > 0) {   // Stupid Chrome bug where sometimes the position is (0,0) for no reason
                this.redrawArrow(this.getXPosition(event) + 3, this.getYPosition(event) - 10);
              }

              if (this.getYPosition(event) < this.arrowBottomMinY && this.getYPosition(event) !== 0) {   // The comparison to zero is necessary due to a bug in Chrome
                this.hideArrow();
                this.$installBmComment.html(helpMessages.almostThere);
                this.currentState = STATE_ALMOST_THERE;
              }
            }

            if (this.currentState === STATE_ALMOST_THERE && this.getYPosition(event) > this.arrowBottomMinY + 10) {
                this.showArrow();
                this.$installBmComment.html(helpMessages.whatAreYouDoing);
                this.currentState = STATE_DRAGGING;
            }

            if (this.currentState === STATE_ALMOST_THERE && this.getYPosition(event) <= 0) {
                this.$installBmComment.html(helpMessages.overBmBar);
                this.currentState = STATE_OVER_BM_BAR;
            }

            if (this.currentState === STATE_OVER_BM_BAR && this.getYPosition(event) > 0) {
                this.$installBmComment.html(helpMessages.wtfYouWereRight);
                this.currentState = STATE_ALMOST_THERE;
            }
          }

        , draggingEndHandler: function(event) {
            this.hideArrow();   // In any case, remove the arrow

            if (this.currentState === STATE_OVER_BM_BAR || this.getYPosition(event) < 5) {
              // Success more than probable (clientY = -1 is a failure on Chrome but after that its all good)
              this.$installBmComment.html(helpMessages.youDidIt);
              this.currentState = STATE_DONE;
              app.trigger('successInstall');
              mixpanel.tldr_d4a6ebe3.track("[BM Install] Successful", { timeStamp: (new Date()).toISOString() });
            } else {
              // Failure, try again ...
              this.$installBmComment.html(helpMessages.whoops);
              this.hideComment(2500);
              this.currentState = STATE_FAILED;
            }
          }

          // Given an event that holds the coordinates of the mouse, get those coordinates
        , getXPosition: function (event) {
            if (this.firefoxWasDetected) { return this.currentPosition.x; }   // If we have to, use our hack to get mouse position

            if (event.pageX) { return event.pageX; }
            if (event.originalEvent && event.originalEvent.pageX) { return event.originalEvent.pageX; }

            return -1;   // Couldn't find it
          }

        , getYPosition: function (event) {
            if (this.firefoxWasDetected) { return this.currentPosition.y; }   // If we have to, use our hack to get mouse position

            //if (event.pageY) { return event.pageY; }
            //if (event.originalEvent && (typeof event.originalEvent.pageY !== "undefined")) {   // We need to test the type of pageY because 0 is seen as false by JS
              //return event.originalEvent.pageY;
            if (event.clientY) { return event.clientY; }
            if (event.originalEvent && (typeof event.originalEvent.clientY !== "undefined")) {   // We need to test the type of pageY because 0 is seen as false by JS
              return event.originalEvent.clientY;
            }


            return -1;   // Couldn't find it
          }

        , clickHandler: function (event) {
            //Avoid trigger the link
            event.preventDefault();
            return false;
          }

        , hideArrow: function() {
            this.$arrowBody.css('display', 'none');
            this.$arrowHead.css('display', 'none');
          }

        , showArrow: function() {
            this.$arrowBody.css('display', 'block');
            this.$arrowHead.css('display', 'block');
          }

        // Redraw arrow from the given position (mx, my)
        // The goal is that the arrow head keeps a constant size and only the body gets stretched
        , redrawArrow: function(mx, my) {
            var now = new Date()
              , tx = this.arrowTarget.x
              , ty = this.arrowTarget.y
              , d = Math.sqrt(Math.pow(mx - tx, 2) + Math.pow(my - ty, 2))
              , r = this.$arrowHead.originalWidth / d
              , hx = r * mx + (1 - r) * tx
              , hy = r * my + (1 - r) * ty
              , overlap = 0.6
              , hpx = overlap * r * mx + (1 - overlap * r) * tx   // hpx and hpy are a bit closer to the end of the arrow than hx and hy
              , hpy = overlap * r * my + (1 - overlap * r) * ty;  // in order for the two images to overlap

            if (now - this.lastRedraw < this.redrawInterval) {
              return;
            } else {
              this.lastRedraw = now;

              this.drawPathBetweenPoints(this.$arrowBody, mx, my, hpx, hpy);
              this.drawImageBetweenPoints(this.$arrowHead, hx, hy, tx, ty, 1);
            }
          }


        , drawPathBetweenPoints: function($svgElement, mx, my, tx, ty) {
            var m, t, tlc, size, sm, st, si, sizero, siInterm
              , d = Math.sqrt(Math.pow(mx - tx, 2) + Math.pow(my - ty, 2))
              , alpha
              , overX = d / 4, overY = 5   // Used to draw an svg container slightly bigger than theoretically needed to avoid clipping effect
              , vectMT, vectMTO;       // Vectors used to calculate control point coordinates in the (MT, MT + PI/2) system

            m = { x: mx, y: my };
            t = { x: tx, y: ty };
            tlc = { x: Math.min(m.x, t.x), y: Math.min(m.y, t.y) };   // Top-left corner of the SVG element
            size = { width: Math.abs(t.x - m.x), height: Math.abs(m.y - t.y) };           // Size of the SVG element

            // Coordinates of the points in the SVG coordinate system
            sm = { x: overX + m.x - tlc.x, y: overY + m.y - tlc.y  };
            st = { x: overX + t.x - tlc.x, y: overY + t.y - tlc.y  };

            // Middle of [MT]
            sizero = { x: (sm.x + st.x) / 2, y: (sm.y + st.y) / 2 };

            vectMT = { x: (st.x - sm.x) / d, y: (st.y - sm.y) / d };
            vectMTO = { x: - vectMT.y, y: vectMT.x};   // Orthogonal to vectMT

            // The bigger alpha, the bigger the curvature
            alpha = d / 7;
            si = { x: sizero.x + alpha * vectMTO.x, y: sizero.y + alpha * vectMTO.y };

            // Reposition SVG element
            $svgElement.css('left', tlc.x - overX);
            $svgElement.css('top', tlc.y - overY);
            $svgElement.attr('width', size.width + 2 * overX);
            $svgElement.attr('height', size.height + 2 * overY);

            // Redraw arc (Bezier curve)
            $svgElement.find('path').attr('d', 'M ' + sm.x + ' ' + sm.y + ' Q ' + si.x + ' ' + si.y + ' ' + st.x + ' ' + st.y);
          }

          // hFactor is the horizontal scale factor (a means the original image ratio is preserved)
        , drawImageBetweenPoints: function($image, mx, my, tx, ty, hFactor) {
            var theta, alpha, scaleW, scaleH, w, px, py;

            if (tx >= mx) {
              // Simple case where the image points somewhat to the right and atan plays nicely
              theta = Math.atan((ty - my) / (tx - mx));   // Value is in radians
              alpha = (Math.PI / 2) - theta;
              scaleW = Math.sqrt(Math.pow(mx - tx, 2) + Math.pow(my - ty, 2)) / $image.originalWidth;
              scaleH = hFactor;
              w = $image.originalHeight * scaleH;
              px = mx + w * Math.cos(alpha) / 2;
              py = my - w * Math.sin(alpha) / 2;
            } else {
              // Not so nice ...
              alpha = Math.atan((tx - mx) / (ty - my));   // Value is in radians
              theta = - (Math.PI / 2) - alpha;
              scaleW = Math.sqrt(Math.pow(mx - tx, 2) + Math.pow(my - ty, 2)) / $image.originalWidth;
              scaleH = hFactor;
              w = $image.originalHeight * scaleH;
              px = mx - w * Math.cos(alpha) / 2;
              py = my + w * Math.sin(alpha) / 2;
            }

            // Transformation
            $image.css('position', 'fixed');
            $image.css('left', px + 'px');
            $image.css('top', py + 'px');
            $image.css('-webkit-transform', 'rotate(' + (theta * 180 / Math.PI) + 'deg) scale(' + scaleW + ',' + scaleH + ')' );
            $image.css('-webkit-transform-origin', '0% 0%');
            $image.css('-moz-transform', 'rotate(' + (theta * 180 / Math.PI) + 'deg) scale(' + scaleW + ',' + scaleH + ')' );
            $image.css('-moz-transform-origin', '0% 0%');
          }

          , toggleCallToActionAnimation: function () {
              this.$installBmLink.toggleClass('animation-running animation-paused');
            }

      });

    return WidgetView;
  }
);
