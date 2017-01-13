(function ($) {

  $.fn.customScrollbar = function (options, args) {

    var defaultOptions = {
      skin: undefined,
      hScroll: true,
      vScroll: true,
      updateOnWindowResize: false,
      animationSpeed: 300,
      onCustomScroll: undefined,
      swipeSpeed: 1,
      wheelSpeed: 40,
      fixedThumbWidth: undefined,
      fixedThumbHeight: undefined,
      preventDefaultScroll: false
    }

    var Scrollable = function (element, options) {
      this.$element = $(element);
      this.options = options;
      this.addScrollableClass();
      this.addSkinClass();
      this.addScrollBarComponents();
      if (this.options.vScroll)
        this.vScrollbar = new Scrollbar(this, new VSizing());
      if (this.options.hScroll)
        this.hScrollbar = new Scrollbar(this, new HSizing());
      this.$element.data("scrollable", this);
      this.initKeyboardScrolling();
      this.bindEvents();
    }

    Scrollable.prototype = {

      addScrollableClass: function () {
        if (!this.$element.hasClass("scrollable")) {
          this.scrollableAdded = true;
          this.$element.addClass("scrollable");
        }
      },

      removeScrollableClass: function () {
        if (this.scrollableAdded)
          this.$element.removeClass("scrollable");
      },

      addSkinClass: function () {
        if (typeof(this.options.skin) == "string" && !this.$element.hasClass(this.options.skin)) {
          this.skinClassAdded = true;
          this.$element.addClass(this.options.skin);
        }
      },

      removeSkinClass: function () {
        if (this.skinClassAdded)
          this.$element.removeClass(this.options.skin);
      },

      addScrollBarComponents: function () {
        this.assignViewPort();
        if (this.$viewPort.length == 0) {
          this.$element.wrapInner("<div class=\"viewport\" />");
          this.assignViewPort();
          this.viewPortAdded = true;
        }
        this.assignOverview();
        if (this.$overview.length == 0) {
          this.$viewPort.wrapInner("<div class=\"overview\" />");
          this.assignOverview();
          this.overviewAdded = true;
        }
        this.addScrollBar("vertical", "prepend");
        this.addScrollBar("horizontal", "append");
      },

      removeScrollbarComponents: function () {
        this.removeScrollbar("vertical");
        this.removeScrollbar("horizontal");
        if (this.overviewAdded)
          this.$element.unwrap();
        if (this.viewPortAdded)
          this.$element.unwrap();
      },

      removeScrollbar: function (orientation) {
        if (this[orientation + "ScrollbarAdded"])
          this.$element.find(".scroll-bar." + orientation).remove();
      },

      assignViewPort: function () {
        this.$viewPort = this.$element.find(".viewport");
      },

      assignOverview: function () {
        this.$overview = this.$viewPort.find(".overview");
      },

      addScrollBar: function (orientation, fun) {
        if (this.$element.find(".scroll-bar." + orientation).length == 0) {
          this.$element[fun]("<div class='scroll-bar " + orientation + "'><div class='thumb'></div></div>")
          this[orientation + "ScrollbarAdded"] = true;
        }
      },

      resize: function (keepPosition) {
        if (this.vScrollbar)
          this.vScrollbar.resize(keepPosition);
        if (this.hScrollbar)
          this.hScrollbar.resize(keepPosition);
      },

      scrollTo: function (element) {
        if (this.vScrollbar)
          this.vScrollbar.scrollToElement(element);
        if (this.hScrollbar)
          this.hScrollbar.scrollToElement(element);
      },

      scrollToXY: function (x, y) {
        this.scrollToX(x);
        this.scrollToY(y);
      },

      scrollToX: function (x) {
        if (this.hScrollbar)
          this.hScrollbar.scrollOverviewTo(x, true);
      },

      scrollToY: function (y) {
        if (this.vScrollbar)
          this.vScrollbar.scrollOverviewTo(y, true);
      },

      scrollByX: function (x) {
        if (this.hScrollbar)
          this.scrollToX(this.hScrollbar.overviewPosition() + x);
      },

      scrollByY: function (y) {
        if (this.vScrollbar)
          this.scrollToY(this.vScrollbar.overviewPosition() + y);
      },

      remove: function () {
        this.removeScrollableClass();
        this.removeSkinClass();
        this.removeScrollbarComponents();
        this.$element.data("scrollable", null);
        this.removeKeyboardScrolling();
        if (this.vScrollbar)
          this.vScrollbar.remove();
        if (this.hScrollbar)
          this.hScrollbar.remove();
      },

      setAnimationSpeed: function (speed) {
        this.options.animationSpeed = speed;
      },

      isInside: function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = $wrappingElement.offset();
        return (elementOffset.top >= wrappingElementOffset.top) && (elementOffset.left >= wrappingElementOffset.left) &&
          (elementOffset.top + $element.height() <= wrappingElementOffset.top + $wrappingElement.height()) &&
          (elementOffset.left + $element.width() <= wrappingElementOffset.left + $wrappingElement.width())
      },

      initKeyboardScrolling: function () {
        var _this = this;

        this.elementKeydown = function (event) {
          if (document.activeElement === _this.$element[0]) {
            if (_this.vScrollbar)
              _this.vScrollbar.keyScroll(event);
            if (_this.hScrollbar)
              _this.hScrollbar.keyScroll(event);
          }
        }

        this.$element
          .attr('tabindex', '-1')
          .keydown(this.elementKeydown);
      },

      removeKeyboardScrolling: function () {
        this.$element
          .removeAttr('tabindex')
          .unbind("keydown", this.elementKeydown);
      },

      bindEvents: function () {
        if (this.options.onCustomScroll)
          this.$element.on("customScroll", this.options.onCustomScroll);
      }

    }

    var Scrollbar = function (scrollable, sizing) {
      this.scrollable = scrollable;
      this.sizing = sizing
      this.$scrollBar = this.sizing.scrollBar(this.scrollable.$element);
      this.$thumb = this.$scrollBar.find(".thumb");
      this.setScrollPosition(0, 0);
      this.resize();
      this.initMouseMoveScrolling();
      this.initMouseWheelScrolling();
      this.initTouchScrolling();
      this.initMouseClickScrolling();
      this.initWindowResize();
    }

    Scrollbar.prototype = {

      resize: function (keepPosition) {
        this.overviewSize = this.sizing.size(this.scrollable.$overview);
        this.calculateViewPortSize();
        this.sizing.size(this.scrollable.$viewPort, this.viewPortSize);
        this.ratio = this.viewPortSize / this.overviewSize;
        this.sizing.size(this.$scrollBar, this.viewPortSize);
        this.thumbSize = this.calculateThumbSize();
        this.sizing.size(this.$thumb, this.thumbSize);
        this.maxThumbPosition = this.calculateMaxThumbPosition();
        this.maxOverviewPosition = this.calculateMaxOverviewPosition();
        this.enabled = (this.overviewSize > this.viewPortSize);
        if (this.scrollPercent === undefined)
          this.scrollPercent = 0.0;
        if (this.enabled)
          this.rescroll(keepPosition);
        else
          this.setScrollPosition(0, 0);
        this.$scrollBar.toggle(this.enabled);
      },

      calculateViewPortSize: function () {
        var elementSize = this.sizing.size(this.scrollable.$element);
        if (elementSize > 0 && !this.maxSizeUsed) {
          this.viewPortSize = elementSize;
          this.maxSizeUsed = false;
        }
        else {
          var maxSize = this.sizing.maxSize(this.scrollable.$element);
          this.viewPortSize = Math.min(maxSize, this.overviewSize);
          this.maxSizeUsed = true;
        }
      },

      calculateThumbSize: function () {
        var fixedSize = this.sizing.fixedThumbSize(this.scrollable.options)
        var size;
        if (fixedSize)
          size = fixedSize;
        else
          size = this.ratio * this.viewPortSize
        return Math.max(size, this.sizing.minSize(this.$thumb));
      },

      initMouseMoveScrolling: function () {
        var _this = this;
        this.$thumb.mousedown(function (event) {
          if (_this.enabled)
            _this.startMouseMoveScrolling(event);
        });
        this.documentMouseup = function (event) {
          _this.stopMouseMoveScrolling(event);
        };
        $(document).mouseup(this.documentMouseup);
        this.documentMousemove = function (event) {
          _this.mouseMoveScroll(event);
        };
        $(document).mousemove(this.documentMousemove);
        this.$thumb.click(function (event) {
          event.stopPropagation();
        });
      },

      removeMouseMoveScrolling: function () {
        this.$thumb.unbind();
        $(document).unbind("mouseup", this.documentMouseup);
        $(document).unbind("mousemove", this.documentMousemove);
      },

      initMouseWheelScrolling: function () {
        var _this = this;
        this.scrollable.$element.mousewheel(function (event, delta, deltaX, deltaY) {
          if (_this.enabled) {
            var scrolled = _this.mouseWheelScroll(deltaX, deltaY);
            _this.stopEventConditionally(event, scrolled);
          }
        });
      },

      removeMouseWheelScrolling: function () {
        this.scrollable.$element.unbind("mousewheel");
      },

      initTouchScrolling: function () {
        if (document.addEventListener) {
          var _this = this;
          this.elementTouchstart = function (event) {
            if (_this.enabled)
              _this.startTouchScrolling(event);
          }
          this.scrollable.$element[0].addEventListener("touchstart", this.elementTouchstart);
          this.documentTouchmove = function (event) {
            _this.touchScroll(event);
          }
          this.scrollable.$element[0].addEventListener("touchmove", this.documentTouchmove);
          this.elementTouchend = function (event) {
            _this.stopTouchScrolling(event);
          }
          this.scrollable.$element[0].addEventListener("touchend", this.elementTouchend);
        }
      },

      removeTouchScrolling: function () {
        if (document.addEventListener) {
          this.scrollable.$element[0].removeEventListener("touchstart", this.elementTouchstart);
          document.removeEventListener("touchmove", this.documentTouchmove);
          this.scrollable.$element[0].removeEventListener("touchend", this.elementTouchend);
        }
      },

      initMouseClickScrolling: function () {
        var _this = this;
        this.scrollBarClick = function (event) {
          _this.mouseClickScroll(event);
        };
        this.$scrollBar.click(this.scrollBarClick);
      },

      removeMouseClickScrolling: function () {
        this.$scrollBar.unbind("click", this.scrollBarClick);
      },

      initWindowResize: function () {
        if (this.scrollable.options.updateOnWindowResize) {
          var _this = this;
          this.windowResize = function () {
            _this.resize();
          };
          $(window).resize(this.windowResize);
        }
      },

      removeWindowResize: function () {
        $(window).unbind("resize", this.windowResize);
      },

      isKeyScrolling: function (key) {
        return this.keyScrollDelta(key) != null;
      },

      keyScrollDelta: function (key) {
        for (var scrollingKey in this.sizing.scrollingKeys)
          if (scrollingKey == key)
            return this.sizing.scrollingKeys[key](this.viewPortSize);
        return null;
      },

      startMouseMoveScrolling: function (event) {
        this.mouseMoveScrolling = true;
        $("body").addClass("not-selectable");
        this.setUnselectable($("body"), "on");
        this.setScrollEvent(event);
        event.preventDefault();
      },

      stopMouseMoveScrolling: function (event) {
        this.mouseMoveScrolling = false;
        $("body").removeClass("not-selectable");
        this.setUnselectable($("body"), null);
      },

      setUnselectable: function (element, value) {
        if (element.attr("unselectable") != value) {
          element.attr("unselectable", value);
          element.find(':not(input)').attr('unselectable', value);
        }
      },

      mouseMoveScroll: function (event) {
        if (this.mouseMoveScrolling) {
          var delta = this.sizing.mouseDelta(this.scrollEvent, event);
          this.scrollThumbBy(delta);
          this.setScrollEvent(event);
        }
      },

      startTouchScrolling: function (event) {
        if (event.touches && event.touches.length == 1) {
          this.setScrollEvent(event.touches[0]);
          this.touchScrolling = true;
          event.stopPropagation();
        }
      },

      touchScroll: function (event) {
        if (this.touchScrolling && event.touches && event.touches.length == 1) {
          var delta = -this.sizing.mouseDelta(this.scrollEvent, event.touches[0]) * this.scrollable.options.swipeSpeed;
          var scrolled = this.scrollOverviewBy(delta);
          if (scrolled)
            this.setScrollEvent(event.touches[0]);
          this.stopEventConditionally(event, scrolled);
        }
      },

      stopTouchScrolling: function (event) {
        this.touchScrolling = false;
        event.stopPropagation();
      },

      mouseWheelScroll: function (deltaX, deltaY) {
        var delta = -this.sizing.wheelDelta(deltaX, deltaY) * this.scrollable.options.wheelSpeed;
        if (delta != 0)
          return this.scrollOverviewBy(delta);
      },

      mouseClickScroll: function (event) {
        var delta = this.viewPortSize - 20;
        if (event["page" + this.sizing.scrollAxis()] < this.$thumb.offset()[this.sizing.offsetComponent()])
        // mouse click over thumb
          delta = -delta;
        this.scrollOverviewBy(delta);
      },

      keyScroll: function (event) {
        var keyDown = event.which;
        if (this.enabled && this.isKeyScrolling(keyDown)) {
          var scrolled = this.scrollOverviewBy(this.keyScrollDelta(keyDown));
          this.stopEventConditionally(event, scrolled);
        }
      },

      scrollThumbBy: function (delta) {
        var thumbPosition = this.thumbPosition();
        thumbPosition += delta;
        thumbPosition = this.positionOrMax(thumbPosition, this.maxThumbPosition);
        var oldScrollPercent = this.scrollPercent;
        this.scrollPercent = thumbPosition / this.maxThumbPosition;
        if (oldScrollPercent != this.scrollPercent) {
          var overviewPosition = (thumbPosition * this.maxOverviewPosition) / this.maxThumbPosition;
          this.setScrollPosition(overviewPosition, thumbPosition);
          this.triggerCustomScroll(oldScrollPercent);
          return true
        }
        else
          return false;
      },

      thumbPosition: function () {
        return this.$thumb.position()[this.sizing.offsetComponent()];
      },

      scrollOverviewBy: function (delta) {
        var overviewPosition = this.overviewPosition() + delta;
        return this.scrollOverviewTo(overviewPosition, false);
      },

      overviewPosition: function () {
        return -this.scrollable.$overview.position()[this.sizing.offsetComponent()];
      },

      scrollOverviewTo: function (overviewPosition, animate) {
        overviewPosition = this.positionOrMax(overviewPosition, this.maxOverviewPosition);
        var oldScrollPercent = this.scrollPercent;
        this.scrollPercent = overviewPosition / this.maxOverviewPosition;
        if (oldScrollPercent != this.scrollPercent) {
          var thumbPosition = this.scrollPercent * this.maxThumbPosition;
          if (animate)
            this.setScrollPositionWithAnimation(overviewPosition, thumbPosition);
          else
            this.setScrollPosition(overviewPosition, thumbPosition);
          this.triggerCustomScroll(oldScrollPercent);
          return true;
        }
        else
          return false;
      },

      positionOrMax: function (p, max) {
        if (p < 0)
          return 0;
        else if (p > max)
          return max;
        else
          return p;
      },

      triggerCustomScroll: function (oldScrollPercent) {
        this.scrollable.$element.trigger("customScroll", {
            scrollAxis: this.sizing.scrollAxis(),
            direction: this.sizing.scrollDirection(oldScrollPercent, this.scrollPercent),
            scrollPercent: this.scrollPercent * 100
          }
        );
      },

      rescroll: function (keepPosition) {
        if (keepPosition) {
          var overviewPosition = this.positionOrMax(this.overviewPosition(), this.maxOverviewPosition);
          this.scrollPercent = overviewPosition / this.maxOverviewPosition;
          var thumbPosition = this.scrollPercent * this.maxThumbPosition;
          this.setScrollPosition(overviewPosition, thumbPosition);
        }
        else {
          var thumbPosition = this.scrollPercent * this.maxThumbPosition;
          var overviewPosition = this.scrollPercent * this.maxOverviewPosition;
          this.setScrollPosition(overviewPosition, thumbPosition);
        }
      },

      setScrollPosition: function (overviewPosition, thumbPosition) {
        this.$thumb.css(this.sizing.offsetComponent(), thumbPosition + "px");
        this.scrollable.$overview.css(this.sizing.offsetComponent(), -overviewPosition + "px");
      },

      setScrollPositionWithAnimation: function (overviewPosition, thumbPosition) {
        var thumbAnimationOpts = {};
        var overviewAnimationOpts = {};
        thumbAnimationOpts[this.sizing.offsetComponent()] = thumbPosition + "px";
        this.$thumb.animate(thumbAnimationOpts, this.scrollable.options.animationSpeed);
        overviewAnimationOpts[this.sizing.offsetComponent()] = -overviewPosition + "px";
        this.scrollable.$overview.animate(overviewAnimationOpts, this.scrollable.options.animationSpeed);
      },

      calculateMaxThumbPosition: function () {
        return Math.max(0, this.sizing.size(this.$scrollBar) - this.thumbSize);
      },

      calculateMaxOverviewPosition: function () {
        return Math.max(0, this.sizing.size(this.scrollable.$overview) - this.sizing.size(this.scrollable.$viewPort));
      },

      setScrollEvent: function (event) {
        var attr = "page" + this.sizing.scrollAxis();
        if (!this.scrollEvent || this.scrollEvent[attr] != event[attr])
          this.scrollEvent = {pageX: event.pageX, pageY: event.pageY};
      },

      scrollToElement: function (element) {
        var $element = $(element);
        if (this.sizing.isInside($element, this.scrollable.$overview) && !this.sizing.isInside($element, this.scrollable.$viewPort)) {
          var elementOffset = $element.offset();
          var overviewOffset = this.scrollable.$overview.offset();
          var viewPortOffset = this.scrollable.$viewPort.offset();
          this.scrollOverviewTo(elementOffset[this.sizing.offsetComponent()] - overviewOffset[this.sizing.offsetComponent()], true);
        }
      },

      remove: function () {
        this.removeMouseMoveScrolling();
        this.removeMouseWheelScrolling();
        this.removeTouchScrolling();
        this.removeMouseClickScrolling();
        this.removeWindowResize();
      },

      stopEventConditionally: function (event, condition) {
        if (condition || this.scrollable.options.preventDefaultScroll) {
          event.preventDefault();
          event.stopPropagation();
        }
      }

    }

    var HSizing = function () {
    }

    HSizing.prototype = {
      size: function ($el, arg) {
        if (arg)
          return $el.width(arg);
        else
          return $el.width();
      },

      minSize: function ($el) {
        return parseInt($el.css("min-width")) || 0;
      },

      maxSize: function ($el) {
        return parseInt($el.css("max-width")) || 0;
      },

      fixedThumbSize: function (options) {
        return options.fixedThumbWidth;
      },

      scrollBar: function ($el) {
        return $el.find(".scroll-bar.horizontal");
      },

      mouseDelta: function (event1, event2) {
        return event2.pageX - event1.pageX;
      },

      offsetComponent: function () {
        return "left";
      },

      wheelDelta: function (deltaX, deltaY) {
        return deltaX;
      },

      scrollAxis: function () {
        return "X";
      },

      scrollDirection: function (oldPercent, newPercent) {
        return oldPercent < newPercent ? "right" : "left";
      },

      scrollingKeys: {
        37: function (viewPortSize) {
          return -10; //arrow left
        },
        39: function (viewPortSize) {
          return 10; //arrow right
        }
      },

      isInside: function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = $wrappingElement.offset();
        return (elementOffset.left >= wrappingElementOffset.left) &&
          (elementOffset.left + $element.width() <= wrappingElementOffset.left + $wrappingElement.width());
      }

    }

    var VSizing = function () {
    }

    VSizing.prototype = {

      size: function ($el, arg) {
        if (arg)
          return $el.height(arg);
        else
          return $el.height();
      },

      minSize: function ($el) {
        return parseInt($el.css("min-height")) || 0;
      },

      maxSize: function ($el) {
        return parseInt($el.css("max-height")) || 0;
      },

      fixedThumbSize: function (options) {
        return options.fixedThumbHeight;
      },

      scrollBar: function ($el) {
        return $el.find(".scroll-bar.vertical");
      },

      mouseDelta: function (event1, event2) {
        return event2.pageY - event1.pageY;
      },

      offsetComponent: function () {
        return "top";
      },

      wheelDelta: function (deltaX, deltaY) {
        return deltaY;
      },

      scrollAxis: function () {
        return "Y";
      },

      scrollDirection: function (oldPercent, newPercent) {
        return oldPercent < newPercent ? "down" : "up";
      },

      scrollingKeys: {
        38: function (viewPortSize) {
          return -10; //arrow up
        },
        40: function (viewPortSize) {
          return 10; //arrow down
        },
        33: function (viewPortSize) {
          return -(viewPortSize - 20); //page up
        },
        34: function (viewPortSize) {
          return viewPortSize - 20; //page down
        }
      },

      isInside: function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = $wrappingElement.offset();
        return (elementOffset.top >= wrappingElementOffset.top) &&
          (elementOffset.top + $element.height() <= wrappingElementOffset.top + $wrappingElement.height());
      }

    }

    return this.each(function () {
      if (options == undefined)
        options = defaultOptions;
      if (typeof(options) == "string") {
        var scrollable = $(this).data("scrollable");
        if (scrollable)
          scrollable[options](args);
      }
      else if (typeof(options) == "object") {
        options = $.extend(defaultOptions, options);
        new Scrollable($(this), options);
      }
      else
        throw "Invalid type of options";
    });

  }
  ;

})
  (jQuery);

