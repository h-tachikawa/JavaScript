import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Tab, Input, Button, Divider } from 'semantic-ui-react';
import UsersTable from './UsersTable';
import UserAddForm from './UserAddForm'

class UserSettingTab extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      showDisabledUsers: false,
    };
  }

  handleKeywordChange = (e, { value }) => this.setState({ keyword: value })

  handleShowDisabledUsersClick = () => this.setState({ showDisabledUsers: true })

  render() {
    if (this.props.users.size === 0) return null;
    const enabledUsers = this.props.users.filter(user => !user.get('disabled'));
    const disabledUsers = this.props.users.filter(user => user.get('disabled'));
    return (
      <Tab.Pane attached={false} className="user-setting-tab">
        <UserAddForm addUser={this.props.addUser} confirm={this.props.confirm} />

        <Input icon="search" placeholder="ユーザーを検索&#8230;" onChange={this.handleKeywordChange} />

        <UsersTable
          users={enabledUsers}
          loginUserId={this.props.loginUserId}
          onUpdateUser={this.props.updateUser}
          onUpdateEmail={this.props.updateEmail}
          onResendEmail={this.props.resendEmail}
          onRemove={this.props.removeUser}
          confirm={this.props.confirm}
          keyword={this.state.keyword}
        />

        <Divider />

        {disabledUsers.size > 0 && (
          this.state.showDisabledUsers ?
            <div>
              <h3>無効なユーザー</h3>
              <UsersTable
                users={disabledUsers}
                onRestore={this.props.restoreUser}
                confirm={this.props.confirm}
                keyword={this.state.keyword}
              />
            </div>
            :
            <Button content="無効なユーザーを表示する" onClick={this.handleShowDisabledUsersClick} />
        )}
      </Tab.Pane>
    );
  }
}

UserSettingTab.propTypes = {
  // container
  loginUserId: PropTypes.number.isRequired,
  organization: ImmutablePropTypes.map.isRequired,
  users: ImmutablePropTypes.list.isRequired,
  addUser: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired,
  updateEmail: PropTypes.func.isRequired,
  removeUser: PropTypes.func.isRequired,
  restoreUser: PropTypes.func.isRequired,
  resendEmail: PropTypes.func.isRequired,
  confirm: PropTypes.func.isRequired,
  // component
};

export default UserSettingTab;