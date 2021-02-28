"use strict";

window.addEventListener('DOMContentLoaded', init)

let allStudent = []

let allFamilies = []

const Student = {
    firstName: "",
    middleName: "",
    lastName: "",
    nickName: "",
    gender: "",
    house: "",
    picture: "",
    bloodStatus: "",
    inquisitorialSquad: false,
    expelled: false,
    prefect: false
};

const settings = {
    filterWord: 'all',
    sortBy: 'firstName',
    sortDirection: 'asc',
    filterType: 'house'
}
/* used for filtering */
const types = {
    house: 'all',
    gender: 'all',
    bloodStatus: 'all',
    status: 'false'
}
/* used for searching */
let searchTerm = '';


function init() {

    selectButtons()

    loadFamilies()

    loadData()

}

function selectButtons() {

    document.querySelectorAll('select').forEach(element => {
        element.addEventListener('change', selectFilter)
    });

    document.querySelector('input').addEventListener('keyup', selectSearch)

    document.querySelectorAll('[data-action=sort]').forEach(button => {
        button.addEventListener('click', selectSort)
    })

}



function loadData() {

    fetch('https://petlatkea.dk/2020/hogwarts/students.json')
        .then(response => response.json())
        .then(handleData)

}

function handleData(data) {

    prepareObjects(data)


}

function loadFamilies() {

    fetch('https://petlatkea.dk/2021/hogwarts/families.json')
        .then(response => response.json())
        .then(data => {
            allFamilies = data
        })

}

function prepareObjects(student) {


    allStudent = student.map(handleObject);


    const riqui = {
        firstName: "Riqui",
        middleName: "",
        lastName: "Puig",
        gender: "Boy",
        house: "Barca",
        picture: "riqui.jpg",
        bloodStatus: "Secret",
        expelled: false
    }

    const sergi = {
        firstName: "Sergi",
        middleName: "",
        lastName: "Roberto",
        gender: "Boy",
        house: "Barca",
        picture: "sergi.jpg",
        bloodStatus: "Secret",
        expelled: false,
    }

    allStudent.push(riqui)
    allStudent.push(sergi)

    /* fixing problems with pictures manually :)    */
    allStudent[9].picture = 'default.png'
    allStudent[19].picture = 'patil_padma.png'
    allStudent[14].picture = 'patil_parvati.png'
    allStudent[3].picture = 'fletchley_j.png'




    buildList(allStudent)


}

function handleObject(freshman) {
    const student = Object.create(Student);
    const splittedName = freshman.fullname.trim().split(' ')

    student.firstName = capitalizeString(splittedName[0])


    if (splittedName.length == 3) {

        student.middleName = capitalizeString(splittedName[1])
        student.lastName = capitalizeString(splittedName[2])

    }

    if (splittedName.length == 2) {

        student.lastName = capitalizeString(splittedName[1])

    }

    if (splittedName.length == 1) {

        student.firstName = capitalizeString(splittedName[0])

    }

    splittedName.forEach(string => {
        if (string.includes('"')) {
            student.nickName = capitalizeString(nickName(student.middleName))
            delete student.middleName
        }

    })


    student.picture = nameToPng(student.lastName, student.firstName)

    student.house = capitalizeString(freshman.house.trim())

    student.gender = capitalizeString(freshman.gender)


    /* uncomment if to make harry potter half blood */
    if (allFamilies.pure.includes(student.lastName) /*  && !allFamilies.half.includes(student.lastName) */ ) {

        student.bloodStatus = 'Full-blood'
    } else if (allFamilies.half.includes(student.lastName)) {
        student.bloodStatus = 'Half-blood'
    } else {
        student.bloodStatus = 'Muggle-born'
    }

    student.expelled = false


    return student;
}

function nickName(string) {
    return string.substring(1, string.length - 1)
}

function capitalizeString(string) {
    if (string.includes('-')) {
        return string
    }
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()

}

function nameToPng(lastname, firstname) {
    return lastname.toLowerCase() + '_' + firstname.toLowerCase().charAt(0) + '.png'
}

