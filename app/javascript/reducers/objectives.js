import { fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import ActionTypes from '../constants/actionTypes';
import gon from '../utils/gon';

export default handleActions({
    [ActionTypes.FETCHED_OBJECTIVES]: (state, { payload }) => {
      return state.merge(payload.objectives);
    },
    [ActionTypes.ADDED_OBJECTIVE]: (state, { payload }) => {
      const ownerId = gon.getIn(['loginUser', 'ownerId']);
      return ownerId === payload.objective.get('ownerId') ? state.insert(0, payload.objective) : state
    },
    [ActionTypes.UPDATED_OBJECTIVE]: (state, { payload }) => {
      return state.set(state.findIndex((objective) => {
        return objective.get('id') === payload.objective.get('id');
      }), payload.objective);
    },
    [ActionTypes.REMOVED_OBJECTIVE]: (state, { payload }) => {
      return state.filter((objective) => {
        return objective.get('id') !== payload.id;
      }).map((objective) => {
        return objective.set('childObjectives', objective.get('childObjectives').filter((childObjective) => {
          return childObjective.get('id') !== payload.id;
        }));
      });
    },
    [ActionTypes.UPDATED_KEY_RESULT]: (state, { payload }) => {
      return state; // TODO: keyResultをstateへ反映させる処理の実装
    },
  },
  fromJS([]),
);
