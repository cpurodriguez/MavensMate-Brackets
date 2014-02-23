define(function (require, exports, module) {
    'use strict';

    var ExtensionLoader     = brackets.getModule("utils/ExtensionLoader");


    // get bracket jscompress full path
    exports.getExtensionPath = function () {
        var file_cwd = String(module.uri).split('/');
                
        file_cwd.pop();
        
        return file_cwd.join('/');
    };

    // get bracket jscompress full path
    exports.getMMLocation = function () {
        var extensionPath = ExtensionLoader.getUserExtensionPath();
        return extensionPath+"/mavensmate/mm/mm.py";
    };

    // get random process id
    exports.getProcessId = function() {
        return Math.random().toString(36).substring(3);
    };

    exports.stringEndsWith = function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    exports.debug = function(message) {
        if (typeof message == 'string' || message instanceof String) {
            console.log('[mavensmate] '+message);
        } else {
            try {
                var s = JSON.stringify(message);
                console.log('[mavensmate] OBJECT TO STRING '+s);
                console.log(message) 
            } catch(e) {
                console.log('[mavensmate]');
                console.log(message) 
            }
        }
        
    }

    exports.error = function(message) {
        if (typeof message == 'string' || message instanceof String) {
            console.log('[mavensmate] ERROR '+message);
        } else {
            try {
                var s = JSON.stringify(message);
                console.log('[mavensmate] ERROR TO STRING'+s);
                console.log(message) 
            } catch(e) {
                console.log('[mavensmate] ERROR');
                console.log(message) 
            }
        }
    }

    // exports.chain = function() {
    //     var functions = Array.prototype.slice.call(arguments, 0);
        
    //     if (functions.length > 0) {
    //         var currentFunction = functions.shift(),
    //             callee = currentFunction.call();

    //         callee.done(function () {
    //             exports.chain.apply(null, functions);
    //         });
    //     }
    // }

    exports.chain = function() {
        var functions = Array.prototype.slice.call(arguments, 0);
        if (functions.length > 0) {
            var firstFunction = functions.shift();
            var firstPromise = firstFunction.call();
            firstPromise.done(function () {
                exports.chain.apply(null, functions);
            });
        }
    }

    /**
     * Return a timestamp with the format "m/d/yy h:MM:ss TT"
     * @type {Date}
     */

    exports.getTimeStamp = function() {
    // Create a date object with the current time
      var now = new Date();

    // Create an array with the current month, day and time
      var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

    // Create an array with the current hour, minute and second
      var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

    // Determine AM or PM suffix based on the hour
      var suffix = ( time[0] < 12 ) ? "AM" : "PM";

    // Convert hour from military time
      time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

    // If hour is 0, set it to 12
      time[0] = time[0] || 12;

    // If seconds and minutes are less than 10, add a zero
      for ( var i = 1; i < 3; i++ ) {
        if ( time[i] < 10 ) {
          time[i] = "0" + time[i];
        }
      }

    // Return the formatted string
      return date.join("/") + " " + time.join(":") + " " + suffix;
    }

    //TODO: get plugin settings


});