/* filtering */

function selectFilter(event) {

    const filterType = event

    /* reset the filter */

    document.querySelector('button').addEventListener('click', event => {
        event.preventDefault()


        types.house = 'all'
        types.gender = 'all'
        types.bloodStatus = 'all'
        types.status = 'active'

        settings.filterWord = 'all'

        filterType.target.value = 'all'

        getList(allStudent)
    })

    setFilter(filterType.target.value, filterType.target.name)

}

function setFilter(filter, name) {
    settings.filterWord = filter
    settings.filterType = name

    buildList()
}

function filterList(list) {


    if (settings.filterType === 'house') {
        types.house = settings.filterWord
    }
    if (settings.filterType === 'gender') {
        types.gender = settings.filterWord
    }
    if (settings.filterType === 'bloodStatus') {
        types.bloodStatus = settings.filterWord
    }
    if (settings.filterType === 'status') {
        types.status = settings.filterWord
    }


    const filteredHouse = list.filter(student => {
        if (types.house === 'all') {
            return student
        } else {
            return student.house.toLowerCase() === types.house.toLowerCase()
        }
    })

    const filteredGender = filteredHouse.filter(student => {
        if (types.gender === 'all') {
            return student
        } else {
            return student.gender.toLowerCase() === types.gender.toLowerCase()
        }
    })

    const filteredBloodStatus = filteredGender.filter(student => {
        if (types.bloodStatus === 'all') {
            return student
        } else {
            return student.bloodStatus.toLowerCase() === types.bloodStatus.toLowerCase()
        }
    })


    const trueList = []
    const falseList = []

    /* because this is a boolean it got much more difficult to make */

    const filteredStatus = filteredBloodStatus.filter(student => {

        if (student.expelled === true) {
            return trueList.push(student)
        } else {
            return falseList.push(student)
        }
    })

    if (types.status == 'true') {
        return trueList
    } else if (types.status == 'false') {
        return falseList
    } else {
        return filteredBloodStatus
    }

}

/* sorting */

function selectSort(event) {



    const sortDirection = event.target.dataset.sortDirection;
    const sortBy = event.target.dataset.sort;

    const old = document.querySelector(`[data-sort='${settings.sortBy}']`)

    old.classList.remove('chosen')
    event.target.classList.add('chosen')


    if (sortDirection === 'asc') {
        event.target.dataset.sortDirection = 'desc'
    } else {
        event.target.dataset.sortDirection = 'asc'
    }

    setSort(sortBy, sortDirection)

}

function setSort(sortBy, sortDirection) {
    settings.sortBy = sortBy
    settings.sortDirection = sortDirection
    buildList()
}

function sortList(list) {

    let direction = 1

    if (settings.sortDirection === 'desc') {
        direction = -1
    } else {
        direction = 1
    }

    const sortedList = list.sort(sortProperty)

    function sortProperty(a, b) {
        if (a[settings.sortBy] < b[settings.sortBy]) {
            return -1 * direction
        } else {
            return 1 * direction
        }
    }


    return sortedList

}

function sortLoadedList(a, b) {

    if (a.firstName > b.firstName) {
        return 1
    }
    if (b.firstName > a.firstName) {
        return -1
    } else {
        return 0
    }

}

/* search functionality */

function selectSearch(event) {
    searchTerm = event.target.value
    setSearch()
}

function setSearch(term) {
    buildList()
}

function searchList(list) {

    let searchedList = []

    list.forEach(student => {

        const findFirstName = student.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) != -1
        const findMiddleName = student.middleName.toLowerCase().indexOf(searchTerm.toLowerCase()) != -1
        const findLastName = student.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) != -1

        if (findFirstName || findMiddleName || findLastName) {
            searchedList.push(student)

        }
    })

    return searchedList

}
/* handling the long list */

function buildList() {

    const currentList = filterList(allStudent.sort(sortLoadedList))

    const sortedList = sortList(currentList)
    const searchedList = searchList(sortedList)

    console.log(searchedList)
    getList(searchedList)

}


