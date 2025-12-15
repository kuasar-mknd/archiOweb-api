import { use, expect } from 'chai'
import chaiHttp from 'chai-http'

const chai = use(chaiHttp)
const requestObj = chai.request

// Fix compatibility between chai 6 and chai-http 5
if (typeof chai.request === 'object') {
    chai.request = requestObj.execute
    Object.assign(chai.request, requestObj)
}

export { chai, expect }
