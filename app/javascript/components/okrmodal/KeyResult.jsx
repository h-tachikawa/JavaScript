import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import { openKeyResult } from '../../utils/linker';
import { Segment, Icon } from 'semantic-ui-react';
import OwnerAvatar from '../util/OwnerAvatar';
import { onTouch } from '../../utils/backend';

const itemSource = {
  canDrag(props) {
    return props.canMoveKeyResult;
  },

  beginDrag(props) {
    props.setDragging(true);
    return {
      id: props.keyResult.get('id'),
      index: props.index,
    }
  },

  endDrag(props) {
    props.setDragging(false);
    props.updateKeyResultOrder();
  },
}

const collectSource = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const itemTarget = {
  hover(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    if (dragIndex !== hoverIndex) {
      props.moveKeyResult(dragIndex, hoverIndex);

      // https://github.com/react-dnd/react-dnd/blob/master/packages/documentation/examples/04%20Sortable/Simple/Card.js#L63
      monitor.getItem().index = hoverIndex;
    }
  },
}

const collectTarget = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
  }
}

class KeyResult extends Component {
  moveKeyResult(event, toUp) {
    const currentIndex = props.index;
    const nextIndex = toUp ? currentIndex - 1 : currentIndex + 1;
    this.props.replaceKeyResults(currentIndex, nextIndex);
    setTimeout(() => this.props.updateKeyResultOrder(), 0);
    event.stopPropagation();
  }

  keyResultHtml() {
    const {
      keyResult,
      isSelected,
      canMoveKeyResult,
      isDragging,
      canDrop,
    } = this.props;
    // Wrap Segment by div because only native element nodes can now be passed to React DnD connectors
    return (
      <div className="sidebar__item-wrapper">
        <Segment
          className={`sidebar__item ${isSelected ? 'is-current' : ''} ${isDragging ? 'drag' : ''} ${canDrop ? 'drop' : ''} ${onTouch ? 'touch' : ''}`}
          key={keyResult.get('id')} onClick={() => openKeyResult(keyResult.get('id'))}
        >
          <span className="sidebar__avatar">
            <OwnerAvatar owner={keyResult.get('owner')} members={keyResult.get('keyResultMembers')} />
          </span>
          <span className="sidebar__name">{keyResult.get('name')}</span>
          <span className="progress-rate sidebar__progress">{keyResult.get('progressRate')}%</span>
          {canMoveKeyResult && (
            <div className="sidebar__swap-icons">
              <Icon name='arrow circle up' size='large' color='grey' fitted className='swap-up'
                    onClick={event => this.moveKeyResult(event, true)} />
              <Icon name='arrow circle down' size='large' color='grey' fitted className='swap-down'
                    onClick={event => this.moveKeyResult(event, false)} />
            </div>
          )}
        </Segment>
      </div>
    )
  }

  render() {
    const {
      connectDragSource,
      connectDropTarget,
    } = this.props;
    return connectDragSource(connectDropTarget(this.keyResultHtml()));
  }
}

KeyResult.propTypes = {
  index: PropTypes.number.isRequired,
  keyResult: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  setDragging: PropTypes.func,
  canMoveKeyResult: PropTypes.bool.isRequired,
  moveKeyResult: PropTypes.func.isRequired,
  updateKeyResultOrder: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
};

export default DropTarget('item', itemTarget, collectTarget)(DragSource('item', itemSource, collectSource)(KeyResult));
