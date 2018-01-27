import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { Input, Form, Icon, Popup, Button, TextArea, List } from 'semantic-ui-react';
import DatePicker from '../DatePicker';
import EditableText from '../utils/EditableText';
import EditableMultiLineText from '../utils/EditableMultiLineText';
import UserSelectBox from '../UserSelectBox';
import KeyResultMemberSelectBox from '../KeyResultMemberSelectBox';
import br from '../../utils/br';
import moment from 'moment';

class KeyResultDetail extends Component {
  constructor(props) {
    super(props);

    this.isMouseDown = false;
    this.progressIntervalTimerId = null;
    this.progressTimerId = null;
    this.requestInterval = null;
    this.REQUEST_DELAY_TIME = 200;
    this.RECALC_INTERVAL_TIME = 600;
    this.REQUEST_INTERVAL_TIME = 1000;
    if (props.keyResult) {
      const keyResultMembers = props.keyResult.get('keyResultMembers').map(item => item.get('id')).toArray();
      this.state = {
        isDisplayedTargetValue: !!props.keyResult.get('targetValue'),
        sliderValue: props.keyResult.get('progressRate'),
        expiredDate: moment(props.keyResult.get('expiredDate')),
        isDisplayedRateInputForm: false,
        keyResultMembers,
      };
    }
   
  }

  addKeyResultMembers(value) {
    this.updateKeyResult({
      keyResultMember: {user: value, behavior: 'add', role: 'member'}
    });
  }

  removeKeyResultMembers(value) {
    this.updateKeyResult({
      keyResultMember: {user: value, behavior: 'remove'}
    });
  }

  changeKeyResultOwner(value) {
    this.updateKeyResult({
      keyResultMember: {user: value, behavior: 'add', role: 'owner'}
    });
  }

  handleSliderChange(event) {
    this.setState({
      sliderValue: event.target.value,
    });
  }

  handleSliderValue(event) {
    this.updateKeyResult({ progressRate: Number(event.target.value) });
  }

  updateValues(targetValue, actualValue) {
    if (targetValue && actualValue) {
      this.updateKeyResult({
        targetValue: targetValue,
        actualValue: actualValue,
        progressRate: Math.round(actualValue / targetValue * 100),
      });
    } else {
      this.updateKeyResult({
        targetValue: targetValue,
        actualValue: actualValue,
      });
    }
  }

  updateKeyResult(values) {
    this.props.updateKeyResult({ id: this.props.keyResult.get('id'), ...values });
  }

  removeKeyResult(id) {
    this.props.confirm({
      content: "Key Result を削除しますか？",
      onConfirm: () => this.props.removeKeyResult({id}),
    });
  }

  handleCalendar(value) {
    this.setState({
      expiredDate: value
    });
    this.updateKeyResult({ expiredDate: value.format() });
  }

  handleRateViewClick() {
    this.setState({
      isDisplayedRateInputForm: true,
    });
    
    setTimeout(() => {
      findDOMNode(this.refs.progressRateView).focus();
    }, 0)
  }

  handleRateInputBlur(event) {
    this.updateKeyResult({ progressRate: Number(event.target.value) });
    this.setState({
      isDisplayedRateInputForm: false,
      sliderValue: event.target.value,
    });
  }

  commentList(comments) {
    const commentTags = comments.map((item) => {
      return (
        <div className="comments" key={item.get('id')}>
          <div className="comments__item">
            {item.get('editable') ? (
                <EditableMultiLineText className="comments__item-text" value={item.get('text')} saveValue={(text) => this.editComment(item.get('id'), text)}/>
              ) : (
                <div className="comments__item-text is-others">{ br(item.get('text'))}</div>
              )

            }
            <div className="comments__item-meta">
              <div className="comments__item-updated">{moment(item.get('updatedAt')).format('YYYY/MM/DD HH:mm')}</div>
              <div className="comments__item-name">{item.get('fullName')}</div>
              {item.get('editable') && <Icon name="trash" className="comments__item-icon" onClick={() => {this.removeComment(item.get('id'))}} />}
            </div>
          </div>
        </div>
      )
    });
    return <div>{commentTags}</div>;
  }

  addComment() {
    const value = findDOMNode(this.refs.commentArea).value;
    if (!value) {
      return;
    }
    this.updateKeyResult({
      comment: {data: value, behavior: 'add'}
    });
    findDOMNode(this.refs.commentArea).value = '';
  }