(function ($) {

  var types = ['DOMMouseScroll', 'mousewheel'];

  if ($.event.fixHooks) {
    for (var i = types.length; i;) {
      $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
  }

  $.event.special.mousewheel = {
    setup: function () {
      if (this.addEventListener) {
        for (var i = types.length; i;) {
          this.addEventListener(types[--i], handler, false);
        }
      } else {
        this.onmousewheel = handler;
      }
    },

    teardown: function () {
      if (this.removeEventListener) {
        for (var i = types.length; i;) {
          this.removeEventListener(types[--i], handler, false);
        }
      } else {
        this.onmousewheel = null;
      }
    }
  };

  $.fn.extend({
    mousewheel: function (fn) {
      return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },

    unmousewheel: function (fn) {
      return this.unbind("mousewheel", fn);
    }
  });


  function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call(arguments, 1), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";

    // Old school scrollwheel delta
    if (orgEvent.wheelDelta) {
      delta = orgEvent.wheelDelta / 120;
    }
    if (orgEvent.detail) {
      delta = -orgEvent.detail / 3;
    }

    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;

    // Gecko
    if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
      deltaY = 0;
      deltaX = delta;
    }

    // Webkit
    if (orgEvent.wheelDeltaY !== undefined) {
      deltaY = orgEvent.wheelDeltaY / 120;
    }
    if (orgEvent.wheelDeltaX !== undefined) {
      deltaX = orgEvent.wheelDeltaX / 120;
    }

    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);

    return ($.event.dispatch || $.event.handle).apply(this, args);
  }

})(jQuery);

