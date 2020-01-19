const objArr = {}

for (let i = 0; i < 10; i++) {
  objArr[i] = Date.now()
}

console.log(JSON.stringify(objArr, 0, 2))

console.log()

for (const objArrEle in objArr) {
  const ele = objArr[objArrEle]
  console.log(`${objArrEle}\t${ele}`)
}

objArr.map(a => {
  console.log(a)
})
