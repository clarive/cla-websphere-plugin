(function(params) {


    var serverComboBox = Cla.ui.ciCombo({
        name: 'server',
        class: 'WebSphereServer',
        fieldLabel: _('Server'),
        value: params.data.server || '',
        allowBlank: false,
        with_vars: 1
    });

    var wsadminOptionComboBox = Cla.ui.comboBox({
        name: 'wsadminOption',
        fieldLabel: 'WSAdmin option',
        data: [
            ['install','install'],
            ['uninstall','uninstall'],
            ['Start Application','Start Application'],
            ['Stop Application','Stop Application'],
            ['Restart Application','Restart Application'],
            ['Check running status','Check running status'],
            ['view','view'],
            ['update','update'],
            ['script','Script file']
        ],
        value: params.data.wsadminOption || 'install',
        allowBlank: false,
        anchor: '100%',
        singleMode: true
    });

    var appNameTextField = Cla.ui.textField({
        fieldLabel: _('Application name'),
        name: 'appName',
        value: params.data.appName || '',
        allowBlank: true,
        hidden: !(params.data.wsadminOption == 'uninstall' || params.data.wsadminOption == 'update' || params.data.wsadminOption == 'view') || false
    });

    var localFilePathTextField = Cla.ui.textField({
        fieldLabel: _('Local file path'),
        name: 'localFilePath',
        value: params.data.localFilePath || '',
        allowBlank: true,
        hidden: !(params.data.wsadminOption == 'install' || params.data.wsadminOption == 'update') || true
    });

    var scriptPathTextField = Cla.ui.textField({
        fieldLabel: _('Script file path'),
        name: 'scriptPath',
        value: params.data.scriptPath || '',
        allowBlank: true,
        hidden: !(params.data.wsadminOption == 'script') || true
    });

    var viewOptionComboBox = Cla.ui.comboBox({
        name: 'viewOption',
        fieldLabel: 'View option',
        data: [
            ['all','all'],
            ['tasknames','tasknames'],
            ['MapModulesToServers','MapModulesToServers'],
            ['AppDeploymentOptions','AppDeploymentOptions'],
            ['buildVersion','buildVersion']
        ],
        value: params.data.viewOption || 'all',
        allowBlank: true,
        width: 400,
        singleMode: true,
        hidden: !(params.data.wsadminOption == 'view') || true
    });

    var optionsTextfield = Cla.ui.arrayGrid({
        fieldLabel: _('Additional options'),
        name: 'commandOptions',
        value: params.data.commandOptions,
        description: 'Command Options',
        default_value: '.'
    });

    wsadminOptionComboBox.on('addItem', function() {
        var v = wsadminOptionComboBox.getValue();
        if (v == 'install') {
            localFilePathTextField.show();
            scriptPathTextField.hide();
            appNameTextField.hide();
            viewOptionComboBox.hide();
            viewOptionComboBox.allowBlank = true;
            appNameTextField.allowBlank = true;
            scriptPathTextField.allowBlank = true;
            localFilePathTextField.allowBlank = false;

        } else if (v == 'update') {
            localFilePathTextField.show();
            scriptPathTextField.hide();
            appNameTextField.show();
            viewOptionComboBox.hide();
            viewOptionComboBox.allowBlank = true;
            appNameTextField.allowBlank = false;
            scriptPathTextField.allowBlank = true;
            localFilePathTextField.allowBlank = false;
        } else if (v == 'uninstall' || v == 'Start Application' || v == 'Stop Application' || v == 'Restart Application' || v == 'Check running status') {
            localFilePathTextField.hide();
            scriptPathTextField.hide();
            appNameTextField.show();
            viewOptionComboBox.hide();
            viewOptionComboBox.allowBlank = true;
            appNameTextField.allowBlank = false;
            scriptPathTextField.allowBlank = true;
            localFilePathTextField.allowBlank = true;
        } else if (v == 'view') {
            localFilePathTextField.hide();
            scriptPathTextField.hide();
            appNameTextField.show();
            viewOptionComboBox.show();
            viewOptionComboBox.allowBlank = false;
            appNameTextField.allowBlank = false;
            scriptPathTextField.allowBlank = true;
            localFilePathTextField.allowBlank = true;
        } else {
            localFilePathTextField.hide();
            scriptPathTextField.show();
            appNameTextField.hide();
            viewOptionComboBox.hide();
            viewOptionComboBox.allowBlank = true;
            appNameTextField.allowBlank = true;
            scriptPathTextField.allowBlank = false;
            localFilePathTextField.allowBlank = true;
        }
    });

    var errorBox = Cla.ui.errorManagementBox({
        errorTypeName: 'errors',
        errorTypeValue: params.data.errors || 'fail',
        rcOkName: 'rcOk',
        rcOkValue: params.data.rcOk,
        rcWarnName: 'rcWarn',
        rcWarnValue: params.data.rcWarn,
        rcErrorName: 'rcError',
        rcErrorValue: params.data.rcError,
        errorTabsValue: params.data
    });

    var panel = Cla.ui.panel({
        layout: 'form',
        items: [
            serverComboBox,
            wsadminOptionComboBox,
            appNameTextField,
            localFilePathTextField,
            scriptPathTextField,
            viewOptionComboBox,
            optionsTextfield,
            errorBox
        ]
    });

    return panel;

})