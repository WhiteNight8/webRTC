import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { createStore } from "redux"
import { Provider } from "react-redux"
import rootReducer from "./redux-elements/reducers/rootReducer"
import ErrorBoundary from "./components/ErrorBoundary"

const theStore = createStore(rootReducer)

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <ErrorBoundary>
    <Provider store={theStore}>
      <App />
    </Provider>
  </ErrorBoundary>
)