function getList(list) {


    document.querySelector("tbody").innerHTML = "";

    list.forEach(displayList)


    let numOfTrue = list.filter(getLength).length

    /* Find amount of students in each house. Since the code got repetetive i wrote it on one line per house. */

    document.querySelector('#gryffindor').textContent = list.filter(number => number.house === 'Gryffindor').length
    document.querySelector('#huflepuff').textContent = list.filter(number => number.house === 'Hufflepuff').length
    document.querySelector('#ravenclaw').textContent = list.filter(number => number.house === 'Ravenclaw').length
    document.querySelector('#slytherin').textContent = list.filter(number => number.house === 'Slytherin').length

    /* same method for genders */

    document.querySelector('#female').textContent = list.filter(number => number.gender === 'Girl').length
    document.querySelector('#male').textContent = list.filter(number => number.gender === 'Boy').length

    document.querySelector("#active-students").textContent = list.length - numOfTrue

    document.querySelector("#expelled-students").textContent = numOfTrue
}

function getLength(element) {
    element.expelled === true
}

function displayList(eachStudent) {

    // create copy
    const copy = document.querySelector("template").content.cloneNode(true);

    // set data

    copy.querySelector("[data-field=picture] img").src = 'images/' + eachStudent.picture;

    copy.querySelector("[data-field=picture] img").alt = `${eachStudent.firstName} ${eachStudent.middleName} ${eachStudent.lastName} picture`;

    copy.querySelector("[data-field=name]").textContent = `${eachStudent.firstName} ${eachStudent.middleName} ${eachStudent.lastName}`;

    copy.querySelector("[data-field=gender]").textContent = eachStudent.gender;

    if (eachStudent.house === 'Ravenclaw') {
        copy.querySelector("[data-field=house] img").src = 'logos/' + 'ravenclaw.png'
    } else if (eachStudent.house === 'Slytherin') {
        copy.querySelector("[data-field=house] img").src = 'logos/' + 'slytherin.png'
    } else if (eachStudent.house === 'Hufflepuff') {
        copy.querySelector("[data-field=house] img").src = 'logos/' + 'hufflepuff.png'
    } else if (eachStudent.house === 'Gryffindor') {
        copy.querySelector("[data-field=house] img").src = 'logos/' + 'gryffindor.png'
    } else {
        copy.querySelector("[data-field=house]").textContent = eachStudent.house
    }




    copy.querySelector("[data-field=blood]").textContent = eachStudent.bloodStatus;

    const control = copy.querySelector(".control")
    const editor = copy.querySelector("[data-field=edit]")
    editor.addEventListener('mouseover', edit)

    function edit() {

        control.style.display = 'inherit'

        control.addEventListener('mouseleave', (e) => {
            control.style.display = 'none'
        })


    }

    if (eachStudent.expelled) {
        copy.querySelector('tr').style.backgroundColor = "#dc143c";
        copy.querySelector('.expell').textContent = 'Unexpel'
        eachStudent.inquisitorialSquad = false
        eachStudent.prefect = false
    }


    copy.querySelector('.expell').addEventListener('click', () => {

        eachStudent.expelled = !eachStudent.expelled;

        buildList()

    })

    if (eachStudent.inquisitorialSquad) {
        copy.querySelector('.squad').textContent = 'Remove from inquisitorial squad'
        const li = document.createElement('li')
        li.textContent = 'Inquisitorial squad member'
        copy.querySelector(".notes").appendChild(li)
    }



    if (eachStudent.house == 'Slytherin' || eachStudent.bloodStatus == 'Full-blood') {

        copy.querySelector('.squad').addEventListener('click', () => {
            eachStudent.inquisitorialSquad = !eachStudent.inquisitorialSquad;
            buildList()
        })
    } else {
        copy.querySelector('.squad').remove()
    }




    copy.querySelector("[data-field=note]").dataset.prefect = eachStudent.prefect

    if (eachStudent.prefect) {
        const li = document.createElement('li')
        li.textContent = 'Prefect'
        copy.querySelector(".notes").appendChild(li)

        copy.querySelector(".prefect").textContent = 'Remove Prefect'
    }

    copy.querySelector(".prefect").addEventListener('click', togglePrefect)

    function togglePrefect() {

        if (eachStudent.prefect) {

            eachStudent.prefect = false
        } else {
            makeStudentPrefect(eachStudent)

        }
        buildList()
    }


    /* create modal */
    const modal = document.querySelector('.modal')
    copy.querySelector('[data-field=name]').addEventListener('click', e => {
        createModal(eachStudent, modal)
        modal.classList.toggle('active')
    })

    // append clone to list
    document.querySelector("tbody").appendChild(copy);

}

