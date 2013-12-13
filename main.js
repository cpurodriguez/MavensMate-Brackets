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
        MMInterface         = require("lib/mmInterface"),
        MMPanel             = require("lib/mmPanel"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        FileUtils           = brackets.getModule("file/FileUtils"),
        CodeInspection      = brackets.getModule("language/CodeInspection"),
        PopUpManager        = brackets.getModule("widgets/PopUpManager"),
        Menus               = brackets.getModule('command/Menus');

    var appMenu             = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU),
        projectMenu         = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
        workingsetMenu      = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_MENU),
        nodeConnection      = null;

    var operationHtml        = require("text!templates/operation-row.html");

    var Utils               = require('lib/Utils');
    
    //Languages           = require('lib/Strings');
    // var userLanguage        = brackets.app.language,
    //     langs               = Languages.Strings(userLanguage);

    // Extension variables
    var EXT_ID          = 'org.mavens.mavensmate',
        //settings        = require('settings'),
        //preferences     = PreferencesManager.getPreferenceStorage(module, settings),
        menu            = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

    var mmInterface;
    //var mmPanel;

    var apexLanguage = LanguageManager.getLanguage("java");
    apexLanguage.addFileExtension("cls");
    apexLanguage.addFileExtension("trigger");

    var vfLanguage = LanguageManager.getLanguage("html");
    vfLanguage.addFileExtension("page");
    vfLanguage.addFileExtension("component");

    // Function to run when the menu item is clicked
    function handleHelloWorld() {
        window.alert("Hello, world!");
    }

    function isMavensMatefile(fileEntry) {
        console.dir(fileEntry);
        var language = LanguageManager.getLanguageForPath(fileEntry.file.fullPath);
        return (language.getId() === "java" || language.getId() === "html");
    }

    function showCommands() {

    }

    function addToolbarButton() {
        // Insert the reload button in the toolbar to the left of the first a element (life preview button)
        var colors              = ["#cccccc", "#e6861c"];
        $reloadButton = $("<a id='mavensmate-toolbar-button'>")
            .text("")
            .attr("title", "MavensMate")
            .addClass("")
            .click(showCommands)
            .insertBefore("#main-toolbar .buttons a:first");
    }

    // Handles file save
    function handleSave(event, document) {        
        var editor = EditorManager.getCurrentFullEditor();
        if (isMavensMatefile(editor.document)) {
            
            Utils.debug(ProjectManager.getProjectRoot());
            Utils.debug(ProjectManager.getBaseUrl());

            var projectDetails = ProjectManager.getProjectRoot();
            var projectName = projectDetails.name;
            var projectPath = projectDetails.fullPath;
            if (Utils.stringEndsWith(projectPath, '/')) {
                projectPath = projectPath.substring(0, projectPath.length - 1);
            }
            var workspace = FileUtils.getDirectoryPath(projectPath);

            Utils.debug(workspace)

            //generate process id
            var pId = Utils.getProcessId();
            
            //generate html row
            var $rowHtml = Mustache.render(operationHtml, {
                processId : pId,
                timestamp : Utils.getTimeStamp(),
                operation : "compile",
                fullPath  : document.file.fullPath,
                fileName  : document.file.name
            });

            $("#mavensmate-bottom-panel .bottom-panel-table tbody")
                .append($rowHtml);

            //panel.hide();
            MMPanel.show();

            var jsonPayload = {
                project_name    : projectName, 
                files           : [document.file.fullPath], 
                workspace       : workspace
            }

            mmInterface.call({
                operation : 'compile',
                payload : jsonPayload,
                pId     : pId
            })
        }
    }

    //hook into brackets save operation
    $(DocumentManager).on("documentSaved", handleSave);
    
    AppInit.htmlReady(function () {
        MMPanel.create();
        addToolbarButton();
    });

    AppInit.appReady(function () {

        //var $foo = $('<div>BOOOOO</div>')
        //PopUpManager.addPopUp($foo, function() { }, false)

        ExtensionUtils.loadStyleSheet(module, "templates/css/style.css");

        mmInterface = new MMInterface();
        var nodeConnection = mmInterface.nodeConnection;

        // connect to Node
        function connectNode() {
            var node = nodeConnection.connect(true);
            
            //console.info(StringUtils.format(langs.DBG_CONNECTING_TO_NODE, Commands.EXTENSION_ID));
            
            node
                .fail(function () {
                    //console.Utils.error(StringUtils.format(langs.DBG_CONNECTING_TO_NODE_FAIL, Commands.EXTENSION_ID));
                    Utils.debug('fail')
                })
                .done(function () {
                    //console.info(StringUtils.format(langs.DBG_CONNECTION_TO_NODE_SUCCESS, Commands.EXTENSION_ID));
                    Utils.debug('done')
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
                    Utils.error('fail')
                })
                .done(function () {
                    //console.info(StringUtils.format(langs.DBG_TO_LOAD_NODEEXEC_DOMAIN_SUCCESS, Commands.EXTENSION_ID, nodeModule));
                    Utils.debug('done')
                });
            
            return nodeDomains;
        }
        
        $(nodeConnection)
            .on("mmexec.update", mmInterface.handleResponse);
        
        
        // load in chain
        Utils.chain(connectNode, loadNodeModule);
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