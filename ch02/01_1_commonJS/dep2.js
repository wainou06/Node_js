const dep1 = require('./dep1')
console.log('require dep1: ', dep1)

function insideDep2() {
   console.log('dep1: ', dep1)
}

module.exports = insideDep2
