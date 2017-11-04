# WebSphere plugin

<img src="https://cdn.rawgit.com/clarive/cla-websphere-plugin/master/public/icon/websphere.svg?sanitize=true" alt="WebSphere Plugin" title="WebSphere Plugin" width="120" height="120">

The Websphere plugin will allow you to manage your Websphere Application Server applications from a Clarive instance.

## Requirements

This plugin requires Webspehere to be installed and running in order for it to work properly.

To install Websphere you can go to the [IBM website](http://www.ibm.com/us-en/) and follow the instructions provided.

You must have your server and Clarive instance configured with SSH to enable the connection between them without a password being required.

## Installation

To install the plugin, move the cla-websphere-plugin folder inside the `$CLARIVE_BASE/plugins`
directory in the Clarive instance.

### WebSphereServer Resource

To configurate the Openshift Server Resource open:

In **Clarive SE**: Resources -> ClariveSE.

In **Clarive EE**: Resources -> WebSphere.

In this Resource you will be able to configure the parameters for the WebSphere server where you wish to launch your commands.
The parameters for this Resource are:

- **Server** - Select the Websphere server that must be entered into a generic server Resource.
- **WebSphere admin script path** - Write the path where the admin script file is located. It must be the full path to the file.
- **Connection type**  - Choose the connection type to the wsadmin.
- **Language mode** - Choose the language for the command.

Configuration example:

    Server: WebSphere-Server
    wsadmin.sh path: /opt/IBM/WebSphere/AppServer/bin/wsadmin.sh
    Connection type: SOAP 
    Language mode: jacl

### Websphere Task

The various parameters are:

- **WebSphere Server (variable name: server)** - Select the Websphere server Resource you would like to connect.
- **WSAdmin option (wsadmin_option)** - Choose the Wsadmin option to launch. Depending on the selected option, you will have more or fewer fields to fill out.
The options available for this parameter are:
    - Install ("install"): Installs a new application in the Websphere server.
    - Uninstall ("uninstall"): Uninstalls an application.
    - Update ("update"): Updates an application.
    - Start application ("Start Application"): Starts an installed application.
    - Stop application ("'Stop Application"): Stops an installed application.
    - Restart application ("Restart Application"): Restarts an installed application.
    - Check running status ("Check running status"): Checks whether an application is running or stopped.
    - View ("view"): Option to view version, modules, deployment options, etc. of the selected application. 
    - Script file ("script"): Write the path where the script file is located in the server.
- **Local file path (local_file_path)** - This field will appear with Install and Update options. You need to set the full path to the installation file.
- **Application name (app_name)** - This field will appear with Uninstall, Update, View, Start, Stop, Restart and Check running status option. You need to write the name of the application you would likes to perform the task.
- **Script file path (script_path)** - This field appears with the Script file option. You will be able to write the full path for the script.
- **Additional options (command_options)** - Add any other option needed for the wsadmin command.
- **View option (view_option)** - This field will appear with View option. You will see different options to choose:
    - all ("all"): Shows all the information about the application.
    - tasknames ("tasknames"): Shows the tasknames for the application.
    - MapModulesToServers ("MapModulesToServers"): Shows the map modules for the application.
    - AppDeploymentOptions ("AppDeploymentOptions"): Shows deployment options for the application.
    - buildVersion ("buildVersion"): Shows build version for the application.

**Only Clarive EE**

- **Errors and Output** - These two fields concern management of control errors. Their options are:
   - **Fail and Output Error** - Search for the configured error pattern in script output. If found, an error message is
     displayed in the monitor showing the match.
   - **Warn and Output Warn** - Search for the configured warning pattern in the script output. If found, an error
     message is displayed in the monitor showing the match.
   - **Custom** - Where combo errors is set to custom, a new form is displayed for defining using the following fields:
      - **OK** - Range of return code values for the script to have succeeded. No message will be displayed in the
        monitor.
      - **Warn** - Range of return code values to warn the user. A warning message will be displayed in the monitor.
      - **Error** - Range of return code values for the script to have failed. An error message will be displayed in the
        monitor.
   - **Silent** - Silence all errors found.

## How to use

### In Clarive EE

Once the plugin is placed in its folder, you can find this service in the palette in the section of generic service and can be used like any other palette op.

Op Name: **Websphere Task**

Example:

```yaml
    Server: WebSphere-Resource
    WSAdmin option: update
    Local file path: /path/to/appSample.ear
    Application name: Sample application
    Additional options: -user admin
                   -password adminpwd
``` 

### In Clarive SE

#### Rulebook

If you want to use the plugin through the Rulebook, in any `do` block, use this ops as examples to configure the different parameters:

```yaml
rule: WebSphere demo
do:
   - websphere_control:
       server: 'websphere_resource'    # Required. Use the mid set to the resource you created
       wsadmin_option: 'update'        # Required.
       local_file_path:  '/path/to/appSample.ear'  
       app_name: 'Sample application'
       command_options: ['-user admin', '-password adminpwd']
```

##### Outputs

###### Success

The service will return the console output for the command.

###### Possible configuration failures

**Task failed**

You will get the error output from the console.

**Variable required**

```yaml
Error in rulebook (compile): Required argument(s) missing for op "websphere_control": "command"
```

Make sure you have all required variables defined.

**Not allowed variable**

```yaml
Error in rulebook (compile): Argument `Command` not available for op "websphere_control"
```

Make sure you are using the correct paramaters (make sure you are writing the variable names correctly).

## More questions?

Feel free to join **[Clarive Community](https://community.clarive.com/)** to resolve any of your doubts.