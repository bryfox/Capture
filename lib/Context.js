(function () {
  return {
          all: function () { return contextList; },
          current: function () {
              var match = phantom.state.match(new RegExp("#(" + Context.all().join('|') + ")$"));
              return match ? match[1] : Context.all()[0];
          },
          previous: function () {
              var prevIndex = Context.currentIndex() - 1;
              if (prevIndex <= 0) prevIndex = Context.all().length - 1;
              return Context.all()[prevIndex];
          },
          next: function () {
              var nextIndex = Context.atLastInGroup() ? 0 : Context.currentIndex() + 1;
              return Context.all()[nextIndex];
          },
          currentIndex: function () {
              return Context.all().indexOf(Context.current());
          },
          atLastInGroup: function () {
              return Context.currentIndex() == Context.all().length - 1;
          }
      }
}());
