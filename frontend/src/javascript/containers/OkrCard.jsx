import { connect } from "react-redux";
import { List } from "immutable";
import OkrCard from "../components/map/OkrCard";
import dialogActions from "../actions/dialogs";
import currentActions from "../actions/current";

const mapStateToProps = (state, { objective }) => {
  const selectedOkr = state.current.get("selectedOkr");
  const highlightedOkr = state.current.get("highlightedOkr");
  return {
    selectedObjectiveId: selectedOkr.get("objectiveId"),
    selectedKeyResultId: selectedOkr.get("keyResultId"),
    highlightedObjectiveIds: highlightedOkr.get("objectiveIds"),
    highlightedKeyResultId: highlightedOkr.get("keyResultId"),
    visibleKeyResultIds: state.current.getIn(["mapOkr", objective.get("id")]),
  };
};

const mapDispatchToProps = dispatch => ({
  openKeyResultModal: objective => {
    dispatch(dialogActions.openKeyResultModal(objective));
  },
  highlightObjective: objective => {
    dispatch(
      currentActions.highlightOkr(
        List.of(objective.get("id")),
        objective.get("parentKeyResultId"),
      ),
    );
  },
  highlightKeyResult: keyResult => {
    dispatch(
      currentActions.highlightOkr(
        keyResult.get("childObjectiveIds"),
        keyResult.get("id"),
      ),
    );
  },
  unhighlightOkr: () => {
    dispatch(currentActions.unhighlightOkr());
  },
  toggleKeyResult: (objective, keyResult, isExpanded) => {
    const objectiveId = objective.get("id");
    const keyResultId = keyResult.get("id");
    if (isExpanded) {
      dispatch(
        currentActions.collapseKeyResult(
          objectiveId,
          keyResultId,
          keyResult.get("childObjectiveIds"),
        ),
      );
    } else {
      dispatch(
        currentActions.expandKeyResult(
          objectiveId,
          keyResultId,
          objective.get("parentKeyResultId"),
        ),
      );
    }
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OkrCard);