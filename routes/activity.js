var express = require('express');
const { rets } = require('../models/editor');
var router = express.Router();
const fs = require('fs')
var op = require('../models/editor');
// var zp = require('../models/zip');
let cpath = './data/courses.json';
let spath = './data/students.json';
// let tcpath = './data/coursestest.json';
let tspath = './data/studentstest.json';

let logpath = './data/log.log'

let p = op.ptr;

// var op = require('../models/editor');
// var zp = require('../models/zip');

router.post('/', function (req, res, next) {
    console.log(req.body.sid);
    let id = req.body.sid
    if (id == 666) {
        let acts = [];
        for (let i = 0; i < p.students.length; i++) {
            for (let j = 0; j < p.students[i].activities.length; j++) {
                acts.push(p.students[i].activities[j])
            }
        }
        res.send(acts).status(200);
        return;
    }
    let stu = rets(p, id)
    res.send(stu.activities).status(200);
});

router.post('/add', function (req, res, next) {
    // console.log(req.body);
    let act = req.body;
    let flag; 
    console.log(act)
    flag=op.addact(act, act.personal);
    stu = rets(p, act.personal);
    op.svs(p, spath)
    fs.appendFileSync(logpath,new Date().toLocaleString()+" "+ stu.id + " 添加活动 "  + act.name + "\n")
    res.send({ able: flag, act: stu.activities }).status(200);
});
router.post('/remove', function (req, res, next) {
    let sid=req.body.sid;
    let aid=req.body.aid;
    let stu=rets(p,sid);
    fs.appendFileSync(logpath,new Date().toLocaleString()+" "+ sid + " 删除活动 " + aid + " " + stu.activities[aid].name + "\n")
    
    console.log(sid,aid);
    op.delact(p,sid,aid);
    
    // let stu = rets(p, );
    // stu.activities[]
    // op.svs(p, tspath)
    op.svs(p, spath)
    res.send(stu.activities ).status(200);
});

module.exports = router;
