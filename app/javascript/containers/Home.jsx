import Home from '../components/Home';
import { connect } from 'react-redux';
import { hashids, OKR_TYPE_ID } from '../utils/hashids';
import objectiveActions from '../actions/objectives';
import keyResultActions from '../actions/keyResults';
import dialogActions from '../actions/dialogs';
import currentActions from '../actions/current';
import { denormalizeObjective, denormalizeObjectives, denormalizeKeyResults } from "../schemas";

const mapStateToProps = (state, { match: { params } }) => {
  const objectiveIds = state.objectives.get('ids');
  const fetchedKeyResultId = state.keyResults.get('fetchedKeyResult');
  const isFetchingKeyResult = state.keyResults.get('isFetchingKeyResult');
  const isFetchingObjective = state.objectives.get('isFetchingObjective');
  const fetchedObjectiveId = state.objectives.get('fetchedObjective');
  const fetchedObjective = fetchedObjectiveId > 0 && denormalizeObjective(fetchedObjectiveId, state.entities);
  const allObjectives = denormalizeObjectives(state.objectives.get('ids'), state.entities);
  const allKeyResults = denormalizeKeyResults(state.keyResults.get('allIds'), state.entities);
  const [okrTypeId, okrId] = hashids.decode(params.okrHash);
  let objectiveId = okrTypeId === OKR_TYPE_ID.OBJECTIVE ? okrId : null;
  const keyResultId = okrTypeId === OKR_TYPE_ID.KEY_RESULT ? okrId : null;
  const okrType = okrTypeId === OKR_TYPE_ID.OBJECTIVE ? 'objective' : okrTypeId === OKR_TYPE_ID.KEY_RESULT ? 'keyResult' : null;
  let objectiveIdOfRemovedKeyResult = false;
  let isRemovedObjective = false;
  
  const hasOkrModalResource = params.okrHash && !allObjectives.isEmpty() && !allKeyResults.isEmpty();
  let canDisplayOkrModal;
  let needFetchKeyResult;
  let needFetchObjective;
  if(hasOkrModalResource) {
    const currentObjectiveId = state.dialogs.getIn(['okrForm', 'objectiveId']);
    let targetObjective = null;
    let targetKeyResults = null;

    if (keyResultId) {
      targetKeyResults = allKeyResults.find(item => item.get('id') === keyResultId);
      needFetchKeyResult = !targetKeyResults && !fetchedKeyResultId && !isFetchingKeyResult;
      if(targetKeyResults) {
        objectiveId = targetKeyResults.get('objectiveId')
      }
      // if(targetKeyResults) {
      //   objectiveId = targetKeyResults.get('objectiveId')
      // } else {
      //   objectiveIdOfRemovedKeyResult = currentObjectiveId
      // }
    }

    if (objectiveId) {
      targetObjective = allObjectives.find(item => item.get('id') === objectiveId);
      needFetchObjective = !targetObjective && !fetchedObjectiveId && !isFetchingObjective;
    }
    // isRemovedObjective = objectiveId && objectiveId === currentObjectiveId && !fetchedObjective;
    // cannotDisplayOkrModal = !targetObjective || (keyResultId && !targetKeyResults);
    canDisplayOkrModal = targetObjective || (keyResultId && targetKeyResults);
  }


  return {
    okrType,
    objectiveId,
    keyResultId,
    hasOkrModalResource,
    canDisplayOkrModal,
    isRemovedObjective,
    needFetchKeyResult,
    needFetchObjective,
    objectiveIdOfRemovedKeyResult,
    okrPeriodId: state.current.get('okrPeriodId'),
    userId: state.current.get('userId'),
    objectiveIds: objectiveIds,
    objectives: denormalizeObjectives(objectiveIds, state.entities),
    keyResults: denormalizeKeyResults(state.keyResults.get('ids'), state.entities),
    isFetched: state.objectives.get('isFetched'),
    fetchedObjectiveId,
    fetchedObjective,
    entities: state.entities,
    isOpenOkrModal: state.dialogs.getIn(['okrForm', 'isOpen']),
    isOpenErrorModal: state.dialogs.getIn(['error', 'isOpen']),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchOkrs: (okrPeriodId, userId, withAllKeyResults) => {
      dispatch(objectiveActions.fetchOkrs(okrPeriodId, userId, withAllKeyResults));
    },
    fetchObjective: (objectiveId) => {
      dispatch(objectiveActions.fetchObjective(objectiveId));
    },
    fetchKeyResult: (keyResultId) => {
      dispatch(keyResultActions.fetchKeyResult(keyResultId));
    },
    resetKeyResult: () => {
      dispatch(keyResultActions.resetKeyResult());
    },
    openErrorModal: (messages) => {
      dispatch(dialogActions.openErrorModal(messages))
    },
    openOkrModal: (objectiveId, okrType) => {
      dispatch(dialogActions.openOkrModal(objectiveId, okrType));
    },
    openObjectiveModal: () => {
      dispatch(dialogActions.openObjectiveModal());
    },
    changeCurrentOkr: objectiveId => {
      dispatch(currentActions.changeCurrentOkr(objectiveId));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
