(function(params) {


    var serverComboBox = Cla.ui.ciCombo({
        name: 'server',
        class: 'generic_server',
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
        fieldLabel: 'Connection Type',
        data: [
            ['none','none'],
            ['SOAP','SOAP'],
            ['RMI','RMI'],
            ['JSR160RMI','JSR160RMI'],
            ['IPC','IPC']
        ],
        value: params.rec.connectionType || 'none',
        allowBlank: false,
        anchor: '100%',
        singleMode: true
    });

    var langComboBox = Cla.ui.comboBox({
        name: 'langType',
        fieldLabel: 'Language mode',
        data: [
            ['jacl','jacl'],
            ['jython','jython']
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