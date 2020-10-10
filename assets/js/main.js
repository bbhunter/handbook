var _ = (function() {
  "use strict";

  var defaults = {{ $.Site.Params.m | jsonify }}
  var profiles = JSON.parse(localStorage.getItem("profiles")) || [];
  var current_profile = localStorage.getItem("current_profile") || "default";

  /**
   * Replace values in the DOM.
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
    for (const v in n) {
      _replace(o[v], n[v]);
    }
  }

  /**
   * Initial setup.
   * Creates the initial profile, prints help and current status.
   */
  var _init = function() {
    console.log("Curiosity pays off!");

    // Create initial profile.
    if (profiles.length == 0) {
      _set_profile(current_profile, {})
    }

    // List available methods.
    console.log("Methods: %s", Object.keys(methods));
    console.table(_params());
  }

  /**
   * Reset to the default state.
   */
  var _exit = function() {
    console.log("Bye!");
  }

  // Profiles & Params

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
    localStorage.setItem("current_profile", name)
    localStorage.setItem("profiles", JSON.stringify(profiles))
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

      // Replace parameter
      _replace(profile["params"][param], value)

      // Update stored profiles
      profile["params"][param] = value;
      profiles[profiles.findIndex(p => p.name == profile.name)] = profile
      localStorage.setItem("profiles", JSON.stringify(profiles))
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

  methods.run = function() {
    _init();
    _replace_all(defaults, _params());
  }

  methods.set = function(param, value) {
    _update_profile_param(current_profile, param,value);
  }

  methods.options = function() {
    console.table(_params());
  }

  methods.exit = function() {
    _exit();
    _replace_all(_params(), defaults);
  }

  return methods;
})();

_.run();