/*
	Masked Input plugin for jQuery
	Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
	Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
	Version: 1.3.1
*/
(function(e){function t(){var e=document.createElement("input"),t="onpaste";return e.setAttribute(t,""),"function"==typeof e[t]?"paste":"input"}var n,a=t()+".mask",r=navigator.userAgent,i=/iphone/i.test(r),o=/android/i.test(r);e.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},dataName:"rawMaskFn",placeholder:"_"},e.fn.extend({caret:function(e,t){var n;if(0!==this.length&&!this.is(":hidden"))return"number"==typeof e?(t="number"==typeof t?t:e,this.each(function(){this.setSelectionRange?this.setSelectionRange(e,t):this.createTextRange&&(n=this.createTextRange(),n.collapse(!0),n.moveEnd("character",t),n.moveStart("character",e),n.select())})):(this[0].setSelectionRange?(e=this[0].selectionStart,t=this[0].selectionEnd):document.selection&&document.selection.createRange&&(n=document.selection.createRange(),e=0-n.duplicate().moveStart("character",-1e5),t=e+n.text.length),{begin:e,end:t})},unmask:function(){return this.trigger("unmask")},mask:function(t,r){var c,l,s,u,f,h;return!t&&this.length>0?(c=e(this[0]),c.data(e.mask.dataName)()):(r=e.extend({placeholder:e.mask.placeholder,completed:null},r),l=e.mask.definitions,s=[],u=h=t.length,f=null,e.each(t.split(""),function(e,t){"?"==t?(h--,u=e):l[t]?(s.push(RegExp(l[t])),null===f&&(f=s.length-1)):s.push(null)}),this.trigger("unmask").each(function(){function c(e){for(;h>++e&&!s[e];);return e}function d(e){for(;--e>=0&&!s[e];);return e}function m(e,t){var n,a;if(!(0>e)){for(n=e,a=c(t);h>n;n++)if(s[n]){if(!(h>a&&s[n].test(R[a])))break;R[n]=R[a],R[a]=r.placeholder,a=c(a)}b(),x.caret(Math.max(f,e))}}function p(e){var t,n,a,i;for(t=e,n=r.placeholder;h>t;t++)if(s[t]){if(a=c(t),i=R[t],R[t]=n,!(h>a&&s[a].test(i)))break;n=i}}function g(e){var t,n,a,r=e.which;8===r||46===r||i&&127===r?(t=x.caret(),n=t.begin,a=t.end,0===a-n&&(n=46!==r?d(n):a=c(n-1),a=46===r?c(a):a),k(n,a),m(n,a-1),e.preventDefault()):27==r&&(x.val(S),x.caret(0,y()),e.preventDefault())}function v(t){var n,a,i,l=t.which,u=x.caret();t.ctrlKey||t.altKey||t.metaKey||32>l||l&&(0!==u.end-u.begin&&(k(u.begin,u.end),m(u.begin,u.end-1)),n=c(u.begin-1),h>n&&(a=String.fromCharCode(l),s[n].test(a)&&(p(n),R[n]=a,b(),i=c(n),o?setTimeout(e.proxy(e.fn.caret,x,i),0):x.caret(i),r.completed&&i>=h&&r.completed.call(x))),t.preventDefault())}function k(e,t){var n;for(n=e;t>n&&h>n;n++)s[n]&&(R[n]=r.placeholder)}function b(){x.val(R.join(""))}function y(e){var t,n,a=x.val(),i=-1;for(t=0,pos=0;h>t;t++)if(s[t]){for(R[t]=r.placeholder;pos++<a.length;)if(n=a.charAt(pos-1),s[t].test(n)){R[t]=n,i=t;break}if(pos>a.length)break}else R[t]===a.charAt(pos)&&t!==u&&(pos++,i=t);return e?b():u>i+1?(x.val(""),k(0,h)):(b(),x.val(x.val().substring(0,i+1))),u?t:f}var x=e(this),R=e.map(t.split(""),function(e){return"?"!=e?l[e]?r.placeholder:e:void 0}),S=x.val();x.data(e.mask.dataName,function(){return e.map(R,function(e,t){return s[t]&&e!=r.placeholder?e:null}).join("")}),x.attr("readonly")||x.one("unmask",function(){x.unbind(".mask").removeData(e.mask.dataName)}).bind("focus.mask",function(){clearTimeout(n);var e;S=x.val(),e=y(),n=setTimeout(function(){b(),e==t.length?x.caret(0,e):x.caret(e)},10)}).bind("blur.mask",function(){y(),x.val()!=S&&x.change()}).bind("keydown.mask",g).bind("keypress.mask",v).bind(a,function(){setTimeout(function(){var e=y(!0);x.caret(e),r.completed&&e==x.val().length&&r.completed.call(x)},0)}),y()}))}})})(jQuery);
$(document).ready(function () {
	$("form").submit(function () {
		// Получение ID формы
		var formID = $(this).attr('id');
		// Добавление решётки к имени ID
		var formNm = $('#' + formID);
		// var message = $(formNm).find(".msgs"); // Ищет класс .msgs в текущей форме  и записываем в переменную
		// var formTitle = $(formNm).find(".formTitle"); // Ищет класс .formtitle в текущей форме и записываем в переменную
		$.ajax({
			type: "POST",
			url: 'modalform/mail.php',
			data: formNm.serialize(),
			success: function (data) {
				console.log('indeed!');
				// Вывод сообщения об успешной отправке

				console.log(data);

				$('#' + formID + ' ' + 'input').not(':input[type=submit], :input[type=hidden]').val('');

				if ($('.modal_visible').length > 0) {
					$('.modal_visible').fadeOut();
				} else {
					window_offset = window.pageYOffset;
				}

				setTimeout(function () {
					$('#modal_success').fadeIn('slow');
					$('#modal_success').find('.wrapper').customScrollbar();
					var body_width = document.body.offsetWidth;
					document.body.style.marginRight = window.innerWidth - body_width + "px";
					document.body.style.width = body_width + "px";
					document.body.style.top = "-" + window_offset + "px";
					document.body.classList.add('hidden');


				}, 1000);
			},
			error: function (jqXHR, text, error) {
				console.log('nope');

				console.log(error);

				setTimeout(function () {
					alert('Сообщение не отправлено, попробуйте еще раз!')

				}, 3000);
			}
		});
		return false;
	});
});

