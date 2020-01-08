import React, {
  useEffect, useState, useReducer
} from 'react';
import './App.css';
import { API, graphqlOperation } from 'aws-amplify'
import getName from './person'

const ReactMarkdown = require('react-markdown')

const onCreateSMS = `
  subscription onCreateSMS {
    onCreateSMS {
      originationNumber
      messageBody

    }
  }
`

const listSMS = `query listSMS {
  listSMS {
    items {
      originationNumber
      messageBody
    }
  }
}`


function reducer(state, action) {
  switch(action.type) {
    case 'SET_ITEMS': 
      return {
        ...state, items: action.items
      }
    case 'ADD_ITEM':
      const items = [
        action.item, ...state.items
      ]
      return {
        ...state, items
      }
    default:
      return state
  }
}

const initialState = {
  items: []
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  console.log('state:', state)
  useEffect(() => {
    fetchItems()
    API.graphql(graphqlOperation(onCreateSMS))
      .subscribe({
        next: itemData => {
          const item = itemData.value.data.onCreateSMS
          dispatch({
            type: 'ADD_ITEM', item
          })
        }
      })
  }, [])

  async function fetchItems() {
    try {
      const itemData = await API.graphql(graphqlOperation(listSMS))
      console.log('itemData:', itemData)
      dispatch({
        type: 'SET_ITEMS', items: itemData.data.listSMS.items
      })
    } catch (err) {
      console.log({ err })
    }
  }
  console.log('state: ', state)

  return (
    <div className="App">
      <h3
        style={styles.feedback}
      >Questions? Text markdown to 910-249-6765</h3>
      {
        state.items.map((item, index) => {
          const name = getName()
          return (
            <div key={index} style={styles.container}>
              <p style={styles.from}>From: {name}</p>
              <ReactMarkdown source={item.messageBody} />
           </div>
          )
        })
      }
    </div>
  );
}

const styles = {
  feedback: {
    backgroundColor: '#f39c38',
    padding: 30,
    margin: 0,
    color: 'white',
    fontWeight: '600',
    fontSize: 34,
    textShadow: '1px 1px 1px rgba(0, 0, 0, .5)',
  },
  container: {
    borderBottom: '2px solid #ddd',
    padding: '10px 0px',
    textAlign: 'left',
    width: 700,
    margin: '0 auto'
  },
  from: {
    fontSize: 16,
    margin: '7px 0px'
  }
}

export default App;
