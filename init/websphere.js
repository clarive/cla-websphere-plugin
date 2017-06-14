var reg = require('cla/reg');

reg.register('service.websphere.command', {
    name: 'Websphere Task',
    icon: '/plugin/cla-websphere-plugin/icon/websphere.svg',
    form: '/plugin/cla-websphere-plugin/form/websphere-form.js',

    handler: function(ctx, params) {

        var ci = require("cla/ci");
        var reg = require("cla/reg");
        var log = require("cla/log")
 
        var serverCi = params.server || "";
        var wasCi = ci.findOne({
            mid: serverCi + ''
        });
        if (!wasCi){
            log.fatal("Server CI doesn't exist");
        }
        var server = wasCi.server;
        if (!server){
            log.fatal("Generic server CI doesn't exist");
        }
        var wsadminPath = wasCi.wsadminPath || "";
        var connectionType = wasCi.connectionType || "none";
        var langType = wasCi.langType || "jacl";
        var wsadminOption = params.wsadminOption || "view";
        var viewOption = params.viewOption || "all";
        var localFilePath = params.localFilePath || "";
        var appName = params.appName || "";
        var customCommand = params.customCommand || "";
        var commandOptions = params.commandOptions || [];
        var errors = params.errors || "fail";

        function remoteCommand(params, command, server, errors) {
            var launch = reg.launch('service.scripting.remote', {
                name: 'Websphere Task',
                config: {
                    errors: errors,
                    server: server,
                    path: command,
                    output_error: params.output_error,
                    output_warn: params.output_warn,
                    output_capture: params.output_capture,
                    output_ok: params.output_ok,
                    meta: params.meta,
                    rc_ok: params.rcOk,
                    rc_error: params.rcError,
                    rc_warn: params.rcWarn
                }
            });
            return launch;
        }

        var options = "";
        commandOptions.forEach(function(element) {
            options += " " + element;
        });

        var wsadmin = "";
        var fullCommand = "";
        var commandLaunch,
            response,
            parsedResponse,
            doneMessage;
            
        if (wsadminOption == "install") {
            langType = "jython";
            errors = "silent";
            wsadmin = ' -c "print AdminApp.install(\\"' + localFilePath + '\\")"';
        } else if (wsadminOption == "uninstall") {
            langType = "jython";
            errors = "silent";
            wsadmin = ' -c "print AdminApp.uninstall(\\"' + appName + '\\")"';
        } else if (wsadminOption == "update") {
            langType = "jython";
            wsadmin = ' -c "print AdminApp.update(\'' + appName + '\',\'app\',\'[-operation update -contents ' + localFilePath + ']\')"';
        } else if (wsadminOption == "Stop Application") {
            langType = "jython";
            errors = "silent";
            wsadmin = ' -c "' + "print AdminControl.invoke(AdminControl.queryNames('type=ApplicationManager,*'), 'stopApplication', '\\\"" 
                    + appName + '\\"\')"';
        } else if (wsadminOption == "Start Application") {
            langType = "jython";
            errors = "silent";
            wsadmin = ' -c "' + "print AdminControl.invoke(AdminControl.queryNames('type=ApplicationManager,*'), 'startApplication', '\\\"" 
                    + appName + '\\"\')"';
        } else if (wsadminOption == "Check running status") {
            langType = "jython";
            wsadmin = ' -c "' + "print AdminControl.completeObjectName('type=Application,name='\\\"" + appName + '\\"\',*\')\"';
        } else if (wsadminOption == "custom command") {
            var cFlag = ((langType == "jython") ? (' -c "' + customCommand + '"') : (" -c '" + customCommand + "'"));
            wsadmin = cFlag;
        } else if (wsadminOption == "view") {
            langType = "jython";
            if (viewOption == "all") {
                wsadmin = ' -c "print AdminApp.view(\\"' + appName + '\\")"';
            } else if (viewOption == "tasknames") {
                wsadmin = ' -c "print AdminApp.view(\\"' + appName + '\\",[\\"-tasknames\\"])"';
            } else if (viewOption == "MapModulesToServers") {
                wsadmin = ' -c "print AdminApp.view(\\"' + appName + '\\",[\\"-MapModulesToServers\\"])"';
            } else if (viewOption == "AppDeploymentOptions") {
                wsadmin = ' -c "print AdminApp.view(\\"' + appName + '\\",[\\"-AppDeploymentOptions\\"])"';
            } else if (viewOption == "buildVersion") {
                wsadmin = ' -c "print AdminApp.view(\\"' + appName + '\\",[\\"-buildVersion\\"])"';
            } else {
                log.fatal("No option for view selected");
            }
        } else if (wsadminOption == "Restart Application") {
            langType = "jython";
            errors = "silent";
            wsadmin = ' -c "' + "print AdminControl.invoke(AdminControl.queryNames('type=ApplicationManager,*'), 'stopApplication', '\\\"" 
                    + appName + '\\"\')"';
            fullCommand = wsadminPath + " -conntype " + connectionType + " -lang " + langType + " " + options + wsadmin;
            commandLaunch = remoteCommand(params, fullCommand, server, errors);
            wsadmin = ' -c "' + "print AdminControl.invoke(AdminControl.queryNames('type=ApplicationManager,*'), 'startApplication', '\\\"" 
                    + appName + '\\"\')"';
            fullCommand = wsadminPath + " -conntype " + connectionType + " -lang " + langType + " " + options + wsadmin;
            commandLaunch = remoteCommand(params, fullCommand, server, errors);
            response = commandLaunch.output;
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/ already started/);
                if (parsedResponse != null) {
                    log.warn("Warning " + parsedResponse, response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal("Restart application failed ", response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn("Restart application failed ", response);
                    } else {
                        log.error("Restart application failed ", response);
                    }
                }
            } else {
                log.info("Done, application " + appName + " restarted", response);
            }
            return response;
        } else {
            log.fatal("No option selected");
        }
        fullCommand = wsadminPath + " -conntype " + connectionType + " -lang " + langType + " " + options + wsadmin;
        commandLaunch = remoteCommand(params, fullCommand, server, errors);
        response = commandLaunch.output;

        if (wsadminOption == "install") {
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/An application with name ".*" already exists. Select a different name./);
                if (parsedResponse != null) {
                    log.warn("Warning " + parsedResponse, response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal("Installation failed ", response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn("Installation failed ", response);
                    } else {
                        log.error("Installation failed ", response);
                    }
                }
            } else {
                doneMessage = response.match(/Application.*installed successfully./);
                log.info("Done " + doneMessage, response);
            }
        } else if (wsadminOption == "uninstall") {
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/An application with name ".*" does not exist./);
                if (parsedResponse != null) {
                    log.warn("Warning " + parsedResponse, response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal("Uninstallation failed ", response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn("Uninstallation failed ", response);
                    } else {
                        log.error("Uninstallation failed ", response);
                    }
                }
            } else {
                doneMessage = response.match(/Application.*uninstalled successfully./);
                log.info("Done " + doneMessage, response);
            }
        } else if (wsadminOption == "Start Application") {
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/ already started/);
                if (parsedResponse != null) {
                    log.warn("Warning, application " + appName + " already started", response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal("Start application failed ", response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn("Start application failed ", response);
                    } else {
                        log.error("Start application failed ", response);
                    }
                }
            } else {
                log.info("Done, application " + appName + " started", response);
            }
        } else if (wsadminOption == "Stop Application") {
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/Application.*not started/);
                if (parsedResponse != null) {
                    log.warn("Warning " + parsedResponse, response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal("Stop application failed ", response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn("Stop application failed ", response);
                    } else {
                        log.error("Stop application failed ", response);
                    }
                }
            } else {
                log.info("Done, application " + appName + " stopped", response);
            }
        } else if (wsadminOption == "Check running status") {

            parsedResponse = response.indexOf("WebSphere:name=" + appName);
            if (parsedResponse > 0) {
                log.info("Application " + appName + " is running", response);
            } else {
                log.info("Application " + appName + " is stopped", response);
            }
        }
        return response;
    }
});