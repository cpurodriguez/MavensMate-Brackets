define(function (require, exports, module) {
    'use strict';
    
    var _languages = {
        'en': {
            "CMD_SOME_COMMAND"                  : 'hi'
        },
        'es': {
            "CMD_SOME_COMMAND"                  : 'hola'
        }
    };
    
    function getLanguage(lang_flag) {
        var def_language = "en-US",
            _lang = lang_flag.split('-')[0] || lang_flag;
        
        return _languages[_lang] || _languages[def_language];
    }
    
    exports.Strings = getLanguage;
});