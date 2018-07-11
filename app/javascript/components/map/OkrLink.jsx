import React, { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Icon } from 'semantic-ui-react';
import { List } from 'immutable'
import OkrPath from '../../containers/OkrPath'

class OkrLink extends PureComponent {

  static CARD_MARGIN = 24; // OKR カード余白 (= 折れ線の段差の高さ、折り畳まれた線分の長さ)
  static POINT_ZERO = { x: 0, y: 0 }

  constructor(props) {
    super(props);
    this.state = {
      iconTopDiff: 0,
      iconLeftDiff: 0,
      ...this.updateOkrLink(props),
    }
  }

  componentDidMount() {
    const icon = findDOMNode(this.icon);
    this.setState({
      iconTopDiff: icon.offsetHeight / 2,
      iconLeftDiff: icon.offsetWidth / 2,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fromRef !== nextProps.fromRef || this.props.paths !== nextProps.paths) {
      this.setState(this.updateOkrLink(nextProps))
    }
  }

  updateOkrLink = ({ fromRef, paths }) => {
    let collapsedParent = false
    let expandedChild = false

    let fromPoint
    if (fromRef) {
      const element = findDOMNode(fromRef)
      const x = element.offsetLeft + (element.offsetWidth / 2)
      fromPoint = { x, y: element.offsetTop + element.offsetHeight }
    } else {
      fromPoint = OkrLink.POINT_ZERO
      collapsedParent = true
    }

    expandedChild = paths.some(path => path.toRefs.some(toRef => !!toRef))
    const newPaths = paths.flatMap(path => path.toRefs.reduce((result, toRef, index) => {
      let toPoint
      if (toRef) {
        const element = findDOMNode(toRef)
        const x = element.offsetLeft + (element.offsetWidth / 2)
        toPoint = { x, y: element.offsetTop }
      } else if (!expandedChild) {
        toPoint = OkrLink.POINT_ZERO // 全パスが折り畳まれている場合
      }
      if (toPoint) {
        result = result.push({ fromKeyResultId: path.fromKeyResultId, toObjectiveId: path.toIds.get(index), toPoint })
      }
      return result
    }, List()))

    return {
      fromPoint,
      paths: newPaths,
      toAncestor: collapsedParent,
      isExpanded: !collapsedParent && expandedChild,
    }
  }

  getIconStyle() {
    const { fromPoint: from, paths, isExpanded, toAncestor } = this.state
    const to = paths.first().toPoint
    const [x, y] = isExpanded
      ? [from.x, to.y - OkrLink.CARD_MARGIN]
      : toAncestor
        ? [to.x, to.y - OkrLink.CARD_MARGIN]
        : [from.x, from.y + OkrLink.CARD_MARGIN]
    const { iconTopDiff, iconLeftDiff } = this.state
    return { top: y - iconTopDiff, left: x - iconLeftDiff }
  }

  handleIconRef = node => this.icon = node

  handleIconClick = () => {
    const { fromId, paths } = this.props
    const { toAncestor, isExpanded } = this.state
    const objectiveId = fromId
    const keyResultIds = paths.map(path => path.fromKeyResultId).toSet()
    this.props.onToggleObjective(toAncestor, isExpanded, objectiveId, keyResultIds)
  }

  render() {
    const { fromPoint, paths, isExpanded, toAncestor } = this.state
    return (
      <div className='okr-link'>
        <svg>
          {paths.map((path, key) => (
            <OkrPath
              {...path}
              key={key}
              fromPoint={fromPoint}
              isExpanded={isExpanded}
              toAncestor={toAncestor}
            />
          ))}
        </svg>
        <Icon
          link
          name={`${isExpanded ? 'minus' : 'plus'} square outline`}
          size='large'
          ref={this.handleIconRef}
          fitted
          style={this.getIconStyle()}
          onClick={this.handleIconClick}
        />
      </div>
    );
  }
}

OkrLink.propTypes = {
  // container
  // component
  fromId: PropTypes.number,
  fromRef: PropTypes.object,
  paths: ImmutablePropTypes.list.isRequired,
  onToggleObjective: PropTypes.func.isRequired,
};

export default OkrLink;
