var reg = require('cla/reg');

reg.register('service.websphere.command', {
    name: _('Websphere Task'),
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
        if (!wasCi) {
            log.fatal(_("Server CI doesn't exist"));
        }
        var server = wasCi.server;
        if (!server) {
            log.fatal(_("Generic server CI doesn't exist"));
        }
        var wsadminPath = wasCi.wsadminPath || "";
        var connectionType = wasCi.connectionType || "none";
        var langType = wasCi.langType || "jacl";
        var wsadminOption = params.wsadminOption || "view";
        var viewOption = params.viewOption || "all";
        var localFilePath = params.localFilePath || "";
        var appName = params.appName || "";
        var scriptPath = params.scriptPath || "";
        var commandOptions = params.commandOptions || [];
        var errors = params.errors || "fail";

        function remoteCommand(params, command, server, errors) {
            var launch = reg.launch('service.scripting.remote', {
                name: _('Websphere Task'),
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
            wsadmin = ' -c "' + "print AdminControl.invoke(AdminControl.queryNames('type=ApplicationManager,*'), 'stopApplication', '\\\"" +
                appName + '\\"\')"';
        } else if (wsadminOption == "Start Application") {
            langType = "jython";
            errors = "silent";
            wsadmin = ' -c "' + "print AdminControl.invoke(AdminControl.queryNames('type=ApplicationManager,*'), 'startApplication', '\\\"" +
                appName + '\\"\')"';
        } else if (wsadminOption == "Check running status") {
            langType = "jython";
            wsadmin = ' -c "' + "print AdminControl.completeObjectName('type=Application,name='\\\"" + appName + '\\"\',*\')\"';
        } else if (wsadminOption == "script") {
            wsadmin = ' -f ' + scriptPath;
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
                log.fatal(_("No option for view selected"));
            }
        } else if (wsadminOption == "Restart Application") {
            langType = "jython";
            errors = "silent";
            wsadmin = ' -c "' + "print AdminControl.invoke(AdminControl.queryNames('type=ApplicationManager,*'), 'stopApplication', '\\\"" +
                appName + '\\"\')"';
            fullCommand = wsadminPath + " -conntype " + connectionType + " -lang " + langType + " " + options + wsadmin;
            commandLaunch = remoteCommand(params, fullCommand, server, errors);
            wsadmin = ' -c "' + "print AdminControl.invoke(AdminControl.queryNames('type=ApplicationManager,*'), 'startApplication', '\\\"" +
                appName + '\\"\')"';
            fullCommand = wsadminPath + " -conntype " + connectionType + " -lang " + langType + " " + options + wsadmin;
            commandLaunch = remoteCommand(params, fullCommand, server, errors);
            response = commandLaunch.output;
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/ already started/);
                if (parsedResponse != null) {
                    log.warn(_("Warning ") + parsedResponse, response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal(_("Restart application failed "), response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn(_("Restart application failed "), response);
                    } else {
                        log.error(_("Restart application failed "), response);
                    }
                }
            } else {
                log.info(_("Done, application ") + appName + _(" restarted"), response);
            }
            return response;
        } else {
            log.fatal(_("No option selected"));
        }

        fullCommand = wsadminPath + " -conntype " + connectionType + " -lang " + langType + " " + options + wsadmin;
        commandLaunch = remoteCommand(params, fullCommand, server, errors);
        response = commandLaunch.output;

        if (wsadminOption == "install") {
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/An application with name ".*" already exists. Select a different name./);
                if (parsedResponse != null) {
                    log.warn(_("Warning ") + parsedResponse, response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal(_("Installation failed "), response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn(_("Installation failed "), response);
                    } else {
                        log.error(_("Installation failed "), response);
                    }
                }
            } else {
                doneMessage = response.match(/Application.*installed successfully./);
                log.info(_("Done ") + doneMessage, response);
            }
        } else if (wsadminOption == "uninstall") {
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/An application with name ".*" does not exist./);
                if (parsedResponse != null) {
                    log.warn(_("Warning ") + parsedResponse, response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal(_("Uninstallation failed "), response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn(_("Uninstallation failed "), response);
                    } else {
                        log.error(_("Uninstallation failed "), response);
                    }
                }
            } else {
                doneMessage = response.match(/Application.*uninstalled successfully./);
                log.info(_("Done ") + doneMessage, response);
            }
        } else if (wsadminOption == "Start Application") {
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/ already started/);
                if (parsedResponse != null) {
                    log.warn(_("Warning, application ") + appName + _(" already started"), response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal(_("Start application failed "), response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn(_("Start application failed "), response);
                    } else {
                        log.error(_("Start application failed "), response);
                    }
                }
            } else {
                log.info(_("Done, application ") + appName + _(" started"), response);
            }
        } else if (wsadminOption == "Stop Application") {
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/Application.*not started/);
                if (parsedResponse != null) {
                    log.warn(_("Warning ") + parsedResponse, response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal(_("Stop application failed "), response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn(_("Stop application failed "), response);
                    } else {
                        log.error(_("Stop application failed "), response);
                    }
                }
            } else {
                log.info(_("Done, application ") + appName + _(" stopped"), response);
            }
        } else if (wsadminOption == "Check running status") {

            parsedResponse = response.indexOf("WebSphere:name=" + appName);
            if (parsedResponse > 0) {
                log.info(_("Application ") + appName + _(" is running"), response);
            } else {
                log.info(_("Application ") + appName + _(" is stopped"), response);
            }
        }
        return response;
    }
});