;
$('.bg_img').each(
	function () {
		$(this).css('background-image', 'url(' + $(this).find('img').attr('src') + ')')
	}
);

$('.part_3_grid .cell').on('mouseenter', function () {

	$(this).find('.hover').animate({
		opacity: 1
	}, 400)


});

$('.part_3_grid .cell').on('mouseleave', function () {

	$(this).find('.hover').animate({
		opacity: 0
	}, 0)
});




$('.part_5_right').on('mouseenter', function () {
	var img = $(this).find('img');
	img.attr('src', img.attr('data-img-2'));
});


$('.part_5_right').on('mouseleave', function () {
	var img = $(this).find('img');
	img.attr('src', img.attr('data-img-1'));
});

/* --- Range > --- */
$(".form_range.price").slider({
	animate: "fast",
	max: 100000,
	min: 10000,
	value: 55000,
	step: 1000,
});





var price = $(".form_range.price").slider("value");

$(".form_range.month").slider({
	animate: "fast",
	max: 4,
	min: 1,
	value: 3,
	step: 1,

});

var month = $(".form_range.month").slider("value");

$(".form_range.price").slider({
	change: function (event, ui) {
		price = $(".form_range.price").slider("value");
		console.log($(".form_range.price").slider("value"));
		$('[name="client_summ"]').val(price);
		setCurrentNumbers();
		showProducts();

	}

});


