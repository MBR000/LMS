const fs = require("fs");
const path = require('node:path')


function node(num, char) {
    this.num = num;
    this.char = char;
    this.parent = null;
    this.left = null;
    this.right = null;
    this.bit = "";
}

function fmin(tree, len, arr) {
    let min1 = -1;
    let min2 = -1;
    let index1 = -1;
    let index2 = -1
    for (let i = 0; i < len; i++) {
        if (tree[i].parent == null && (tree[i].num < min1 || min1 == -1)) {
            index1 = i;
            min1 = tree[i].num;
        }
    }
    arr[index1] = 1;
    for (let i = 0; i < len; i++) {
        if (tree[i].parent == null && (tree[i].num < min2 || min2 == -1) && i != index1) {
            index2 = i;
            min2 = tree[i].num;
        }
    }
    arr[index2] = 1;
    return ([index1, index2])
}

function encode(filename) {
    
    // console.log(filename)
    let arr = new Array(256).fill(0);
    let tree = new Array(512);
    let table = new Array(256).fill(-1);
    let num = 0;
    let s = 0;
    let pair;
    let str = "";
    buffer = fs.readFileSync(filename);
    for (let i = 0; i < buffer.length; i++) {
        arr[buffer[i]]++;
    }
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] != 0)
            tree[num++] = new node(arr[i], i);
    }
    s = num;
    while (1) {
        pair = fmin(tree, num, arr);
        let l = pair[0];
        let r = pair[1];
        if (r == -1)
            break;
        tree[num] = new node(tree[l].num + tree[r].num, null)
        tree[l].parent = num;
        tree[r].parent = num;
        tree[num].left = l;
        tree[num].right = r;
        num++;
    }
    for (let i = 0; i < s; i++) {
        let nd = tree[i];
        let pd = tree[i];
        while (nd.parent != null) {
            nd = tree[pd.parent];
            if (tree[nd.left] == pd)
                tree[i].bit = "0" + tree[i].bit;
            else
                tree[i].bit = "1" + tree[i].bit;
            pd = tree[pd.parent];
        }
        table[tree[i].char] = tree[i].bit;
    };
    for (let i = 0; i < buffer.length; i++) {
        str += table[buffer[i]]
    }
    str = str.replace(/(.{8})/g, '$1,');
    str = str.split(',');
    str.forEach((item, index) => {
        str[index] = parseInt(item, 2)
    })


    // table.forEach((item, index) => {
    //     if (item != -1)
    //         table[index] = parseInt(item, 2);
    // })


    str = Buffer.from(str);
    // dic=JSON.stringify(table,null,'\t');
    dic = JSON.stringify({ext:path.extname(filename),table:table});
    filename=filename.split('.')[1];
    // console.log(filename)
    fs.writeFileSync('.'+filename + ".zp", str);
    fs.writeFileSync('.'+filename + ".dic", dic);
}

function decode(name) {
    // ptr.students = JSON.parse(fs.readFileSync(path));
    name=name.split('.')[1];
    // console.log(name)
    let buffer = fs.readFileSync('.'+name + ".zp");
    let dic=JSON.parse(fs.readFileSync('.'+name + ".dic"))
    let ext = dic.ext;
    let table = dic.table;
    let t = new node(-1, null);
    let i, j, p;
    for (i = 0, j = 0; i < table.length; i++) {
        p = t;
        if (table[i] != -1) {
            for (j = 0; j < table[i].length - 1; j++) {
                if (table[i][j] == '1') {
                    if (p.right == null) {
                        p.right = new node(-1, null);
                        p.right.parent = p;
                    }
                    p = p.right;
                }
                else {
                    if (p.left == null) {
                        p.left = new node(-1, null);
                        p.left.parent = p;
                    }
                    p = p.left
                }
            }
            if (table[i][j] == '1') {
                if (p.right == null) {
                    p.right = new node(-1, i);
                    p.right.parent = p;
                }
                p = p.right;
                p.char = i;
            }
            else {
                if (p.left == null) {
                    p.left = new node(-1, i);
                    p.left.parent = p;
                }
                p = p.left;
                p.char = i;
            }
        }
    }
    buffer = Array.from(buffer);
    let s = ""
    buffer.forEach((item, index) => {
        buffer[index] = item.toString(2)
        while (buffer[index].length < 8)
            buffer[index] = '0' + buffer[index];
    })
    for (i = 0; i < buffer.length; i++) {
        s += buffer[i];
    }
    p = t, i = 0;
    let out = [];
    while (i < s.length - 1) {
        while (p.char == null && i < s.length) {
            if (s[i] == '0' && p.left != null)
                p = p.left;
            else if (s[i] == '1' && p.right != null)
                p = p.right;
            i++;
        }
        out.push(p.char);
        p = t;
    }
    out = Buffer.from(out);
    console.log(name+ext)
    fs.writeFileSync('.'+name+ext, out);

    return(name+ext);
}

// function bmpencode(buffer, name) {
//     let window = new Array(8);
//     let len = 15;
//     let l = 0;
//     let r = 0;
//     for (let i = 0; i < buffer.length; i++) {

//     }
//     encode(strarr, name)
// }



// let buffer = fs.readFileSync("cn.bmp")

// encode(buffer, "after")
// decode("after", "before.bmp")



module.exports = {
    encode: encode,//传入要压缩的文件路径 例如 a.txt，得到a.zp和a.dic
    decode: decode//传入没有后缀的路径,如a,和新文件的路径和后缀，如a.txt 得到解压后的a.txt
}