/*
    Handles all interaction with MavensMate 'mm' CLI
*/

(function () {
    "use strict";
    
    var process = require('child_process'),
        domainManager = null,
        childproc = null,
        startDate = null;
    
    function runScript(command, jsonPayloadObj, processId, options) {
        console.log('------> RUNNING SCRIPT!!');
        console.log(command)
        console.log(jsonPayloadObj)
        console.log(processId)
        console.log(options)

        startDate = new Date();

        if (jsonPayloadObj !== null) {
            var jsonPayload = " <<< '"+JSON.stringify(jsonPayloadObj)+"'";
            command = command + jsonPayload; 
            console.log("command after: "+command) 
        }
                
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
            console.log('---> REGISTERING mmexec DOMAIN!!');
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
    exports.runScript = runScript;
}());