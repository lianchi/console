/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import PropTypes from 'prop-types'
import copy from 'fast-copy'

import { Input, Columns, Column } from '@pitrix/lego-ui'
import { Modal, Form } from 'components/Base'

import styles from './index.scss'

export default class OAuthModal extends React.Component {
  static propTypes = {
    detail: PropTypes.object,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    isSubmitting: PropTypes.bool,
  }

  static defaultProps = {
    visible: false,
    onOk() {},
    onCancel() {},
    isSubmitting: false,
  }

  constructor(props) {
    super(props)

    this.state = {
      formData: copy(props.detail),
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.visible && this.props.visible !== prevProps.visible) {
      this.setState({ formData: copy(this.props.detail) })
    }
  }

  render() {
    const { visible, isSubmitting, onOk, onCancel } = this.props
    const { formData } = this.state

    return (
      <Modal.Form
        data={formData}
        width={960}
        title={'OAuth'}
        description={t('OAUTH_DESC')}
        icon="safe-notice"
        onOk={onOk}
        onCancel={onCancel}
        visible={visible}
        isSubmitting={isSubmitting}
      >
        <Columns className={styles.content}>
          <Column>
            <Form.Item
              label={t('Name')}
              rules={[{ required: true, message: t('Please input name') }]}
            >
              <Input name="name" />
            </Form.Item>
            <Form.Item
              label={t('Client ID')}
              rules={[{ required: true, message: t('Please input client id') }]}
            >
              <Input name="clientID" />
            </Form.Item>
          </Column>
          <Column>
            <Form.Item
              label={t('Server Address')}
              rules={[
                { required: true, message: t('Please input server address') },
              ]}
            >
              <Input name="server" />
            </Form.Item>
            <Form.Item label={t('Client Secret')}>
              <Input name="secret" />
            </Form.Item>
          </Column>
        </Columns>
      </Modal.Form>
    )
  }
}