  editComment(id, text) {
    if (!text) {
      return;
    }
    this.updateKeyResult({
      comment: {data: {id, text}, behavior: 'edit'}
    });
  }

  removeComment(id) {
    this.props.confirm({
      content: 'コメントを削除しますか？',
      onConfirm: () => {
        this.updateKeyResult({
          comment: { data: id, behavior: 'remove' }
        });
      },
    })
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.keyResult) {
      return;
    }
    const keyResultMembers = nextProps.keyResult.get('keyResultMembers').map(item => item.get('id')).toArray();
    let isChangedProgressRate = true;
    if (this.props.keyResult) {
      isChangedProgressRate = nextProps.keyResult.get('progressRate') !== this.props.keyResult.get('progressRate');
    }
    this.setState({
      isDisplayedTargetValue: !!nextProps.keyResult.get('targetValue'),
      sliderValue: isChangedProgressRate ? nextProps.keyResult.get('progressRate'): this.state.sliderValue,
      expiredDate: moment(nextProps.keyResult.get('expiredDate')),
      isDisplayedRateInputForm: false,
      keyResultMembers,
    });
  }

  getNextProgressValue(upOrDown) {
    let value = Math.min(this.state.sliderValue + 1, 100);
    if (upOrDown === 'down'){
      value = Math.max(this.state.sliderValue - 1, 0);
    }
    
    return value;
  }

  handleProgressMouseDown(upOrDown) {
    if (!upOrDown) {
      return;
    }
    this.isMouseDown = true; 
    const value = this.getNextProgressValue(upOrDown);
    if (value === this.state.sliderValue) {
      return;
    }
    this.changeSliderValue(value);
    setTimeout(() => {
      if(!this.isMouseDown) {return}
      clearInterval(this.progressIntervalTimerId);
      this.progressIntervalTimerId = setInterval(() => {
        this.changeSliderValue(this.getNextProgressValue(upOrDown));
      }, 30);
    }, this.RECALC_INTERVAL_TIME);
  }

  handleProgressMouseUp() {
    this.isMouseDown = false;
    clearInterval(this.progressIntervalTimerId);
    if (this.state.sliderValue === this.props.keyResult.get('progressRate')) {
      return;
    }
    this.changeProgressRateThrottle(this.state.sliderValue);
  }

  changeSliderValue(value) {
    this.setState({
      sliderValue: value
    });
  }

  changeProgressRateThrottle(value) {
    const interval = new Date().getTime() - this.requestInterval;
    if (interval <= this.REQUEST_INTERVAL_TIME) {
      this.requestInterval = new Date().getTime();
      clearTimeout(this.progressTimerId);
      this.progressTimerId = setTimeout(() => {
        this.updateKeyResult({ progressRate: value });
      }, this.REQUEST_INTERVAL_TIME);
      return;
    }
    this.requestInterval = new Date().getTime();
    this.progressTimerId = setTimeout(() => {
      this.updateKeyResult({ progressRate: value });
    }, this.REQUEST_DELAY_TIME);
  }


  childObjectivesTag(childObjectives) {
    if(childObjectives.isEmpty()) {return null;}

    const list = childObjectives.map(item => {
      return <List.Item key={item.get('id')}>{item.get('name')}</List.Item>
    })
    
    return (
      <div className="navi is-down">
        <div><Icon name="arrow down" />下位 Objective</div>
        <List bulleted>
          {list}
        </List>
      </div>
    );
  }

  render() {
    const keyResult = this.props.keyResult;
    if (!keyResult) {
      return null;
    }

    return (
      <Form>
        <Form.Field className='values'>
          <label className="field-title">Key Result</label>
          <EditableText value={keyResult.get('name')} saveValue={value => this.updateKeyResult({ name: value })}/>
        </Form.Field>

        {this.state.isDisplayedTargetValue && 
          <Form.Field className='values'>
            <label className="field-title">目標値</label>
            <EditableText placeholder="目標値" value={keyResult.get('targetValue') || ''} saveValue={(value) => this.updateValues(value, keyResult.get('actualValue'))}/>
            <EditableText placeholder="単位" value={keyResult.get('valueUnit') || ''} saveValue={(value) => this.updateKeyResult({ valueUnit: value })}/>
            <br />
            <label className="field-title">実績値</label>
            <EditableText placeholder="実績値"　value={keyResult.get('actualValue') || ''} saveValue={(value) => this.updateValues(keyResult.get('targetValue'), value)}/>
            {keyResult.get('actualValue') ? keyResult.get('valueUnit') : ''}
          </Form.Field>
        }
        {!this.state.isDisplayedTargetValue && 
          <Form.Group>
            <Form.Field>
              <Button content="目標値を設定する" onClick={() => this.setState({isDisplayedTargetValue: true})} />
            </Form.Field>
          </Form.Group>
        }

        <Form.Field className='values progress-rate-field'>
          <label className="field-title">Key Result の進捗</label>
          {this.state.isDisplayedRateInputForm && 
            <div className="progress-rate-input">
              <div className="progress-rate-input__inner">
                <Input type="number" 
                      defaultValue={keyResult.get('progressRate')} 
                      onBlur={this.handleRateInputBlur.bind(this)} 
                      max="100"
                      min="0"
                      ref="progressRateView"
                /> %
              </div>
            </div>
          }
          {!this.state.isDisplayedRateInputForm && 
            <span>
              <div className='progress-rate is-slider-screen' onClick={this.handleRateViewClick.bind(this)}>{this.state.sliderValue}%</div>
              <div className='slider-box'>
                <div className='slider-box__wrapper'>
                  <div className='slider-box__content slider-box__icon'><Icon name="minus square" onMouseDown={() => {this.handleProgressMouseDown('down')}} onMouseUp={this.handleProgressMouseUp.bind(this)} /></div>
                  <div className='slider slider-box__content'>
                    <input type='range' min='0' max='100' value={this.state.sliderValue} onChange={this.handleSliderChange.bind(this)} step='1'
                        data-unit='%' onMouseUp={this.handleSliderValue.bind(this)}/>
                  </div>
                  <div className='slider-box__content slider-box__icon'><Icon name="plus square" onMouseDown={() => {this.handleProgressMouseDown('up')}} onMouseUp={this.handleProgressMouseUp.bind(this)} /></div>
                </div>
              </div>
            </span>
          }
          {keyResult.get('isProgressRateLinked')
            ? <Popup trigger={<Icon name='linkify' />} content='下位 Objective の進捗率とリンクしています' />
            : <Popup trigger={<Icon name='unlinkify' />} content='下位 Objective の進捗率とはリンクしていません' />
          }
        </Form.Field>
        
        <Form.Field className='values input-date-picker'>
          <label className="field-title">期限</label>
          <DatePicker dateFormat="YYYY/MM/DD" locale="ja" selected={this.state.expiredDate} onChange={this.handleCalendar.bind(this)} />
        </Form.Field>
        <Form.Group>
          <Form.Field>
            <label className="field-title">責任者</label>
            <UserSelectBox
              users={this.props.users}
              defaultValue={keyResult.get('owner').get('id')}
              onChange={(value) => this.changeKeyResultOwner(value)}
            />
          </Form.Field>
        </Form.Group> 
        <Form.Group>
          <Form.Field>
            <label className="field-title">関係者</label>
            <KeyResultMemberSelectBox 
              users={this.props.users}
              keyResultMembers={this.state.keyResultMembers}
              ownerId={keyResult.get('owner').get('id')}
              add={this.addKeyResultMembers.bind(this)}
              remove={this.removeKeyResultMembers.bind(this)}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group>
          <Form.Field className="wide-field">
            <label className="field-title">コメント</label>
            <div className="comments__text-box">
              <TextArea autoHeight defaultValue="" style={{ minHeight: 80 }} placeholder='進捗状況や、次のアクションなどをメモしてください' ref="commentArea" />
            </div>
            <Button content="投稿する" onClick={() => this.addComment()} as="div" />
            {this.commentList(keyResult.get('comments'))}
          </Form.Field>
        </Form.Group>
        <Form.Group>
          <Form.Field className="delete-button">
            <Button content="削除する" onClick={() => {this.removeKeyResult(keyResult.get('id'))}} as="span" negative />
            <Button content="下位 OKR を作成する" onClick={() => {this.props.changeToObjectiveModal(keyResult)}} as="span" positive />
          </Form.Field>
        </Form.Group>

        {this.childObjectivesTag(keyResult.get('childObjectives'))}
      </Form>
    );
  }
}

KeyResultDetail.propTypes = {
  users: PropTypes.object,
  keyResult: PropTypes.object,
  updateKeyResult: PropTypes.func,
  removeKeyResult: PropTypes.func,
  changeToObjectiveModal: PropTypes.func,
};

export default KeyResultDetail;
