var _ = (function() {
  "use strict";

  const item_profiles = "_profiles";
  const item_profile = "_cprofile"
  const item_status = "_status"

  var defaults = {{ $.Site.Params.m | jsonify }}
  var profiles = JSON.parse(localStorage.getItem(item_profiles)) || [];
  var current_profile = localStorage.getItem(item_profile) || "default";
  var status = JSON.parse(localStorage.getItem(item_status)) || false;

  /**
   * Initial setup.
   * Creates the initial profile, prints help and current status.
   */
  var _init = function() {
    console.log("Curiosity pays off!");
    _help();

    // Persist status
    localStorage.setItem(item_status, true);

    // Create initial profile.
    if (profiles.length == 0) _set_profile(current_profile, {})

    // Set logo indicator
    document.getElementsByClassName("book-brand")[0].getElementsByTagName("img")[0].classList.add('__');

    _replace_all(defaults, _params());
  }

  /**
   * Reset to the default state.
   */
  var _exit = function() {
    console.log("Bye!");

    // Persist status
    localStorage.setItem(item_status, false);

    // Reset logo indicator
    document.getElementsByClassName("book-brand")[0].getElementsByTagName("img")[0].classList.remove('__');

    _replace_all(_params(), defaults);
  }

  /**
   * Prints help
   */
  var _help = function() {
    console.log("Methods: %s", Object.keys(methods));
    console.table(_params());
  };

  /**
   * Replace value in the DOM.
   *
   * @param {String}  o Old Value
   * @param {String}  n New Value
   */
  var _replace = function(o,n) {
    const r = new RegExp(escape(o),"g");
    document.body.innerHTML = document.body.innerHTML.replace(r, n);
  }

  /**
   * Replace values in the DOM from the given objects.
   *
   * @param {Object} o Parameters object.
   * @param {Object} n Parameters object.
   */
  var _replace_all = function(o,n) {
    for (const v in n) _replace(o[v], n[v]);
  }

  /**
   * Creates new profile
   * Adds the new profile to the <profiles>,
   * stores the new value in localStorage,
   * and set it as the current profile.
   *
   * @param {String}  name    Profile name.
   * @param {Object}  params  Initial parameters.
   */
  var _set_profile = function(name, params) {
    var profile = {
      "name": name,
      "params": params
    }
    profiles.push(profile)
    localStorage.setItem(item_profile, name)
    localStorage.setItem(item_profiles, JSON.stringify(profiles))
  }

  /**
   * Returns a profile for the given name.
   *
   * @return {Object} Profile.
   */
  var _get_profile = function(name) {
    return profiles.find(o => o.name ===  name);
  }

  /**
   * Updates a profile parameter.
   * Replaces the value in the DOM and stores the new value in localStorage.
   *
   * @param {String}  name  Profile name.
   * @param {String}  param Parameter name.
   * @param {String}  value Parameter new value.
   */
  var _update_profile_param = function(name, param, value) {
    if (param in _params()) {
      var profile = _get_profile(name);
      _replace(profile["params"][param], value)

      // Update stored profiles
      profile["params"][param] = value;
      profiles[profiles.findIndex(p => p.name == profile.name)] = profile
      localStorage.setItem(item_profiles, JSON.stringify(profiles))
    }else{
      console.error("Invalid parameter.");
    }
  }

  /**
   * Merge default and current profile parameters.
   *
   * @return {Object} Current available parameters.
   */
  var _params = function() {
    var profile_params = _get_profile(current_profile)["params"];
    var params = Object.assign({}, defaults, profile_params)
    return params;
  }

  // Public Methods

  var methods = {};

  methods.status = status;

  methods.run = function() {
    _init();
  }

  methods.exit = function() {
    _exit();
  }

  methods.set = function(param, value) {
    _update_profile_param(current_profile, param,value);
  }

  methods.help = function() {
    _help();
  }

  return methods;
})();

if (_.status === true) _.run();