$(".form_range.month").slider({
	change: function (event, ui) {
		month = $(".form_range.month").slider("value");
		console.log($(".form_range.month").slider("value"));
		$('[name="client_monthes"]').val(month);
		setCurrentNumbers();
		showProducts();

	}
});

var max_price = $(".form_range.price").slider("option", "max");
var min_price = $(".form_range.price").slider("option", "min");

function setCurrentNumbers() {
	var last_symbols = String(parseInt(price / month)).slice(-3),
		start_symbols = String(parseInt(price / month)).slice(0, -3),
		full_str = start_symbols + ' ' + last_symbols,
		num_month = parseInt(month),
		end_of_word;
	if (num_month === 1) {
		end_of_word = '';
	} else if (num_month > 1 && month < 4) {
		end_of_word = 'а'
	} else if (num_month > 4) {
		end_of_word = 'ей'
	}
	$('.calc_summ span').text(full_str);
	$('.calc_month b').text(month);
	$('.calc_month span').text(end_of_word);
}

setCurrentNumbers();


function showProducts() {
	var l_price = parseInt(price),
		l_max_price = parseInt(max_price),
		l_min_price = parseInt(min_price),
		diff = l_max_price - l_min_price,
		prod = ['.product_img_2', '.product_img_3', '.product_img_4', '.product_img_5'],
		unit = diff / 8;

	function toggleProd(i) {
		var j = i + 1;

		for (i; i >= 0; i--) {
			$(prod[i]).fadeIn()
		}

		for (j; j < prod.length; j++) {
			$(prod[j]).fadeOut()
		}
	}

	if (l_price > unit * 8) {
		toggleProd(3);
	} else if (l_price > unit * 6) {
		toggleProd(2);
	} else if (l_price > unit * 4) {
		toggleProd(1);
	} else if (l_price > unit * 2) {
		toggleProd(0);
	} else {
		toggleProd(-1);
	}
}

