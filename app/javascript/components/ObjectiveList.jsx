import React, { Component } from 'react';
import PropTypes from 'prop-types';
import OkrPieChart from './OkrPieChart';

class ObjectiveList extends Component {

  selectObjective = objective => {
    this.props.onSelectObjective(objective);
    this.props.changeCurrentObjective(objective.get('id'));
  }

  ellipsis(text, displayTextNum) {
    if (text.length <= displayTextNum) {
      return text;
    }
    return text.split("").splice(0, displayTextNum).join("") + "…";
  }

  render() {
    return (
      <div className="objective-list">
        {
          this.props.objectives.map((objective) => {
            const isSelected = objective.get('id') === this.props.currentObjectiveId;
            return (
              <a className={`objective-box ${isSelected ? 'active' : ''}`} key={objective.get('id')}
                 href="javascript:void(0)" onClick={() => this.selectObjective(objective)}>
                <div className='name'>{this.ellipsis(objective.get('name'), 31)}</div>
                <OkrPieChart objective={objective} />
              </a>
            );
          })}
      </div>
    );
  }
}

ObjectiveList.propTypes = {
  objectives: PropTypes.object.isRequired,
  onSelectObjective: PropTypes.func.isRequired,
};

export default ObjectiveList;