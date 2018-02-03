import { createActions } from 'redux-actions';
import actionTypes from '../constants/actionTypes';

const actions = createActions({
  [actionTypes.OPEN_CONFIRM]: (confirmParams) => {
    return { confirmParams };
  },
  [actionTypes.CLOSE_CONFIRM]: () => {},
});

export default actions;