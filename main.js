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
        LanguageManager     = brackets.getModule("language/LanguageManager"),
        AppInit             = brackets.getModule("utils/AppInit"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        NodeConnection      = brackets.getModule("utils/NodeConnection"),
        ProjectManager      = brackets.getModule("project/ProjectManager"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        PanelManager        = brackets.getModule("view/PanelManager"),
        Strings             = require("strings"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        CodeInspection      = brackets.getModule("language/CodeInspection"),
        Menus               = brackets.getModule('command/Menus');

    var appMenu             = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU),
        projectMenu         = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
        workingsetMenu      = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_MENU),
        nodeConnection      = null;

    var panelHtml           = require("text!templates/bottom-panel.html"),
        panel;

    var Utils               = require('lib/Utils');
    
    //Languages           = require('lib/Strings');
    // var userLanguage        = brackets.app.language,
    //     langs               = Languages.Strings(userLanguage);

    // Extension variables
    var EXT_ID          = 'org.mavens.mavensmate',
        //settings        = require('settings'),
        //preferences     = PreferencesManager.getPreferenceStorage(module, settings),
        menu            = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

    var activePanelProcess = []

    var apexLanguage = LanguageManager.getLanguage("java");
    apexLanguage.addFileExtension("cls");
    apexLanguage.addFileExtension("trigger");

    var vfLanguage = LanguageManager.getLanguage("html");
    vfLanguage.addFileExtension("page");
    vfLanguage.addFileExtension("component");

    function debug(message) {
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

    function error(message) {
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

    debug('ok')

    // Function to run when the menu item is clicked
    function handleHelloWorld() {
        window.alert("Hello, world!");
    }

    function isMavensMatefile(fileEntry) {
        console.dir(fileEntry);
        var language = LanguageManager.getLanguageForPath(fileEntry.file.fullPath);
        return (language.getId() === "java" || language.getId() === "html");
    }

    // Handles file save
    function handleSave(event, document) {
        debug('saving')
        debug(document)
        var editor = EditorManager.getCurrentFullEditor();
        if (isMavensMatefile(editor.document)) {
            var processId = Utils.getProcessId();
            activePanelProcess.push(processId)
            
            var s = Mustache.render(panelHtml, Strings);
            panel = PanelManager.createBottomPanel('mavens.mavensmate.panel', $(s), 100);

            //panel.hide();
            panel.show();

            //save to server
            var command = '/Users/josephferraro/Development/joey2/bin/python /Users/josephferraro/Development/Github/mm/mm.py -c BRACKETS -o compile';
            nodeConnection.domains.mmexec.runScript(command, null, Utils.getProcessId() {
                cwd: Utils.getExtensionPath()
            });
        }
    }

    // // Handles file save
    // function handleHinter(text, fullPath) {
    //     //save to server
    //     var command = '/Users/josephferraro/Development/joey2/bin/python /Users/josephferraro/Development/Github/mm/mm.py -c BRACKETS -o compile';
    //     nodeConnection.domains.mmexec.runScript(command, null, {
    //         cwd: Utils.getExtensionPath()
    //     });

    //     var result = { errors: [] };

    // }

    //hook into brackets save operation
    $(DocumentManager).on("documentSaved", handleSave);
    
    function chain() {
        var functions = Array.prototype.slice.call(arguments, 0);
        
        if (functions.length > 0) {
            var currentFunction = functions.shift(),
                callee = currentFunction.call();

            callee.done(function () {
                chain.apply(null, functions);
            });
        }
    }

    AppInit.appReady(function () {
        
        // CodeInspection.register("apex", {
        //     name: "Apex",
        //     scanFile: handleHinter
        // });

        ExtensionUtils.loadStyleSheet(module, "templates/css/style.css");

        nodeConnection = new NodeConnection();
        
        // connect to Node
        function connectNode() {
            var node = nodeConnection.connect(true);
            
            //console.info(StringUtils.format(langs.DBG_CONNECTING_TO_NODE, Commands.EXTENSION_ID));
            
            node
                .fail(function () {
                    //console.error(StringUtils.format(langs.DBG_CONNECTING_TO_NODE_FAIL, Commands.EXTENSION_ID));
                    debug('fail')
                })
                .done(function () {
                    //console.info(StringUtils.format(langs.DBG_CONNECTION_TO_NODE_SUCCESS, Commands.EXTENSION_ID));
                    debug('done')
                });
            
            return node;
        }
        
        
        // load NodeJS module
        function loadNodeModule() {
            var nodeModule = ExtensionUtils.getModulePath(module, 'node/MavensMateDomain');
            var nodeDomains = nodeConnection.loadDomains([nodeModule], true);
            
            nodeDomains
                .fail(function () {
                    //console.log(StringUtils.format(langs.DBG_TO_LOAD_NODEEXEC_DOMAIN_ERROR, Commands.EXTENSION_ID, nodeModule));
                    error('fail')
                })
                .done(function () {
                    //console.info(StringUtils.format(langs.DBG_TO_LOAD_NODEEXEC_DOMAIN_SUCCESS, Commands.EXTENSION_ID, nodeModule));
                    debug('done')
                });
            
            return nodeDomains;
        }
        
        // update status (working) function
        $(nodeConnection)
            .on("mmexec.update", function (domain, response) {
                debug(domain)
                debug(response)
                var command = JSON.parse(response); // parsing json from node js
            
                if (command.stderr || command.stdout) { // if compressing process fail
                    var type = CodeInspection.Type.ERROR;
                    //console.error(StringUtils.format(langs.DBG_GENERIC_ERROR, Commands.EXTENSION_ID, command.stderr || command.stdout));
                    debug(command.stderr || command.stdout)
                    var dialog = Dialogs.showModalDialog(
                        Dialogs.DIALOG_ID_ERROR,
                        StringUtils.format('building title', 'foo'),
                        StringUtils.format('error title', command.stderr || command.stdout)
                    );
                } else {
                    //console.info(StringUtils.format(langs.DBG_BUILD_SUCCESSFUL, Commands.EXTENSION_ID));
                    debug('success?')
                }
                
                ProjectManager.refreshFileTree(); // refresh file tree to see new file
            });
        
        // load in chain
        chain(connectNode, loadNodeModule);
    });
    // // First, register a command - a UI-less object associating an id to a handler
    // var MY_COMMAND_ID = "helloworld.sayhello";   // package-style naming to avoid collisions
    // CommandManager.register("Hello World", MY_COMMAND_ID, handleHelloWorld);

    // // Then create a menu item bound to the command
    // // The label of the menu item is the name we gave the command (see above)
    // var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    // menu.addMenuItem(MY_COMMAND_ID);
    
    // // We could also add a key binding at the same time:
    // //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-H");
    // // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)

    // exports.handleHelloWorld = handleHelloWorld;

});