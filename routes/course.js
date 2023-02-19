var express = require('express');
var router = express.Router();
var multer = require('multer')
const zp = require('../models/zip');
const path = require('node:path');
const fs = require('fs');


var op = require('../models/editor');
const { extname } = require('node:path');
// var zp = require('../models/zip');
let cpath = './data/courses.json';
let spath = './data/students.json';
// let tcpath = './data/coursestest.json';
// let tspath = './data/teststudents.json'
let npath = './data/index.json';

let logpath = './data/log.log'


let p = op.ptr;

let tmpname;
// op.readc(p, cpath);
// op.reads(p, spath);
let homestorage = multer.diskStorage({
    // 用来配置文件上传的位置
    destination: (req, file, cb) => {
        // 调用 cb 即可实现上传位置的配置
        cb(null, './data/work/' + req.params.id)

    },
    // 用来配置上传文件的名称（包含后缀）
    filename: (req, file, cb) => {
        //filename 用于确定文件夹中的文件名的确定。 如果没有设置 filename，每个文件将设置为一个随机文件名，并且是没有扩展名的。
        // 获取文件的后缀
        // 拼凑文件名
        cb(null, req.params.sid + path.extname(file.originalname))
        tmpname = req.params.sid + path.extname(file.originalname)

    }
})
let resource = multer.diskStorage({
    // 用来配置文件上传的位置
    destination: (req, file, cb) => {
        // 调用 cb 即可实现上传位置的配置
        cb(null, './data/resources/' + req.params.id)
    },
    // 用来配置上传文件的名称（包含后缀）
    filename: (req, file, cb) => {
        //filename 用于确定文件夹中的文件名的确定。 如果没有设置 filename，每个文件将设置为一个随机文件名，并且是没有扩展名的。
        // 获取文件的后缀
        // 拼凑文件名
        cb(null, "resource" + path.extname(file.originalname))
        tmpname = "resource" + path.extname(file.originalname)

    }
})

let uploadwork = multer({ storage: homestorage })
let newload = multer({ storage: resource })


router.post('/', function (req, res, next) {
    console.log(req.body);
    if (req.body.sid === 666) {
        res.send({
            stu: 666,
            courses: p.courses
        }).status(200);
        return;
    }
    let stu = op.rets(p, req.body.sid)

    let stuc = [];
    for (let i = 0; i < stu.courses.length; i++) {
        stuc.push(p.courses[stu.courses[i][0]])//XXXXXXXXXXXXXXX
    }
    // console.log(stuc);
    res.send({
        stu: stu,
        courses: stuc
    }).status(200);
});
router.post('/view', function (req, res, next) {
    console.log(req.body)
    let course = op.searchcbyid(p, req.body.cid)
    let sid = parseInt(req.body.sid)
    if (sid != 666) {
        let stu = op.rets(p, sid);
        stu.courses.forEach(element => {
            if (element[0] == parseInt(req.body.cid)) {
                element[1] = 1;
            }
        });
    }
    fs.appendFileSync(logpath, new Date().toLocaleString() + " " + req.body.sid + " 查看课程 " + course.id + " " + course.name + "\n")
    // console.log(a);
    res.send(course).status(200);
});
router.post('/search', function (req, res, next) {
    // console.log(req.body)
    console.log(p.arr)
    let mode = req.body.mode;
    let sid = req.body.sid;
    let word = req.body.word;
    let courses;
    if (mode == 1) {
        courses = op.searchcbyname(p, word);
        console.log(courses)
        if (sid == 666) {
            fs.appendFileSync(logpath, new Date().toLocaleString() + " " + "admin" + " 精确搜索课程 " + word + "\n")

            res.send({ courses: courses }).status(200);
            return;
        }
        else {
            let stu = op.rets(p, sid)
            fs.appendFileSync(logpath, new Date().toLocaleString() + " " + sid + " 精确搜索课程 " + word + "\n")
            courses = courses.filter((item) => item.classes == stu.classes);
            res.send({ courses: courses }).status(200);
            return;
        }
    }
    if (mode == 2) {
        courses = op.searchexp(p, word);

        if (sid == 666) {
            fs.appendFileSync(logpath, new Date().toLocaleString() + " " + "admin" + " 模糊搜索 课程 " + word + "\n")
            res.send({ courses: courses }).status(200);
            return;
        }
        else {
            let stu = op.rets(p, sid)
            fs.appendFileSync(logpath, new Date().toLocaleString() + " " + sid + " 模糊搜索 课程 " + word + "\n")
            courses = courses.filter((item) => item.classes == stu.classes);

            res.send({ courses: courses }).status(200);
            return;
        }
    }

    // console.log(a);
    // res.send("1").status(200);
});
router.post('/edit', function (req, res, next) {
    console.log(req.body)
    if (req.body.sid != 666)
        res.send("0").status(503);
    else {
        let course = req.body.course;
        fs.appendFileSync(logpath, new Date().toLocaleString() + " " + "admin" + " 修改课程信息 " + course.id + " " + course.name + "\n")
        op.adjc(course.id, p, course, req.body.work)
        op.svc(p, cpath, npath)
        op.svs(p, spath)
        // console.log(a);
        res.send("1").status(200);
    }
});
router.post('/add', function (req, res, next) {
    // console.log(req.body)
    if (req.body.sid != 666) {
        res.send("0").status(503);
        return;
    }
    else {
        let bd = req.body;
        bd.course.classes = parseInt(bd.course.classes)
        for (let i = 0; i < 7; i++) {
            if (bd.course.week[i] === false) {
                bd.course.time[i] = [];
            }
        };
        console.log(bd);
        let course = bd.course;
        let id = op.addc(p, course.name, course.classes, course.week, course.time, course.place, course.teacher, course.info);
        fs.appendFileSync(logpath, new Date().toLocaleString() + " " + "admin" + " 添加课程 " + course.id + " " + course.name + "\n")
        op.storeindex(p)
        console.log(1)
        op.svc(p, cpath, npath);
        console.log(2)
        op.svs(p, spath)
        console.log(3)
        if (!fs.existsSync("./data/resources/" + id)) {
            fs.mkdirSync("./data/resources/" + id);
            console.log(4)
            fs.mkdirSync("./data/work/" + id);
            console.log(5)
        }

        res.send("1").status(200);
    }
});
router.post('/file/:id/:sid',
    uploadwork.any(),
    function (req, res, next) {

        let stu = op.rets(p, parseInt(req.params.sid));
        console.log(stu.id, req.params.id, req.params.sid);

        console.log(tmpname)
        zp.encode("./data/work/" + req.params.id + "/" + tmpname);
        let tm = tmpname.split('.')[0];
        console.log(tm);
        let files = fs.readdirSync('./data/work/' + req.params.id)
        let flag = 1;
        let tfile;
        files.forEach((file) => {
            if (extname(file) === '.zp' && file != (tm + '.zp')) {
                let a = fs.readFileSync('./data/work/' + req.params.id + '/' + file)
                let b = fs.readFileSync('./data/work/' + req.params.id + '/' + tm + '.zp')
                if (Buffer.compare(a, b) === 0) {
                    tfile = file;
                    flag = 0;
                }
            }
        })

        if (flag === 1) {
            fs.unlinkSync("./data/work/" + req.params.id + "/" + tmpname);
            fs.appendFileSync(logpath, new Date().toLocaleString() + " " + stu.id + " 上传作业 " + req.params.id + " " + tmpname + "\n")
            res.send("ok").status(200);
            return
        }
        else {
            fs.unlinkSync("./data/work/" + req.params.id + "/" + tmpname);
            fs.unlinkSync("./data/work/" + req.params.id + "/" + tm + '.zp');
            fs.appendFileSync(logpath, new Date().toLocaleString() + " " + stu.id + " 上传作业但查重 " + req.params.id + " " + tmpname + "\n")
            res.send("发现与" + tfile.split('.')[0] + "重复!!").status(200);
            return
        }
    });
