const fs = require('fs');
function course(name, id, classes, week, time, place, teacher, info) {
    this.name = name;       //课程名字
    this.id = id;           //数组索引
    this.classes = classes; //班级
    this.week = week        //上课星期
    this.time = time;       //上课时间 数组
    this.place = place;     //上课地点，混合数组
    this.teacher = teacher; //老师 字符串
    this.info = info;       //各类信息
}
function student(id, uid, name, classes, password, courses) {
    this.id = id;                  //学号     number
    this.uid = uid;                //数组索引 number
    this.name = name;              //名称     string
    this.classes = classes;        //班级     number
    this.password = password;      //密码     string
    this.courses = courses;         //需上课程  array
    this.activities = [];           //活动      array
}
function activity(id, name, personal, time, friends) {
    this.id = id;                   //索引         number
    this.name = name;               //活动名称     string
    this.personal = personal;       //创建者学号    number
    this.time = time;               //起止时间      array
    this.conflict = 0;
    this.friends = friends;         //单人 多人     number
}

ptr = new Object()
ptr.cid = 0;
ptr.aid = 0;
ptr.courses = [];
ptr.students = [];
ptr.arr = [];


function readcourses(ptr, path1, path2) {
    ptr.courses = JSON.parse(fs.readFileSync(path1));
    ptr.arr = JSON.parse(fs.readFileSync(path2));
    ptr.cid = ptr.courses.length;
    if (!ptr.courses)
        ptr.courses = [];
}
function readstudents(ptr, path) {
    ptr.students = JSON.parse(fs.readFileSync(path));
    for(let i=0;i<ptr.students.length;i++)
    {
        ptr.students[i].courses=[] 
    }
    for (let i = 0; i < ptr.courses.length; i++) {
        ptr.students.forEach((elements) => {
            if (elements.classes == ptr.courses[i].classes) {
                elements.courses.push([ptr.courses[i].id, 1]);
            }
        })
    }
}
function addcourse(ptr, name, classes, week, time, place, teacher, info) {
    let id = ptr.courses.length;
    let cr = new course(name, id, classes, week, time, place, teacher, info)
    matchcs(cr, ptr);
    ptr.courses.push(cr);
    ptr.cid++;
    return id;

}
function addstudent(ptr, id, name, classes, password) {
    let uid = ptr.students.length;
    let st = new student(id, uid, name, classes, password, [])
    matchsc(st, ptr);
    ptr.students.push(st);
    let i;
    if (st.id >= ptr.students[uid - 1].id) {
        for (i = uid - 1; ptr.students[i].id > st.id; i--) {
            ptr.students[i + 1] = ptr.students[i];
        }
        ptr.students[i + 1] = st;
    }
    // let text = JSON.stringify(ptr.students, null, '\t');
    // fs.writeFileSync(path1, text);
    // editstu(path2, students);
}
function addactivity(activity, sid) {
    let stu = retstudent(ptr, sid);
    let flag = 1

    // console.log(stu)
    for (let i = 0; flag == 1 && i < stu.activities.length; i++) {
        // console.log(stu.activities[i].time,activity.time)
        if (timecheck(stu.activities[i].time, activity.time) === 0)
            flag = 0;
    }
    for (let i = 0; flag == 1 && i < stu.courses.length; i++) {
        if (ctimecheck(activity.time, ptr.courses[stu.courses[i][0]]) === 0)
            flag = 0;
    }
    activity.id = stu.activities.length;
    if (flag == 1)
        activity.conflict = 1;
    stu.activities.push(activity);
    // ptr.cid++;
    return flag;
}
function delactivity(ptr, sid, aid) {
    let stu = retstudent(ptr, sid);
    for (let i = aid; i < stu.activities.length - 1; i++) {
        stu.activities[i] = stu.activities[i + 1];
        stu.activities[i].id--;
    }
    stu.activities.pop();
    return;
}
function timecheck(time1, time2) {
    // console.log(time1,time2)
    let time11 = new Date(time1[0]);
    let time12 = new Date(time1[1]);
    let time21 = new Date(time2[0]);
    let time22 = new Date(time2[1]);

    if ((time11 < time21 && time21 < time12) || (time21 < time11 && time11 < time22) || (time11 < time21 && time21 < time12) || (time21 <= time11 && time12 <= time22))
        return 0
    return 1;
}
function ctimecheck(atime, course) {
    let time11 = new Date(atime[0]);
    let time12 = new Date(atime[1]);
    for (let i = 0; i < 7; i++) {
        if (course.week[i] === true && time11.getDay() - 1 == i) {
            // console.log(i)
            let tmp1 = course.time[i][0].split(":");
            let h1 = tmp1[0]
            let m1 = tmp1[1];
            let tmp2 = course.time[i][1].split(":");
            let h2 = tmp2[0]
            let m2 = tmp2[1];
            let time21 = new Date(time11.getFullYear(), time11.getMonth(), time11.getDate(), h1, m1, 0)
            let time22 = new Date(time11.getFullYear(), time11.getMonth(), time11.getDate(), h2, m2, 0)
            console.log(time21, time22)
            // console.log(time11.getFullYear(), time11.getMonth(), time11.getDate(), h1, m1, 0)
            if ((time11 < time21 && time21 < time12) || (time21 < time11 && time11 < time22) || (time11 < time21 && time21 < time12) || (time21 < time11 && time12 < time22))
                return 0
        }
    }
    return 1;
}

