import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { default as TouchBackend } from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Objective from './Objective';

class ObjectiveList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDragging: false,
      objectiveOrder: JSON.parse(props.objectiveOrder || '[]'), // JSON Array to Array
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.objectiveOrder !== nextProps.objectiveOrder) {
      this.setState({ objectiveOrder: JSON.parse(nextProps.objectiveOrder) });
    }
  }

  moveBox = (dragIndex, hoverIndex) => {
    if (hoverIndex < 0 || this.state.objectiveOrder.length <= hoverIndex) {
      return;
    }
    const objectiveOrder = this.state.objectiveOrder;
    const dragId = objectiveOrder[dragIndex];
    objectiveOrder.splice(dragIndex, 1);
    objectiveOrder.splice(hoverIndex, 0, dragId)
    this.setState({ objectiveOrder });
  }

  updateObjectiveOrder = () => {
    const nextObjectiveOrder = JSON.stringify(this.state.objectiveOrder);
    if (this.props.objectiveOrder !== nextObjectiveOrder) {
      this.props.updateObjectiveOrder({
        id: this.props.userId,
        objectiveOrder: nextObjectiveOrder,
      });
    }
  }

  selectObjective = objective => {
    this.props.setMapObjective(objective);
    this.props.changeCurrentOkr(objective.get('id'));
  }

  render() {
    return (
      <div className={`objective-list ${this.state.isDragging ? 'is-dragging' : ''}`}>
        {this.props.objectives
          .sortBy(objective => this.state.objectiveOrder.indexOf(objective.get('id')))
          .map((objective, index) => {
            const objectiveId = objective.get('id');
            const isSelected = objectiveId === this.props.currentObjectiveId;
            return <Objective
              key={objectiveId}
              index={index}
              id={objectiveId}
              objective={objective}
              isSelected={isSelected}
              moveBox={this.moveBox}
              updateObjectiveOrder={this.updateObjectiveOrder}
              setDragging={isDragging => this.setState({ isDragging })}
              isSelectedLoginUser={this.props.isSelectedLoginUser}
              selectObjective={this.selectObjective.bind(this)} />
          })}
      </div>
    );
  }
}

ObjectiveList.propTypes = {
  objectives: PropTypes.object.isRequired,
  isSelectedLoginUser: PropTypes.bool.isRequired,
  setMapObjective: PropTypes.func.isRequired,
  objectiveOrder: PropTypes.string.isRequired,
  userId: PropTypes.number.isRequired,
};

const isTouchSupport = 'ontouchstart' in window;
const backend = isTouchSupport ? TouchBackend : HTML5Backend;

export default DragDropContext(backend)(ObjectiveList);
