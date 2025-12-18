import * as chaiModule from 'chai'
import chaiHttp from 'chai-http'

const chai = chaiModule.use(chaiHttp)
const expect = chaiModule.expect
const requestObj = chai.request

// Fix compatibility between chai 6 and chai-http 5
if (typeof chai.request === 'object') {
    chai.request = requestObj.execute
    Object.assign(chai.request, requestObj)
}

export { chai, expect }
