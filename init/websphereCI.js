var ci = require("cla/ci");

ci.createRole("WebSphere");

ci.createClass("WebSphereServer", {
    form: '/plugin/cla-websphere-plugin/form/websphereCI-form.js',
    icon: '/plugin/cla-websphere-plugin/icon/websphere.svg',
    roles: ["WebSphere"],
    has: {
        server: {
            is: "rw",
            isa: "ArrayRef",
            required: true
        },
        wsadminPath: {
            is: "rw",
            isa: "Str",
            required: true
        },
        connectionType: {
            is: "rw",
            isa: "Str",
            required: true
        },
        langType: {
            is: "rw",
            isa: "Str",
            required: true
        }
    }

});