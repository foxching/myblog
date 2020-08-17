const express = require('express');
const router = express.Router();
const Setting = require('../models/setting')
const { displayRoles } = require('../util/helper')
const { ensureAuthenticated, ensureAdministrator } = require('../config/auth');




/* 
* GET reading settings
*/
router.get('/reading', ensureAuthenticated, ensureAdministrator, async (req, res) => {
    try {
        const setting = await Setting.findOne({})
        res.render('admin/reading_setting', { limit: setting.post_limit })
    } catch (error) {
        console.log(error)
    }
})


/* 
* POST reading settings
*/
router.post('/reading', async (req, res) => {

    try {
        await Setting.updateOne({}, { "post_limit": req.body.limit }, { upsert: true })
        res.send({ status: "success", msg: "Setting updated successfully" })
    } catch (error) {
        console.log(error)
    }
})



/* 
* GET general settings
*/
router.get('/general', ensureAuthenticated, ensureAdministrator, async (req, res) => {
    try {
        const setting = await Setting.findOne({})
        res.render('admin/general_setting', { setting: setting, roles: displayRoles(), })
    } catch (error) {
        console.log(error)
    }
})

/* 
* POST general settings
*/
router.post('/general', async (req, res) => {
    try {
        await Setting.updateOne({},
            { "blogTitle": req.body.blogTitle, "defaultRole": req.body.defaultRole, "dateFormat": req.body.dateFormat, "timeFormat": req.body.timeFormat }, { upsert: true })
        const setting = await Setting.findOne({})
        req.app.locals.setting = setting;
        res.send({ status: "success", msg: "Setting updated successfully" })
    } catch (error) {
        console.log(error)
    }
})



module.exports = router