const users = [{
  id: 1,
  name: 'Dom',
  schoolId: 101,
}, {
  id: 2,
  name: 'Ava',
  schoolId: 999,
}, {
  id: 3,
  name: 'Sophia',
  schoolId: 123,
}, ]

const grades = [{
  id: 1,
  schoolId: 101,
  grade: 86,
}, {
  id: 2,
  schoolId: 999,
  grade: 100,
}, {
  id: 3,
  schoolId: 101,
  grade: 80,
}, {
  id: 4,
  schoolId: 123,
  grade: 99,
}, ]

const getUser = (id) => {
  return new Promise((resolve, reject) => {
    const user = users.find(user => user.id === id)

    if (user) {
      resolve(user)
    } else {
      reject(`Unable to find user with id of ${id}`)
    }
  })
}

const getGrades = (schoolId) => {
  return new Promise((resolve, reject) => {
    resolve(grades.filter((grade) => grade.schoolId === schoolId))
  })
}

const getStatus = (userId) => {
  let user
  return getUser(userId).then((tempUser) => {
    user = tempUser
    return getGrades(user.schoolId)
  }).then((grades) => {
    let average = 0

    if (grades.length > 0) {
      average = grades.map((grade) => grade.grade).reduce((a, b) => a + b) / grades.length
    }

    return `${user.name} has a ${average} in the class.`
  })
}

const getStatusAlt = async (userId) => {
  const user = await getUser(userId)
  const grades = await getGrades(user.schoolId)

  let average = 0

  if (grades.length > 0) {
    average = grades.map((grade) => grade.grade).reduce((a, b) => a + b) / grades.length
  }

  return `${user.name} has a ${average}% in the class.`
}

getStatusAlt(1).then((name) => {
  console.log(name)
}).catch((e) => {
  console.error(e)
})

// getStatus(33).then((status) => {
//   console.log(status)
// }).catch((e) => {
//   console.error(e)
// })
