/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";

    var NodeConnection      = brackets.getModule("utils/NodeConnection"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        Utils               = require('lib/Utils'),
        MMPanel             = require('lib/mmPanel'),
        FileUtils           = brackets.getModule("file/FileUtils"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem"),
        CodeInspection      = brackets.getModule("language/CodeInspection"),
        ProjectManager      = brackets.getModule("project/ProjectManager");

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
        FileUtils.readAsText()

        this.nodeConnection = new NodeConnection();
        this.activePanelProcessIds = [];
    }

    MMInterface.prototype.handleResponse = function(domain, response) {
        Utils.debug(domain)
        Utils.debug(response)
        var command = JSON.parse(response); // parsing json from node js
    
        if (command.stderr || command.stdout) { // if compressing process fail
            var type = CodeInspection.Type.ERROR;
            Utils.debug(command.stderr || command.stdout)
            // var dialog = Dialogs.showModalDialog(
            //     Dialogs.DIALOG_ID_ERROR,
            //     StringUtils.format('building title', 'foo'),
            //     StringUtils.format('error title', command.stderr || command.stdout)
            // );
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

                        //codeMirror.addLineClass(jslintError.startPosition.line, "wrap", "cc-JSLint-stop-line");
                        // and add a marker at the point where it stopped in the line itself
                        //newErrorHighlight = codeMirror.markText({line: jslintError.startPosition.line, ch: 0}, jslintError.startPosition, markOptionsForStoppedMarkerRight);
                        errorHighlights.push(newErrorHighlight);
                        //newErrorHighlight = codeMirror.markText(jslintError.startPosition, {line: jslintError.startPosition.line, ch: jslintError.startPosition.ch + 1}, markOptionsForStoppedMarkerLeft);
                        errorHighlights.push(newErrorHighlight);

                    }
                } else {
                    MMPanel.hide()
                }
            }
            
            $("#"+pId).find(".progressCell").append(message);


        } else {
            //BAD
        }
        
        ProjectManager.refreshFileTree(); // refresh file tree to see new file
    }


    MMInterface.prototype.call = function (params) {
        var operation = params.operation;
        var jsonPayload = params.payload;
        var pId = params.pId;
        this.activePanelProcessIds.push(pId)

        var command = '/Users/josephferraro/Development/joey2/bin/python /Users/josephferraro/Development/Github/mm/mm.py -c BRACKETS -o '+operation;
        this.nodeConnection.domains.mmexec.runScript(command, jsonPayload, pId, {
            cwd: Utils.getExtensionPath()
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
