const express = require('express')
const app = express()

app.use('/static', express.static(__dirname + '/static'))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('Hello')
})

app.get('/admin/dashboard', (req, res) => {
    res.render('admin/dashboard')
})


app.listen(3000, () => {
    console.log('Server is running at port')
})