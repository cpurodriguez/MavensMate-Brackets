(function () {
    "use strict";
    var process = require('child_process'),
        domainManager = null,
        childproc = null,
        startDate = null;
    
    function runScript(command, jsonPayload, processId, options) {
        
        startDate = new Date();

        //var jsonPayload = ' <<< \'{"project_name": "rctest1", "files": ["/Users/josephferraro/Development/st/rctest1/src/classes/AUTOTEST.cls"], "workspace": "/Users/josephferraro/Development/st"}\'';
        var jsonPayload = " <<< '"+JSON.stringify(jsonPayload)+"'";
        var command = command + jsonPayload;
        
        console.log(command)
        console.log(payload)
        console.log(options)

        try {
            childproc = process.exec(command, options,
                function (err, stdout, stderr) {
                    var resultobj = {
                        'processId' : processId,
                        'error' : err,
                        'stdout' : stdout,
                        'stderr' : stderr,
                        'command' : command,
                        'cwd': options.cwd,
                        'title' : command,
                        'exitcode' : childproc.exitCode,
                        'time' : (new Date() - startDate) / 1000
                    };
                                    
                    var resultstr = JSON.stringify(resultobj);
                    
                    domainManager.emitEvent("mmexec", "update", resultstr);
                }); 
        } catch(e) {
            console.log(e)
        }
    }

    function init(DomainManager) {
        domainManager = DomainManager;
        
        if (!domainManager.hasDomain("mmexec")) {
            domainManager.registerDomain("mmexec", { major: 0, minor: 1 });
        }

        domainManager.registerCommand(
            "mmexec",
            "runScript",
            runScript,
            false,
            "Runs mmexec test on a file",
            ["command", "jsonPayload", "options"],
            []
        );
        domainManager.registerEvent(
            "mmexec",
            "update",
            ["data"]
        );
    }

    exports.init = init;
}());