showProducts();

/* --- < Range  --- */

$(".part_7_tabs").tabs({
	active: 0,
	heightStyle: 'auto',
	hide: {
		effect: "fade",
		duration: 400
	},
	show: {
		effect: "fade",
		duration: 400
	},
});


$('.part_8 .slider').slick({
	dots: true,
	infinite: false,
	speed: 300,
	slidesToShow: 1,
	adaptiveHeight: true
});


$('.part_8_button').on('click', function () {
	var popup = $(this).parent().parent().find('.popup');

	popup.fadeToggle('slow');
	popup.find('.popup_wrapper').addClass('default-skin').customScrollbar();

});

$('.popup .close').on('click', function () {
	var popup = $(this).parent();
	popup.fadeOut('slow');
});



/* --- Forms > --- */




$(".input_phone").mask("+7 (999) 999 9999");

$(".input_phone, .input_name").parent().append('<div class="validator_message" />');

$(".input_phone").attr('data-validation', "length");
$(".input_phone").attr('data-validation-length', "17");


$(".input_name").attr('data-validation', "custom");

$(".input_name").attr('data-validation-regexp', "^[a-zA-ZА-Яа-яЁё ]{4,}$");
$(".input_phone").addClass('form-control');
$.validate({
	addValidClassOnAll: true,
});

