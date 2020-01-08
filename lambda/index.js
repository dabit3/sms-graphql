const axios = require('axios')
const gql = require('graphql-tag')
const graphql = require('graphql')
const { print } = graphql
const uuid = require('uuid/v4')
const Filter = require('bad-words')
const filter = new Filter()

var newBadWords = ['f', 'u', 'c', 'k', 'h', 't', 'j', 'z', 'p', 'u', 'y', 'fu', 'ck', 'uck', 'fuc', 'uc', 'shi', 'dic', 'ick', 'ck', 'ic', 'di', 'pus', 'uss', 'ussy', 'ssy', 'shi']

filter.addWords(...newBadWords);

const postMessage = gql`
  mutation createSMS($input: CreateSMSInput!) {
    createSMS(input: $input) {
      originationNumber
      messageBody
    }
  }
`

exports.handler = async (event) => {
  const message = event['Records'][0]['Sns']['Message']
  const data = JSON.parse(message)

  const originationNumber = data["originationNumber"]
  const messageBody = data["messageBody"]
  const cleanedMessage = filter.clean(messageBody)

  try {
    const graphqlData = await axios({
      url: '<API_URL>',
      method: 'post',
      headers: {
        'x-api-key': "<YOUR_API_KEY>"
      },
      data: {
        query: print(postMessage),
        variables: {
          input: {
            id: uuid(),
            messageBody: cleanedMessage,
            originationNumber
          }
        }
      }
    })
    console.log('data successfully posted! :', graphqlData)
  } catch (err) {
    console.log('error posting to appsync: ', err)
  }
    
}
