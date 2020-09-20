const { format } = require('date-fns');

module.exports = {
    displayRoles: function () {
        return [
            {
                "slug": "administrator", "title": "Administrator"
            },
            {
                "slug": "editor", "title": "Editor"
            },
            {
                "slug": "subscriber", "title": "Subscriber"
            }
        ]
    },
    formatDate: function (date, dateFormat) {
        return format(date, dateFormat)
    },
    truncate: function (str, len) {
        if (str.length > len && str.length > 0) {
            let new_str = str + ' '
            new_str = str.substr(0, len)
            new_str = str.substr(0, new_str.lastIndexOf(' '))
            new_str = new_str.length > 0 ? new_str : str.substr(0, len)
            return new_str + '...'
        }
        return str
    },

};