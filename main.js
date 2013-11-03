/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {

    "use strict";

     // Brackets modules
    var Commands            = brackets.getModule('command/Commands'),
        CommandManager      = brackets.getModule('command/CommandManager'),
        DocumentManager     = brackets.getModule('document/DocumentManager'),
        EditorManager       = brackets.getModule('editor/EditorManager'),
        PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        StringUtils         = brackets.getModule('utils/StringUtils'),
        Menus               = brackets.getModule('command/Menus');

    // Extension variables
    var EXT_ID          = 'org.mavens.mavensmate',
        //settings        = require('settings'),
        //preferences     = PreferencesManager.getPreferenceStorage(module, settings),
        menu            = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

    // Function to run when the menu item is clicked
    function handleHelloWorld() {
        window.alert("Hello, world!");
    }

    // Handles file save
    function handleSave() {
        if (isMavensMateFile) {
            //save to server
        }
    }

    
    
    // First, register a command - a UI-less object associating an id to a handler
    var MY_COMMAND_ID = "helloworld.sayhello";   // package-style naming to avoid collisions
    CommandManager.register("Hello World", MY_COMMAND_ID, handleHelloWorld);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(MY_COMMAND_ID);
    
    // We could also add a key binding at the same time:
    //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-H");
    // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)

    exports.handleHelloWorld = handleHelloWorld;
});