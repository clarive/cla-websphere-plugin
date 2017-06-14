
# WebSphere plugin

The Websphere plugin will allow you to manage your Websphere Application Server applications from a Clarive instance.

## Requirements

This plugin requires Webspehere to be installed and running in order for it to work properly.

To install Websphere you can go to the [IBM website](http://www.ibm.com/us-en/) and follow the instructions provided.

You must have your server and Clarive instance configured with SSH to enable the connection between them without a password being required.

## Installation

To install the plugin, move the cla-websphere-plugin folder inside the `CLARIVE_BASE/plugins`
directory in the Clarive instance.

## How to use

Once the plugin is correctly installed, you will see a new [CI](/concepts/ci) called *WebSphereServer*, and a new palette service called *Websphere task* where you will be able to configure the command that you wish to perform at Websphere.

### WebSphereServer CI:

In this CI you will be able to configure the parameters for the WebSphere server where you wish to launch your commands.
The parameters for this CI are:
- **Server** - Select the Websphere server that must be entered into a generic server CI.
- **WebSphere admin script path** - Write the path where the admin script file is located. It must be the full path to the file.
- **Connection type**  - Choose the connection type to the wsadmin.
- **Language mode** - Choose the language for the command.

Configuration example:

    Server: WebSphere-Server
    wsadmin.sh path: /opt/IBM/WebSphere/AppServer/bin/wsadmin.sh
    Connection type: SOAP 
    Language mode: jacl


### Websphere Task:

This palette service will allow you to configure different options for the command you wish to launch at the remote Websphere server.
The parameters for configuring the command are:

- **WebSphere Server** - Select the Websphere server CI you would like to connect.
- **WSAdmin option** - Choose the Wsadmin option to launch. Depending on the selected option, you will have more or fewer fields to fill out.
The options available for this parameter are:
    - Install: Installs a new application in the Websphere server.
    - Uninstall: Uninstalls an application.
    - Update: Updates an application.
    - Start application: Starts an installed application.
    - Stop application: Stops an installed application.
    - Restart application: Restarts an installed application.
    - Check running status: Checks whether an application is running or stopped.
    - View: Option to view version, modules, deployment options, etc. of the selected application. 
    - Custom command: The user can write a custom command on the selected language in the WebSphereServer CI.
- **Local file path** - This field will appear with Install and Update options. You need to set the full path to the installation file.
- **Application name** - This field will appear with Uninstall, Update, View, Start, Stop, Restart and Check running status option. You need to write the name of the application you would likes to perform the task.
- **Custom command** - This field appears with the Custom command option. You will be able to write the command for the admin script.
- **Additional options** - Add any other option needed for the wsadmin command.
- **Errors and Outputs** - These two fields are for error control on the command launch.

This palette service will return the output of the executed command.

Configuration example:

    Server: WebSphere-CI
    WSAdmin option: update
    Local file path: /appSample/installableApps/appSample.ear
    Application name: Sample application
    Additional options: -user admin
                   -password adminpwd
    Errors: fail
    Output: 
