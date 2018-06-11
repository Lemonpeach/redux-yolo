# hydrogen

Don't waste your time writing redux and react boilerplate.

[![Build Status](https://travis-ci.org/Lemonpeach/hydrogen.svg?branch=master)](https://travis-ci.org/Lemonpeach/hydrogen)

## Overview

Provides a suite of pluggable redux and react tools that aim to remove boilerplate through a set of minimal conventions.

## Packages

| package  | description  |
|---|---|
| [redux-hydrogen](packages/redux-hydrogen/README.md)  | A pluggable service layer that conventionalizes reducers, actions, and selectors. |
| [react-redux-hydrogen](packages/react-redux-hydrogen/README.md) | A set of HOCs that connect your components to state generated by `redux-hydrogen`. |
| [redux-hydrogen-feathers](packages/redux-hydrogen-feathers/README.md) | A [FeathersJS](https://feathersjs.com/) request adapter for `redux-hydrogen`.  |

## Example

The following is a non-exhaustive example of what is possible when using Hydrogen's suite of tools.

In this example:

- We have a REST endpoint that stores `tag` data.
  - A tag has a name and a date representing when it was created.
  - The `tags` endpoint exists at `${host}/tags` and our [FeathersJS client](https://github.com/feathersjs/client) is set up for us already.
- We want to build a component to list all `tags` created today, as well as a button that will add a new tag with a random name.

### Installation

```bash
npm install -D @hydrogenjs/redux-hydrogen @hydrogenjs/redux-hydrogen-feathers @hydrogenjs/react-redux-hydrogen
```

### Set Up

```js
// hydrogen.js
import createHydrogen from '@hydrogenjs/redux-hydrogen';
import feathersHydrogen from '@hydrogenjs/redux-hydrogen-feathers';
import create, { compose } from '@hydrogenjs/react-redux-hydrogen';

import client from './my-feathers-client';

const hydrogen = createHydrogen({ adapter: feathersHydrogen(client) });
const hydrogenize = create(hydrogen);

const { find, first, get } = hydrogenize;

export {
  find,
  first,
  get,
  compose,
  hydrogen
};
```

```js
// store.js
import { createStore, combineReducers } from 'redux';
import { reducer } from '@hydrogenjs/redux-hydrogen';

const combinedReducers = combineReducers({
  hydrogen: reducer // it must be mounted under 'hydrogen'
});

export const store = createStore(combinedReducers);
```

### Usage

```js
// my-component.js
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import sillyname from 'sillyname';

import { find, hydrogen, compose } from './hydrogen';

const enhance = compose(
  // find all tags where date is greater than 12 am today
  find('tags', 'tags', () = ({
    date: { $gt: moment.startOf('day').format() }
  })),
  // map dispatch to redux-hydrogen's create action
  connect(
    null,
    { createTag: hydrogen.service('tags').create }
  )
);

const Tags = enhance(({ createTag, tags }) => (
  <Fragment>
    <button
      onClick={e => {
        e.preventDefault();
        createTag({
          name: sillyname(),
          date: moment.format()
        });
      }}
    />
    {
      tags.map(t => (
        <Fragment>
          <span>{t.name}</span>
          <span>{t.date}</span>
        </Fragment>
      ))
    }
  </Fragment>
));
```

### Explanation

We wrap our component in two HOCs.

1. `find` from `react-redux-hydrogen`. In short, it will load all `tags` where their date is greater than 12 am today.
2. `connect` from `react-redux` which maps `redux-hydrogen`'s create action to dispatch.

The `find` HOC will load the `tags` resource into your component. It does this by attempting to select it from local `redux` state, and if not found, it will make a request through your configured request adapter to retrieve the data. It applies any query given to it (in its third function argment) to both filter the local state and as a query paramter to your backend.

In the background `redux-hydrogen` is managing the reducers, actions, and selectors that `react-redux-hydrogen` is using to load the `tags` resource.

**No other code** is required to manage your `tag` data through `redux` in your application.
