/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

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
        MMInterface         = require("lib/MMInterface"),
        MMPanel             = require("lib/Panel"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        FileUtils           = brackets.getModule("file/FileUtils"),
        CodeInspection      = brackets.getModule("language/CodeInspection"),
        PopUpManager        = brackets.getModule("widgets/PopUpManager"),
        Menus               = brackets.getModule('command/Menus'),
        MMSettings          = require('lib/Settings');


    var appMenu             = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU),
        projectMenu         = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
        workingsetMenu      = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_MENU),
        nodeConnection      = new NodeConnection();

    var operationHtml        = require("text!templates/operation-row.html");

    var Utils               = require('lib/Utils');
    
    //Languages           = require('lib/Strings');
    // var userLanguage        = brackets.app.language,
    //     langs               = Languages.Strings(userLanguage);

    var MavensMateMenu = Menus.addMenu("MavensMate", "mavensmate", Menus.AFTER, Menus.AppMenuBar.HELP_MENU);

    // Extension variables
    var EXT_ID          = 'org.mavens.mavensmate';

    var mmInterface;

    var apexLanguage = LanguageManager.getLanguage("java");
    apexLanguage.addFileExtension("cls");
    apexLanguage.addFileExtension("trigger");

    var vfLanguage = LanguageManager.getLanguage("html");
    vfLanguage.addFileExtension("page");
    vfLanguage.addFileExtension("component");
 
    function isMavensMatefile(fileEntry) {
        //Utils.debug(fileEntry);
        var language = LanguageManager.getLanguageForPath(fileEntry.file.fullPath);
        return (language.getId() === "java" || language.getId() === "html" || language.getId() === "apex");
    }

    //TODO: display popup menu of commands?
    function showCommands() {

    }

    //adds 3-dot MavensMate icon to the Brackets toolbar
    function addToolbarButton() {
        // Insert the reload button in the toolbar to the left of the first a element (life preview button)
        var colors              = ["#cccccc", "#e6861c"];
        var $reloadButton = $("<a id='mavensmate-toolbar-button'>")
            .text("")
            .attr("title", "MavensMate")
            .addClass("")
            .click(showCommands)
            .insertBefore("#main-toolbar .buttons a:first");
    }

    //TODO: make this command smarter, display window of MavensMate projects to choose from
    function openProject() {
        ProjectManager.openProject();
    }

    function handleCompile() {
        //pass
    }

    // Handles file save
    function handleSave(event, document) {        
        var editor = EditorManager.getCurrentFullEditor();
        if (!isMavensMatefile(editor.document)) return;
            
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

        MMPanel.show();

        var jsonPayload = {
            project_name    : projectName, 
            files           : [document.file.fullPath], 
            workspace       : workspace
        }

        mmInterface.call({
            operation : "compile",
            payload : jsonPayload,
            pId : pId,
            nodeConnection : nodeConnection
        });
    }

    //hook into brackets save operation
    $(DocumentManager).on("documentSaved", handleSave);
     
    AppInit.htmlReady(function () {
        MMPanel.create(); //instantiate MavensMate panel
        addToolbarButton(); //add the 3-dot MavensMate logo to the Brackets toolbar area
    });

    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, "templates/css/style.css"); //initiate MavensMate stylesheet

        //initiate nodeconnection for mm cli
        nodeConnection = new NodeConnection();
        mmInterface = new MMInterface();

        function connect() {
            var connectionPromise = nodeConnection.connect(true);
            connectionPromise.fail(function () {
                console.error("[mavensmate] failed to connect to node");
            });
            return connectionPromise;
        }

        function loadMavensMateDomain() {
            var path = ExtensionUtils.getModulePath(module, "node/MavensMateDomain");
            var loadPromise = nodeConnection.loadDomains([path], true);
            loadPromise.fail(function (e) {
                console.log("[mavensmate] failed to load mavensmate domain");
                console.log(e)
            });
            return loadPromise;
        }

        //all mm cli responses should be handled by mmInterface.handleResponse and delegated from there
        $(nodeConnection).on("mmexec.update", mmInterface.handleResponse);

        Utils.chain(connect, loadMavensMateDomain);
    });

    //setup commands
    var COMPILE = "mm.compile";   // package-style naming to avoid collisions
    CommandManager.register("Compile", COMPILE, handleCompile);

    var OPEN_PROJECT = "mm.open_project";   // package-style naming to avoid collisions
    CommandManager.register("Open Project", OPEN_PROJECT, openProject);

    //add them to the MavensMate menu
    MavensMateMenu.addMenuItem(COMPILE);
    MavensMateMenu.addMenuItem(OPEN_PROJECT, "Ctrl-o");
});