function createModal(student, modal) {

    modal.querySelector('.modal-picture').src = 'images/' + student.picture

    modal.querySelector('#first').textContent = student.firstName

    modal.querySelector('#last').textContent = student.lastName

    modal.querySelector('#house').textContent = student.house

    modal.querySelector('#status').textContent = student.bloodStatus

    if (student.inquisitorialSquad) {
        modal.querySelector('.role-squad').textContent = 'Squad member'
        modal.querySelector('.role-squad').style.display = 'inherit'
    } else {
        modal.querySelector('.role-squad').style.display = 'none'
    }


    if (student.prefect) {
        modal.querySelector('.role-prefect').textContent = 'Prefect'
        modal.querySelector('.role-prefect').style.display = 'inherit'
    } else {
        modal.querySelector('.role-prefect').style.display = 'none'
    }


    if (student.middleName) {
        modal.querySelector('#middle').textContent = student.middleName
        modal.querySelector('#middle').parentElement.parentElement.style.display = 'inherit'
    } else {
        modal.querySelector('#middle').parentElement.parentElement.style.display = 'none'
    }

    if (Boolean(student.nickName)) {
        modal.querySelector('#first').textContent += ` (${student.nickName})`
    }


    modal.querySelector('#gender').textContent = student.gender


    document.querySelector('.close').addEventListener('click', e => modal.classList.remove('active'))

}

function makeStudentPrefect(selectedStudent) {

    const prefectList = allStudent.filter(student => student.prefect)

    const filterPrefects = prefectList.filter(student => student.gender === selectedStudent.gender && student.house === selectedStudent.house)

    const amount = filterPrefects.length

    const other = filterPrefects.shift()


    if (other !== undefined) {
        removeOther(other)
    } else {
        makePrefect(selectedStudent)
    }


    function removeOther(other) {

        const modal = document.querySelector('#prefect')

        modal.classList.add('active')

        document.querySelector('#ignore').addEventListener('click', closeDialog)

        document.querySelector('#remove').addEventListener('click', removeStudent)
        document.querySelectorAll('.current').forEach(e => e.textContent = selectedStudent.firstName)

        function closeDialog() {
            modal.classList.remove('active')
            document.querySelector('#ignore').removeEventListener('click', closeDialog)

            document.querySelector('#remove').removeEventListener('click', removeStudent)

        }

        function removeStudent() {

            removePrefect(other)
            makePrefect(selectedStudent)
            buildList()
            closeDialog()

        }


    }

    function removePrefect(student) {
        student.prefect = false
    }

    function makePrefect(student) {
        student.prefect = true

    }

}

function hackTheSystem() {
    console.log('Oh No voldemord broke in')
    console.log('what have you done?')


    const voldemord = {
        firstName: "'Voldemord'",
        middleName: "",
        lastName: "",
        gender: "Boy",
        house: "Slytherin",
        picture: "v.jpg",
        bloodStatus: "Evil",
        expelled: false
    }

    allStudent = allStudent.filter(student => student.house == 'Slytherin' || student.house == 'Barca')
    document.querySelector('h1').textContent = 'Oh no!! He is BACK!'
    document.querySelector('form').remove()

    document.querySelector('.information').style.display = 'none'


    allStudent.unshift(voldemord)



    buildList()
    document.querySelectorAll('.expell').forEach(e => {

        e.parentElement.parentElement.parentElement.remove()
    })
}
