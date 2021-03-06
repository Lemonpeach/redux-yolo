import { verbs, bindActionCreators } from 'actions';

const thunk = (name, adapter, verb, isQuery, ...args) => dispatch => {
  const { pending, fulfilled, rejected } = bindActionCreators(verb, name);
  const method = verb.toLowerCase();
  dispatch(pending());
  return adapter[method](...args)
    .then(response => dispatch(fulfilled(response, isQuery ? args[0] : null)))
    .catch(err => { dispatch(rejected(err)); return Promise.reject(err); });
};

export const createService = (name, adapter) => ({
  get: thunk.bind(null, name, adapter, verbs.GET, true),
  find: thunk.bind(null, name, adapter, verbs.FIND, true),
  first: thunk.bind(null, name, adapter, verbs.FIRST, true),
  create: thunk.bind(null, name, adapter, verbs.CREATE, false),
  update: thunk.bind(null, name, adapter, verbs.UPDATE, false),
  patch: thunk.bind(null, name, adapter, verbs.PATCH, false),
  remove: thunk.bind(null, name, adapter, verbs.REMOVE, false),
  upsert(data, query) {
    return dispatch => this.find(query)(dispatch).then(result => {
      if (result.data.length > 0) {
        return this.patch(result.data[0].id, data, query)(dispatch);
      }
      return this.create(data)(dispatch);
    });
  }
});
