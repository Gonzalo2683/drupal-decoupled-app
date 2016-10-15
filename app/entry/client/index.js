/**
 * @file    application entry point for the client
 * @author  Sebastian Siemssen <sebastian@amazeelabs.com>
 * @date    2016-01-01
 */

/* eslint-disable global-require */

// Needed for redux-saga es6 generator support.
import 'babel-polyfill';

// Load the manifest.json file.
import 'file?name=[name].[ext]!../manifest.json';

// Import all the third party stuff.
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';
import configureStore from 'configureStore';

// Set up relay.
const environment = new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer('/graphql'));

const initialState = window.__INITIAL_STATE__; // eslint-disable-line no-underscore-dangle
const store = configureStore(initialState);

// Find the DOM node generated by the server.
const mountNode = document.getElementById('app');

// Encapsulate rendering for hot-reloading.
let render = () => require('./render').default(environment, store, browserHistory, mountNode);

if (module.hot) {

  // Add hot reloading of components and display an overlay for runtime errors.
  const renderApp = render;
  const renderError = (error) => {
    const RedBox = require('redbox-react');
    ReactDOM.render((<RedBox error={error} />), mountNode);
  };

  render = () => {
    try {
      renderApp();
    } catch (error) {
      renderError(error);
    }
  };

  module.hot.accept('./render', () => setTimeout(render));
}

// Do the initial rendering.
render();

if (__PRODUCTION__ && __CLIENT__ && window && window.location.hostname !== 'localhost') {

  // Install ServiceWorker and AppCache in the end since it's not the most
  // important operation and if main code fails, we do not want it installed.
  require('offline-plugin/runtime').install();

}
