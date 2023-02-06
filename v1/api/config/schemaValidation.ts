import 'dotenv/config'
import { ObjectId } from 'mongodb';
import { devDb, main } from "./db";


function allAreTrue(arr: any[]) {
  return arr.every((element: boolean) => element === true);
}

export const checkValidation = (data: any, schema: any) => {
  let checkBody: boolean[] = []
  let checkType: boolean[] = []
  let errBody: string[] = []
  let expectBody: string[] = []
  let errType: string[] = []
  let expectType: string[] = []

  Object.keys(data).map((item, i) => {
    checkBody.push(Object.keys(schema)[i] == Object.keys(data)[i])
    checkType.push(typeof Object.values(data)[i] == Object.values(schema)[i])
  })

  const indexErrBody = checkBody.reduce(
    (out, bool, index) => !bool ? out.concat(index) : out,
    []
  )

  const indexErrType = checkType.reduce(
    (out, bool, index) => !bool ? out.concat(index) : out,
    []
  )

  indexErrBody.map(item => {
    errBody.push(Object.keys(data)[item])
    expectBody.push(Object.keys(schema)[item])
  })
  indexErrType.map(item => {
    errType.push(Object.keys(data)[item])
    expectType.push(Object.keys(schema)[item])
  })

  if (allAreTrue(checkBody) && allAreTrue(checkType)) {
    return {
      result: true
    }
  }

  if (!allAreTrue(checkBody) && !allAreTrue(checkType)) {
    return {
      result: false,
      errBody: `Following body doesn't match with schema: ${JSON.stringify(errBody)}, expected body: ${JSON.stringify(expectBody)}`,
      errType: `Following types of body does't match with schema: ${JSON.stringify(errType)}, expected type: ${JSON.stringify(expectType)}`
    }
  }

  if (!allAreTrue(checkBody)) {
    return {
      result: false,
      errBody: `Following body doesn't match with schema: ${JSON.stringify(errBody)}, expected body: ${JSON.stringify(expectBody)}`
    }
  }

  if (!allAreTrue(checkType)) {
    return {
      result: false,
      errType: `Following types of body does't match with schema: ${JSON.stringify(errType)}, expected type: ${JSON.stringify(expectType)}`
    }
  }

}