$('.field_name .validator_message').text('Введите имя (более 3-х букв; допускаются русские и латинские символы, пробелы)');

$('.field_phone .validator_message').text('Введите номер телефона (только цифры)');



/* --- < Forms --- */


/* --- Modal > --- */



$('.modal_window').on('click', function (e) {

	if (e.target.classList.contains('modal_content') || e.target.classList.contains('close') || e.target.classList.contains('modal_wrapper')) {
		modalClose(e);
	}
});

$(window).on('resize', function () {
	$('header').css('width', $('body').width());
})
$('header').css('width', $('body').width());

var window_offset;

function modalOpen(e) {
	e.preventDefault(); //if trigger is link
	var elem = e.target;
	console.log(elem);
	while (!elem.hasAttribute('data-modal-id')) {
		elem = elem.parentElement;
	}
	var modal_id = elem.getAttribute('data-modal-id');
	if ($('#' + modal_id).length > 0) {
		$('#' + modal_id).addClass('modal_visible');
		$('#' + modal_id).fadeIn('slow');
		if (modal_id !== "modal_photo") {
			$('#' + modal_id).find('.wrapper').customScrollbar();
		}
		if (($('#' + modal_id).find('.viewport').innerHeight() /
				$('#' + modal_id).find('.overview').innerHeight()) >
			(874 / 977)) {
			$('#' + modal_id).find('.scroll-bar').css('display', 'none')
		}

		/*console.log($('#' + modal_id).find('.viewport').innerHeight())
		console.log($('#' + modal_id).find('.overview').innerHeight())*/


		var body_width = document.body.offsetWidth;
		window_offset = window.pageYOffset;
		document.body.style.marginRight = window.innerWidth - body_width + "px";
		document.body.style.width = body_width + "px";
		document.body.style.top = "-" + window_offset + "px";
		document.body.classList.add('hidden');

	}
}