function matchcs(cr, ptr) {
    // for (let i = 0; i < cr.classes.length; i++) {
    //     let c = cr.classes[i];
    //     for (let j = 0; j < ptr.students.length; j++) 
    //     {
    //         if (c == ptr.students[j].classes)
    //             ptr.students[j].courses.push(cr.id);
    //     }
    // }
    ptr.students.forEach((elements) => {
        if (elements.classes == cr.classes) {
            elements.courses.push([cr.id, 1]);
        }
    })
}
function matchsc(st, ptr) {
    ptr.courses.forEach(element => {
        if (element.classes === st.classes)
            st.courses.push([element.id, 1]);
    })
    return st;
}
function delcourse(id, ptr) {
    ptr.courses[id].id = ptr.courses.length;
    for (let i = id; i < ptr.courses.length - 1; i++)
        ptr.courses[i] = ptr.courses[i + 1]
    ptr.courses.pop();
    ptr.students.forEach((element) => {
        element.courses.forEach((element) => {
            if (element >= id) element -= 1;
            else if (element == id) element = ptr.courses.length;
        })
    })
}
function delstu(uid, ptr) {
    ptr.students[uid].uid = ptr.students.length;
    for (let i = id; i < ptr.students.length - 1; i++)
        ptr.students[i] = ptr.students[i + 1]
    ptr.students.pop();
}


function adjcourses(id, ptr, course, work) {
    ptr.courses[id] = course;
    if (work === true) {
        ptr.students.forEach((elements) => {
            if (elements.classes == course.classes) {
                elements.courses.forEach((e) => {
                    if (e[0] == course.id)
                        e[1] = 0;
                })
            }
        })
    }

}
function adjstudent(sid, ptr, stu) {

    let st = retstudent(ptr, sid);
    st = stu;
}
function savecourses(ptr, path1, path2) {
    let text = JSON.stringify(ptr.courses, null, '\t');
    let arr = JSON.stringify(ptr.arr, null, '\t');

    fs.writeFileSync(path1, text);
    fs.writeFileSync(path2, arr);
}
function savestudents(ptr, path) {
    let text = JSON.stringify(ptr.students, null, '\t');
    fs.writeFileSync(path, text);
}
function retstudent(ptr, id) {
    let left = 0;
    let right = ptr.students.length - 1;
    let mid
    while (left <= right) {
        mid = Math.floor((left + right) / 2);
        if (ptr.students[mid].id < id)
            left = mid + 1;
        else if (ptr.students[mid].id > id)
            right = mid - 1;
        else break;
    }
    if (ptr.students[mid].id === id) {
        return ptr.students[mid];
    }
    else return 0;
}
function searchcbyid(ptr, id) {
    return ptr.courses[id];
}
// function searchexp(ptr, witem) {
//     let rcourses = [];
//     let proitem = eval("/[" + witem + "]/")
//     for (let i = 0; i < ptr.courses.length; i++) {
//         let w = ptr.courses[i]
//         if (proitem.test(w.name)!=-1 || proitem.test(w.place)!=-1 || proitem.test(w.teacher)!=-1) { rcourses.push(w); }
//     }
//     return rcourses;
// }
function searchexp(ptr, wname) {
    let rcourses = [];
    let flag;
    for (let i = 0; i < ptr.courses.length; i++) {
        let w = ptr.courses[i]
        flag = 1;
        for (let j = 0; j < wname.length; j++) {
            if (w.name.indexOf(wname[j]) == -1 && w.place[1].indexOf(wname[j]) == -1 && w.teacher.indexOf(wname[j]) == -1) {
                flag = 0;
                break;
            }
        }
        if (flag == 1) {
            rcourses.push(ptr.courses[i]);
        }
    }
    return rcourses;
}
function storeindex(ptr) {
    ptr.arr = [];
    for (let i = 0; i < ptr.courses.length; i++) {
        ptr.arr.push(i);
    }
    psort(ptr.arr, ptr.courses, 0, ptr.courses.length - 1);
    let text = JSON.stringify(ptr.arr, null, '\t');
}
function searchcbyname(ptr, wname) {
    let l = 0;
    let r = ptr.arr.length - 1;
    let mid;
    let rcourses = [];
    while (l <= r) {
        mid = Math.floor((l + r) / 2);
        if (ptr.courses[ptr.arr[mid]].name == wname) {
            for (let v = mid; v >= 0 && ptr.courses[ptr.arr[v]].name == wname; v--) {
                rcourses.push(ptr.courses[ptr.arr[v]]);
            }
            for (let v = mid + 1; v < ptr.courses.length && ptr.courses[ptr.arr[v]].name == wname; v++) {
                rcourses.push(ptr.courses[ptr.arr[v]]);
            }
            return rcourses;
        }

        else if (ptr.courses[ptr.arr[mid]].name < wname)
            l = mid + 1;
        else
            r = mid - 1
    }
    return rcourses;
}

function psort(arr, courses, l, r) {
    if (l < r) {
        let i = l;
        let j = r;
        let empty = arr[l];
        while (i < j) {
            while (courses[arr[j]].name > courses[empty].name && i < j) {
                j--;
            }
            arr[i] = arr[j];
            while (courses[arr[i]].name < courses[empty].name && i < j) {
                i++;
            }
            arr[j] = arr[i];
        }
        arr[i] = empty;
        psort(arr, courses, l, i - 1);
        psort(arr, courses, i + 1, r);
    } else {
        return;
    }
}

module.exports = {
    ptr: ptr,
    readc: readcourses,
    reads: readstudents,
    addc: addcourse,
    adds: addstudent,
    delc: delcourse,
    delact: delactivity,
    dels: delstu,
    adjc: adjcourses,
    adjs: adjstudent,
    svc: savecourses,
    svs: savestudents,
    rets: retstudent,
    searchcbyid: searchcbyid,
    searchexp: searchexp,
    searchcbyname: searchcbyname,
    storeindex: storeindex,
    addact: addactivity,
    timecheck: timecheck,
}