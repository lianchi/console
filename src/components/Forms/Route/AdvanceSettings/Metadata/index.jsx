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

import { isEmpty, isUndefined } from 'lodash'
import React from 'react'
import { Form } from 'components/Base'
import { AnnotationsInput, PropertiesInput } from 'components/Inputs'
import { isValidLabel } from 'utils'

export default class Metadata extends React.Component {
  labelsValidator = (rule, value, callback) => {
    if (isUndefined(value)) {
      return callback()
    }
    if (isEmpty(value)) {
      return callback({ message: t('Labels cannot be empty') })
    }

    if (!isValidLabel(value)) {
      return callback({ message: t('LABEL_FORMAT_DESC') })
    }

    this.props.store
      .checkLabels({
        labels: value,
        namespace: this.props.namespace,
        cluster: this.props.cluster,
      })
      .then(resp => {
        if (resp.exist) {
          return callback({ message: t('Labels exists'), field: rule.field })
        }
        callback()
      })
  }

  render() {
    return (
      <>
        <Form.Item label={t('Annotations')}>
          <AnnotationsInput
            name="metadata.annotations"
            addText={t('Add Annotation')}
            hiddenKeys={globals.config.preservedAnnotations}
          />
        </Form.Item>
        <Form.Item
          label={t('Labels')}
          rules={[
            { required: true, message: t('Labels cannot be empty') },
            { validator: this.labelsValidator },
          ]}
        >
          <PropertiesInput
            name="metadata.labels"
            addText={t('Add Label')}
            readOnlyKeys={['app']}
          />
        </Form.Item>
      </>
    )
  }
}