var modal_window;

function modalClose(e) {
	var elem = e.target;
	console.log(elem);
	while (!elem.classList.contains('modal')) {
		elem = elem.parentElement;
	}
	$('#' + elem.id).removeClass('modal_visible');
	$('#' + elem.id).fadeOut('slow', modalAfterTransition);

}

function modalAfterTransition() {
	document.body.style.marginRight = 0;
	document.body.style.width = "initial";
	document.body.classList.remove('hidden');
	window.scrollTo(0, window_offset);
}

$('[data-modal-id], [data-modal-id] *').on('click', function (e) {
	modalOpen(e);
});

var gallery_index = 0;
$('[data-modal-id="modal_photo"]').on('click', function (e) {
	var url = $(this).parent().attr('data-img-url');
	gallery_index = $(this).parent().attr('data-gal');
	$('#modal_photo').find('.modal_image').attr('src', url);

});
$('#modal_photo .next').on('click', function (e) {
	gallery_index++;
	if (gallery_index >= $('[data-gal]').length) {
		gallery_index = 1;
	}
	var url = $('[' + 'data-gal="' + gallery_index + '"]').attr('data-img-url');
	$('#modal_photo').find('.modal_image').attr('src', url);

});
$('#modal_photo .prev').on('click', function (e) {
	gallery_index--;
	if (gallery_index === 0) {
		gallery_index = $('[data-gal]').length;
	}
	var url = $('[' + 'data-gal="' + gallery_index + '"]').attr('data-img-url');
	$('#modal_photo').find('.modal_image').attr('src', url);

});


//$('.modal_photo').find('.wrapper').customScrollbar();

/* --- < Modal --- */


//map


var google_map;

function initMap() {
	google_map = new google.maps.Map(document.getElementById('google_map'), {
		center: {
			lat: 51.167681,
			lng: 71.447188
		},
		zoom: 15,
		disableDefaultUI: true,


	});

	var marker_image = 'images/icon_marker.png';
	var redMarker = new google.maps.Marker({
		position: {
			lat: 51.166230,
			lng: 71.437161
		},
		map: google_map,
		icon: marker_image
	});


	var map_style = [
		{
			featureType: "all",
			stylers: [
				{
					hue: "#00d4ff"
				},
				{
					saturation: -800
				},
				{
					lightness: 50
				},
				{
					gamma: 1
				}]
		}];

	google_map.setOptions({
		styles: map_style
	});




}


$('.button, .part_1_button, .part_5_button, .part_8_button').on('mousedown', function () {
	$(this).css('transform', 'translate(1px, 2px)')
});

$('.button,.part_1_button, .part_5_button, .part_8_button').on('mouseup', function () {
	$(this).css('transform', 'translate(0px, 0px)')
});


$('.button, .part_1_button, .part_8_button').prepend('<div class="button_hover" />');

$('.button, .part_1_button, .part_8_button').on('mouseenter', function () {
	$(this).find('.button_hover').animate({
		opacity: 1
	});

});

$('.button, .part_1_button, .part_8_button').on('mouseleave', function () {
	$(this).find('.button_hover').animate({
		opacity: 0
	});

});


/* ANCHOR FIX > */
function checkLocation() {

	var url = $(location).attr('href');

	if (url.indexOf('#') != -1) {
		var from = url.indexOf('#');
		if (url.indexOf('?') != -1) {
			var to = url.indexOf('?');
		}
		var anchor = url.slice(from, to || url.length);

		switch (anchor) {

			case '#modal_1':

				$('[data-modal-id="modal_1"]').trigger('click');
				break;

			case '#modal_2':

				$('[data-modal-id="modal_2"]').trigger('click');

				break;
			case '#modal_3':
				$('[data-modal-id="modal_3"]').trigger('click');


				break;
			case '#modal_4':
				$('[data-modal-id="modal_4"]').trigger('click');


				break;
		}
	}

}

checkLocation();

/* < ANCHOR FIX  */

