define(function (require, exports, module) {
    'use strict';

    // get bracket jscompress full path
    exports.getExtensionPath = function () {
        var file_cwd = String(module.uri).split('/');
                
        file_cwd.pop();
        
        return file_cwd.join('/');
    };

    // get random process id
    exports.getProcessId = function() {
        Math.random().toString(36).substring(3);
    };

});