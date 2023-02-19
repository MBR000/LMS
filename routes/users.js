var express = require('express');
var router = express.Router();
var fs = require('fs')


var op = require('../models/editor');
// var zp = require('../models/zip');
let cpath = './data/courses.json';
let spath = './data/students.json';
// let tcpath = './data/coursestest.json';

let logpath = './data/log.log';

let p = op.ptr;


let adminpassword = "admin"
// op.readc(p, cpath);
// op.reads(p, spath);


/* GET users listing. */
router.post('/login', function (req, res, next) {
  console.log(req.body);
  if (req.body.userid === "admin" && req.body.password === "admin") {
    fs.appendFileSync(logpath,new Date().toLocaleString()+" "+  "admin 登录成功\n");
    res.send({ status: 1, id: 666, uname: "administrator" }).status(200);
    return;
  }
  let id = parseInt(req.body.userid);
  let password = req.body.password;
  let stu = op.rets(p, id);
  if (stu != 0 && stu.password === password) {
    fs.appendFileSync(logpath,new Date().toLocaleString()+" "+id + " 登录成功\n")
    res.send({ status: 1, id: id, uname: stu.name }).status(200);
  }
  else
    res.send({ status: 0 }).status(503);
});
router.post('/edit', function (req, res, next) {
  console.log(req.body);
  if (req.body.userid === "admin" && req.body.password === adminpassword) {
    adminpassword = req.body.newpassword
    // res.send({ status: 1, id: 666 ,uname:"administrator"}).status(200);
    res.send(1).status(200);

    return;
  }
  let id = parseInt(req.body.userid);
  let password = req.body.password;
  let stu = op.rets(p, id);
  if (stu != 0 && stu.password === password) {
    stu.password = req.body.newpassword;
    fs.appendFileSync(logpath,new Date().toLocaleString()+" "+stu.id + " 修改密码 " + password + " 为 "+ req.body.newpassword +"\n")
    res.send({ status: 1, id: id, uname: stu.name }).status(200);
  }
  else
    res.send({ status: 0 }).status(503);
});
router.post('/map', function (req, res, next) {
  // console.log(req.body)
  fs.appendFileSync(logpath,new Date().toLocaleString()+" "+ req.body.sid + " 使用导航 从 " + req.body.source.id+" "+req.body.source.name + " 到 " + req.body.dest.id+" "+req.body.dest.name + "\n")
  // console.log(a);
  res.send("ok").status(200);
});

module.exports = router;