router.post('/download/:id/:sid', function (req, res, next) {

    let stu = op.rets(p, parseInt(req.params.sid));
    if (stu == 0) {
        res.send(0).status(500);
        return;
    }

    let name = zp.decode("./data/work/" + req.params.id + "/" + req.params.sid);
    fs.appendFileSync(logpath, new Date().toLocaleString() + " " + "admin" + " 查看 " + req.params.sid + "的" + req.params.id + ' ' + p.courses[parseInt(req.params.id)].name + "作业\n")
    // console.log("./data/work/"+req.params.id+"/"+req.params.sid+".txt")

    res.send(name).status(200);
});
router.post('/check', function (req, res, next) {

    let course = req.body.course;
    fs.appendFileSync(logpath, new Date().toLocaleString() + " " + "admin" + " 检查课程完成情况 " + course.id + " " + course.name + "\n")
    let files = fs.readdirSync('./data/work/'+course.id)
    let restr="已收到 ";
    for(let i=0;i<files.length;i++)
    {
        console.log(restr)

        if(extname(files[i])==='.zp')
        {
            restr+=files[i].split('.')[0]+" ";
        }
    }
    // console.log(a);
    res.send(restr+"的作业文件").status(200);

});

router.post('/workfile/:id',
    newload.any(),
    function (req, res, next) {

        // console.log(a);
        console.log("111")

        zp.encode('./data/resources/' + req.params.id + '/' + tmpname);
        fs.unlinkSync('./data/resources/' + req.params.id + '/' + tmpname);
        fs.appendFileSync(logpath, new Date().toLocaleString() + " " + "admin" + " 上传 " + req.params.id + ' ' + p.courses[parseInt(req.params.id)].name + " 的资料 " + tmpname + "\n")

        res.send("ok").status(200)
    });
router.get('/workfile/:id/:sid', function (req, res, next) {
    // console.log(a);
    let name;
    if (fs.existsSync("./data/resources/" + req.params.id + '/resource.zp')) {
        name = zp.decode("./data/resources/" + req.params.id + '/resource')
        fs.appendFileSync(logpath, new Date().toLocaleString() + " " + req.params.sid + " 查看 " + req.params.id + ' ' + p.courses[parseInt(req.params.id)].name + "的资料\n")

        res.send(name).status(200);
        return;
    }
    else {
        res.send(0).status(500);
    }
});


module.exports = router;
