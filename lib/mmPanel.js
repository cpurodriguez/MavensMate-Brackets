/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";

    var NodeConnection      = brackets.getModule("utils/NodeConnection"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        Utils               = require('lib/Utils'),
        PanelManager        = brackets.getModule("view/PanelManager"),
        CodeInspection      = brackets.getModule("language/CodeInspection"),
        ProjectManager      = brackets.getModule("project/ProjectManager");

    var $panelHtml           = require("text!templates/bottom-panel.html");
    var bottomBracketPanel;

    function create() {
        var rowHtml = Mustache.render($panelHtml);
        bottomBracketPanel = PanelManager.createBottomPanel('mavens.mavensmate.panel', $(rowHtml), 100);
    }

    function show() {
        bottomBracketPanel.show();
    };

    function hide() {
        bottomBracketPanel.hide();
    };

    exports.create  = create;
    exports.show    = show;
    exports.hide    = hide;
});
