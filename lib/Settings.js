define(function (require, exports, module) {
    'use strict';

    var ExtensionLoader     = brackets.getModule("utils/ExtensionLoader"),
        FileSystem          = brackets.getModule("filesystem/FileSystem");
    
    var Utils               = require('lib/Utils');

    exports.getSetting = function(settingName) {
        var result = new $.Deferred();

        Utils.debug('getting setting ---> '+settingName);
        var extensionPath = ExtensionLoader.getUserExtensionPath();
        Utils.debug(extensionPath);

        var userSettingsFile = FileSystem.getFileForPath(extensionPath+"/mavensmate-user-settings.json");
        var defaultSettingsFile = FileSystem.getFileForPath(extensionPath+"/mavensmate/settings.json");

        userSettingsFile.read(function (err, content) {
            if (!err) {
                var settings;
                var value;
                try {
                    settings = JSON.parse(content);
                    value = settings[settingName];
                    result.resolve(value);
                    return;
                } catch(e) {
                    defaultSettingsFile.read(function (err, content) {
                        if (!err) {
                            var settings;
                            var value;
                            try {
                                settings = JSON.parse(content);
                                value = settings[settingName];
                                result.resolve(value);
                                return;
                            } catch(e) { }   
                        }
                    });
                }     
            }
        });
        return result.promise();
    }
    
});