(function(params) {


    var serverComboBox = Cla.ui.ciCombo({
        name: 'server',
        role: 'Server',
        fieldLabel: _('Server'),
        value: params.rec.server || '',
        allowBlank: false,
    });

    var wsadminPathTextField = Cla.ui.textField({
        fieldLabel: _('WebSphere admin script path'),
        name: 'wsadminPath',
        value: params.rec.wsadminPath || '',
        allowBlank: false
    });

    var connectionTypeComboBox = Cla.ui.comboBox({
        name: 'connectionType',
        fieldLabel: _('Connection Type'),
        data: [
            ['none',_('none')],
            ['SOAP',_('SOAP')],
            ['RMI',_('RMI')],
            ['JSR160RMI',_('JSR160RMI')],
            ['IPC',_('IPC')]
        ],
        value: params.rec.connectionType || 'none',
        allowBlank: false,
        anchor: '100%',
        singleMode: true
    });

    var langComboBox = Cla.ui.comboBox({
        name: 'langType',
        fieldLabel: _('Language mode'),
        data: [
            ['jacl',_('jacl')],
            ['jython',_('jython')]
        ],
        value: params.rec.langType || 'jacl',
        allowBlank: false,
        anchor: '100%',
        singleMode: true
    });




    return [
        serverComboBox,
        wsadminPathTextField,
        connectionTypeComboBox,
        langComboBox,

    ];

})