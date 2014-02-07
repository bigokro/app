/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var render = require('render');
var events = require('events');
var sidebar = require('./sidebar-container');
var filter = require('./filter');
var list = require('./list');
var lawsFilter = require('laws-filter');
var o = require('query');
var log = require('debug')('democracyos:sidebar:view');

/**
 * Expose SidebarView
 */

module.exports = SidebarView;

/**
 * Create Sidebar List view container
 */

function SidebarView() {
  if (!(this instanceof SidebarView)) {
    return new SidebarView();
  };

  this.state('initializing');

  // Prep event handlers
  this.onfilterready = this.onfilterready.bind(this);

  this.el = render.dom(sidebar);
  this.events = events(this.el, this);

  this.switchOn();
}

Emitter(SidebarView.prototype);

SidebarView.prototype.switchOn = function() {
  filter.ready(this.onfilterready);
}

SidebarView.prototype.switchOff = function() {
  // intentionally left blank
}

SidebarView.prototype.onfilterready = function() {
  filter.render(o('#filter-container', this.el));
  list.ready(this.onlistready.bind(this));
};

SidebarView.prototype.onlistready = function() {
  list.render(o('#list-container', this.el));
  this.state('loaded');
};

SidebarView.prototype.render = function(el) {
  if (1 === arguments.length) {

    // if string, then query element
    if ('string' === typeof el) {
      el = o(el);
    };

    // if it's not currently inserted
    // at `el`, then append to `el`
    if (el !== this.el.parentNode) {
      el.appendChild(this.el);
    };

    // !!!: Should we return different things
    // on different conditions?
    // Or should we be consistent with
    // render returning always `this.el`
    return this;
  };

  return this.el;
}

SidebarView.prototype.items = function(index) {
  return lawsFilter.items()[index];
};

SidebarView.prototype.select = function(id) {
  // var els = this.el.querySelectorAll('ul.nav.navlist li');
  // var el = this.el.querySelector('ul.nav.navlist li[data-id="' + id + '"]');

  // if (el) {
  //   for (var i = 0; i < els.length; i++) {
  //     classes(els[i]).remove('active');
  //   };
  //   classes(el).add('active');
  // }

  // return this;
}

SidebarView.prototype.selected = function() {
  // var el = this.el.querySelector('ul.nav.navlist li.active');
  // var id = el ? el.getAttribute('data-id') : null;

  // return id ? get(this.items, 'id === "%id"'.replace('%id', id)) : null;
  // Undo this:
  return null;
}



// SidebarView.prototype.onfilterselect = function(ev) {
//   ev.preventDefault();

//   var list = this.el.querySelector('ul.nav.navlist');
//   empty(list);

//   var target = ev.delegateTarget || closest(ev.target, '[data-id]');
//   var id = target.getAttribute('data-id');

//   log('filter select click %s', id);

//   var items = 'all' === id ? this.items : this.items.filter(function(i) {
//     return i.tag.id === id;
//   });

//   items.forEach(function(item) {
//     this.append(item);
//   }, this);

//   // Update current filter box text
//   var tag = get(this.filters, 'id === "%id"'.replace('%id', id));
//   this.el.querySelector('.dropdown-department .current-department').innerHTML = tag.name;
// }

/**
 * Emit `ready` if collection has
 * completed a cycle of request
 *
 * @param {Function} fn
 * @return {Laws} Instance of `Laws`
 * @api public
 */

SidebarView.prototype.ready = function(fn) {
  var self = this;

  function done() {
    if ('loaded' === self.state()) {
      return fn();
    }
  }

  if ('loaded' === this.state()) {
    setTimeout(done, 0);
  } else {
    this.once('loaded', done);
  }

  return this;
}

/**
 * Save or retrieve current instance
 * state and emit to observers
 *
 * @param {String} state
 * @param {String} message
 * @return {SidebarView|String} Instance of `SidebarView` or current `state`
 * @api public
 */

SidebarView.prototype.state = function(state, message) {
  if (0 === arguments.length) {
    return this.$_state;
  }

  log('state is now %s', state);
  this.$_state = state;
  this.emit(state, message);
  return this;
};

/**
 * Handle errors
 *
 * @param {String} error
 * @return {SidebarView} Instance of `SidebarView`
 * @api public
 */

SidebarView.prototype.error = function(message) {
  // TODO: We should use `Error`s instead of
  // `Strings` to handle errors...
  // Ref: http://www.devthought.com/2011/12/22/a-string-is-not-an-error/
  this.state('error', message);
  log('error found: %s', message);

  // Unregister all `ready` listeners
  this.off('ready');
  return this;
}

// function get(list, query) {
//   var match;
//   var test = new Function('_', 'return _.' + query);

//   list.some(function(l) {
//     if (test(l)) {
//       match = l;
//       return true;
//     };
//     return false;
//   });
//   return match || null;
// }