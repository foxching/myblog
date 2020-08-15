bs4pop.confirm('Are you sure do want to delete this post?', function (sure) { }, {
    title: 'Confirm Dialog',
    hideRemove: true,
    btns: [
        {
            label: 'ok',
            onClick() {

            }
        },
        {
            label: 'cancel',
            className: 'btn-secondary',
            onClick(e) {
                return e.preventDefault();
            }
        }
    ]


})