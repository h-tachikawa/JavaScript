import { PureComponent } from 'react'
import PropTypes from 'prop-types'

class SortableComponent extends PureComponent {

  constructor(props) {
    super(props)
    const { key, getItems } = props
    this.state = {
      column: null,
      direction: null,
      [key]: getItems(props),
    }
  }

  componentWillReceiveProps(nextProps) {
    const { key, getItems } = this.props
    if (this.props[key] !== nextProps[key]) {
      this.setState({ [key]: this.sort(getItems(nextProps), this.state.column, this.state.direction) })
    }
  }

  sort = (items, column, direction) => {
    if (!column) return items

    const sortedItems = items.sort((a, b) => {
      if (typeof a.get(column) === 'string') {
        return a.get(column).localeCompare(b.get(column))
      } else {
        if (a.get(column) < b.get(column)) return -1
        if (a.get(column) > b.get(column)) return 1
        if (a.get(column) === b.get(column)) return 0
      }
    })
    return direction === 'ascending' ? sortedItems : sortedItems.reverse()
  }

  handleSort = newColumn => () => {
    const { key } = this.props
    const { column, direction } = this.state
    const newDirection = column !== newColumn ? 'ascending' : direction === 'ascending' ? 'descending' : 'ascending'
    this.setState({
      column: newColumn,
      direction: newDirection,
      [key]: this.sort(this.state[key], newColumn, newDirection),
    })
  };

  isSorted = newColumn => this.state.column === newColumn ? this.state.direction : null
}

SortableComponent.propTypes = {
  // component
  key: PropTypes.string.isRequired,
  getItems: PropTypes.func,
}

SortableComponent.defaultProps = {
  getItems: props => props[props.key],
}

export default SortableComponent
