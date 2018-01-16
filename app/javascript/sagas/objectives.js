import { all, put, takeLatest } from 'redux-saga/effects';
import call from '../utils/call';
import API from '../utils/api';
import objectiveActions from '../actions/objectives';
import dialogActions from '../actions/dialogs';
import actionTypes from '../constants/actionTypes';
import withLoading from '../utils/withLoading';

function* fetchObjective({payload}) {
  const result = yield call(API.get, '/objectives/' + payload.id);
  yield put(objectiveActions.fetchedObjective(result.get('objective')));
}

function* fetchObjectives({payload}) {
  const result = yield call(API.get, '/objectives', { okrPeriodId: payload.okrPeriodId, userId: payload.userId });
  yield put(objectiveActions.fetchedObjectives(result.get('objectives')));
}

function* addObjective({ payload }) {
  const result = yield call(API.post, '/objectives', { objective: payload.objective });
  yield put(objectiveActions.addedObjective(result.get('objective'), payload.currentUserId));
  yield put(dialogActions.closeObjectiveFormModal());
}

function* updateObjective({payload}) {
  const result = yield call(API.put, '/objectives/' + payload.objective.id, payload);
  yield put(objectiveActions.updatedObjective(result.get('objective'), payload.currentUserId));
}

function* removeObjective({payload}) {
  yield call(API.delete, '/objectives/' + payload.id);
  yield put(objectiveActions.removedObjective(payload.id));
}

export function *objectiveSagas() {
  yield all([
    takeLatest(actionTypes.FETCH_OBJECTIVE, withLoading(fetchObjective)),
    takeLatest(actionTypes.FETCH_OBJECTIVES, withLoading(fetchObjectives)),
    takeLatest(actionTypes.ADD_OBJECTIVE, withLoading(addObjective)),
    takeLatest(actionTypes.UPDATE_OBJECTIVE, withLoading(updateObjective)),
    takeLatest(actionTypes.REMOVE_OBJECTIVE, withLoading(removeObjective)),
  ]);
}
