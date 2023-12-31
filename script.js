const firebaseConfig = {
  apiKey: "AIzaSyAn9OLjJDxInztyC7sUEukzhhalgVvT2DA",
  authDomain: "websitesochum.firebaseapp.com",
  projectId: "websitesochum",
  storageBucket: "websitesochum.appspot.com",
  messagingSenderId: "6365438847",
  appId: "1:6365438847:web:5ce70819daad2234bf304a",
  measurementId: "G-5VDMJF37MC"
};

firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()

const nisitRef = db.collection("nisit")
let schedule = []
let nisitlist = []

nisitRef.onSnapshot((docs) => {
    let nschedule = []
    let nnisitlist = []
    docs.forEach((doc) => {
        nschedule.push(doc.data().schedule)
        nnisitlist.push(doc.data().name)
    })
    if (nisitlist.length != nnisitlist.length) {
        nisitlist = nnisitlist
        console.log("CHANGED")
        renderNisit()
    }
    schedule = nschedule
    updateSchedule()
})

let select = ""
const day = ["mon", "tue", "wed", "thu", "fri"]
const dayInThai = ["จันทร์", "อังคาร" , "พุธ", "พฤหัส", "ศุกร์"]

function addtime () {
    const choosenisit = document.getElementById("choosenisit")
    const subject = document.getElementById("subject")
    const chooseday = document.getElementById("chooseday")
    const starttime = document.getElementById("starttime")
    const endtime = document.getElementById("endtime")
    
    const data = {nisit: Number(choosenisit.value), day: Number(chooseday.value), starttime:Number(starttime.value), endtime:Number(endtime.value), subject:subject.value }
    if (data.endtime <= data.starttime) {
        alert("เวลาเริ่ม ต้องอยู่ก่อน เวลาจบ")
        return;
    }
    schedule[data.nisit].push(data)
    if (updatetable(data.day, data.nisit)) {
        console.log("YES, I have updated")
        nisitRef.doc(data.nisit.toString()).update({
            schedule: schedule[data.nisit]
        })
    }
}

function debug() {
    console.log(schedule)
}

function renderNisit () {
    select = ' <select id="choosenisit" onchange="updateSchedule()"> '
    for (var i = 0; i < nisitlist.length; i++) {
        select += '<option value="' + i.toString() + '">' + nisitlist[i] + '</option>';
    }
    select += "</select>"
    document.getElementById("nisitpog").innerHTML = select
}

function addnisit () {
    var name = document.getElementById("name")
    nisitlist.push(name.value)
    schedule.push([])
    nisitRef.doc((nisitlist.length - 1).toString()).set({
        name: name.value,
        schedule: []
    })
}

function removeT (day, starttime) {
    const pos = document.getElementById("choosenisit").value 

    for (let i = 0; i < schedule[pos].length; ++i) {
        if (schedule[pos][i].day === day && schedule[pos][i].starttime === starttime) {
            schedule[pos].splice(i, 1)
            break
        }
    }
    nisitRef.doc(pos).update({
        schedule: schedule[pos]
    }) 
}

function updatetable (nowday, nisit) {
    if (nisit === "") {
        return false
    }
    var id = "tbl-" + day[nowday]
    var curhtml = "<td class='table-h'>" + dayInThai[nowday] + "</td>"

    var pre = 0

    var error = false

    Array.from(schedule[nisit])
    .filter((i) => {
        return i.nisit == document.getElementById("choosenisit").value && i.day == nowday
    })
    .sort((a, b) => {
        return a.starttime- b.starttime
    })
    .forEach((value, index) => {
        if (pre > value.starttime) {
            error = true
        }
        while (pre < value.starttime) {
            curhtml += '<td colspan="1"></td>'
            pre++
        }
        curhtml += `<td id="cal" colspan="${value.endtime - value.starttime}" onclick="removeT(${value.day},${value.starttime})">${value.subject}</td>`
        pre = value.endtime
    })

    console.log(curhtml)

    if (error) {
        schedule[nisit].pop()
        alert("ตารางเวลาซ้อนทับกัน เพิ่มไม่ได้")
        return false
    } else {
        document.getElementById(id).innerHTML = curhtml
        return true
    }
}

function updateSchedule() {
    console.log("CALLED")
    const newOption = document.getElementById("choosenisit").value
    for (var i = 0; i < 5; ++i) {
        updatetable(i, newOption)
    } 
}

document.getElementById("add").addEventListener("click",addtime)
document.getElementById("addnisit").addEventListener("click", addnisit)
// document.getElementById("choosenisit").addEventListener("change", updateSchedule)
document.getElementById("debug").addEventListener("click", updatetable)