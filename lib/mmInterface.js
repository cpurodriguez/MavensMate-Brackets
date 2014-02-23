/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";

    var NodeConnection      = brackets.getModule("utils/NodeConnection"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        Utils               = require('lib/Utils'),
        MMPanel             = require('lib/Panel'),
        MMSettings          = require('lib/Settings'),
        FileUtils           = brackets.getModule("file/FileUtils"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem"),
        CodeInspection      = brackets.getModule("language/CodeInspection"),
        ProjectManager      = brackets.getModule("project/ProjectManager"),
        EditorManager       = brackets.getModule('editor/EditorManager');

    /**
     * MMInterface objects encapsulate state associated with a hinting session
     * and provide methods for updating and querying the session.
     *
     * @constructor
     * @param {Editor} editor - the editor context for the session
     */
    function MMInterface() {
        // this.editor = editor;
        // this.path = editor.document.file.fullPath;
        // this.ternHints = [];
        // this.ternGuesses = null;
        // this.fnType = null;
        // this.builtins = null;

        var extPath = Utils.getExtensionPath();
        //NativeFileSystem
        //FileUtils.readAsText()

        this.activePanelProcessIds = [];
    }

    MMInterface.prototype.handleResponse = function(domain, response) {
        var editor = EditorManager.getCurrentFullEditor();

        Utils.debug('-----> HANDLING RESPONSE');
        Utils.debug(domain);
        Utils.debug(response);
        var command = JSON.parse(response); // parsing json from node js
    
        if (command.stderr || command.stdout) { // if compressing process fail
            var type = CodeInspection.Type.ERROR;
            Utils.debug(command.stderr || command.stdout)
            var pId = command.processId;

            var mmJsonResponse = JSON.parse(command.stdout);
            
            $("#"+pId).find(".progressIndicator").remove()
            
            var message = '';
            if ('MetadataContainerId' in mmJsonResponse) {
                if (mmJsonResponse['State'] === 'Failed') {
                    if ('CompilerErrors' in mmJsonResponse) {
                        Utils.debug(mmJsonResponse['CompilerErrors']);
                        var compilerErrors;
                        if (typeof mmJsonResponse['CompilerErrors'] == 'string' || mmJsonResponse['CompilerErrors'] instanceof String) {
                            compilerErrors = JSON.parse(mmJsonResponse['CompilerErrors']);
                        } else {
                            compilerErrors = mmJsonResponse['CompilerErrors'];
                        } 
                        message = compilerErrors[0]['problem']; 

                        editor._codeMirror.setSelection({line: compilerErrors[0]['line']-1, ch: 0}, {line: compilerErrors[0]['line']-1, ch: null});
                        editor._codeMirror.setGutterMarker(compilerErrors[0]['line']-1, "breakpoints", document.createTextNode("hi"));
                    }
                } else {
                    MMPanel.hide()
                }
            }
            
            $("#"+pId).find(".progressCell").append(message);


        } else {
            //pass
        }
        
        ProjectManager.refreshFileTree(); // refresh file tree to see new file
    }


    MMInterface.prototype.call = function (params) {
        var pId = params.pId;
        this.activePanelProcessIds.push(pId);

        var nodeConnection = params.nodeConnection;
        var operation = params.operation;
        var jsonPayload = params.payload;
        
        var pythonLocation;
        var mmLocation;

        MMSettings.getSetting("mm_python_location")
            .then(function(result) {
                pythonLocation = result;
                Utils.debug(pythonLocation);
            })
            .then(function() {
                MMSettings.getSetting("mm_debug_location")
                    .then(function(result) {
                        mmLocation = result;
                        Utils.debug(mmLocation);
                    })
                    .then(function() {
                        //Utils.debug('----> SENDING!!');
                        var command;
                        if (pythonLocation != null && mmLocation != null) {
                            command = pythonLocation+' '+mmLocation+' -c BRACKETS -o '+operation;
                        } else {
                            command = '/Applications/MavensMate.app/Contents/Resources/mm/mm -c BRACKETS -o '+operation;
                        }
                        Utils.debug(command);
                        nodeConnection.domains.mmexec.runScript(command, jsonPayload, pId, { cwd: Utils.getExtensionPath() })
                            .fail(function (err) {
                                Utils.debug(err);
                                Utils.debug(err.toString());
                            });
                    });
            });
    };

    /**
     *  Get the builtin libraries tern is using.
     *
     * @return {Array.<string>} - array of library names.
     * @private
     */
    MMInterface.prototype._getBuiltins = function () {
        if (!this.builtins) {
            this.builtins = ScopeManager.getBuiltins();
            this.builtins.push("requirejs.js");     // consider these globals as well.
        }

        return this.builtins;
    };

    /**
     * Get the name of the file associated with the current session
     * 
     * @return {string} - the full pathname of the file associated with the
     *      current session
     */
    MMInterface.prototype.getPath = function () {
        return this.path;
    };

    /**
     * Get the current cursor position.
     *
     * @return {{line: number, ch: number}} - the current cursor position
     */
    MMInterface.prototype.getCursor = function () {
        return this.editor.getCursorPos();
    };

    /**
     * Get the text of a line.
     *
     * @param {number} line - the line number     
     * @return {string} - the text of the line
     */
    MMInterface.prototype.getLine = function (line) {
        var doc = this.editor.document;
        return doc.getLine(line);
    };
    
    module.exports = MMInterface;
});
