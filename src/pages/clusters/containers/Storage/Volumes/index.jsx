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
 *
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import { isEmpty } from 'lodash'
import { getLocalTime, getDisplayName } from 'utils'
import withList, { ListPage } from 'components/HOCs/withList'
import ResourceTable from 'clusters/components/ResourceTable'
import VolumeStore from 'stores/volume'
import { getVolumeStatus } from 'utils/status'
import StatusReason from 'projects/components/StatusReason'

import { Avatar, Status } from 'components/Base'

import Banner from 'components/Cards/Banner'

import styles from './index.scss'

@withList({
  store: new VolumeStore(),
  module: 'volumes',
  name: 'Volume',
  authKey: 'volumes',
})
export default class Volumes extends React.Component {
  get itemActions() {
    const { trigger } = this.props

    return [
      {
        key: 'edit',
        icon: 'pen',
        text: t('Edit'),
        action: 'edit',
        onClick: item =>
          trigger('resource.baseinfo.edit', {
            detail: item,
          }),
      },
      {
        key: 'editYaml',
        icon: 'pen',
        text: t('Edit YAML'),
        action: 'edit',
        onClick: item =>
          trigger('resource.yaml.edit', {
            detail: item,
          }),
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('Delete'),
        action: 'delete',
        onClick: item =>
          trigger('resource.delete', {
            type: t(this.name),
            detail: item,
          }),
      },
    ]
  }

  getItemDesc = record => {
    const status = getVolumeStatus(record)
    const desc = !isEmpty(status) ? (
      <StatusReason reason={status} data={record} type={'volume'} />
    ) : (
      record.storageClassName || '-'
    )

    return desc
  }

  getColumns() {
    const { getSortOrder, module } = this.props
    const { cluster } = this.props.match.params

    return [
      {
        title: t('Name'),
        dataIndex: 'name',
        sortOrder: getSortOrder('name'),
        search: true,
        sorter: true,
        render: (name, record) => (
          <Avatar
            icon={'storage'}
            iconSize={40}
            to={`/clusters/${cluster}/namespaces/${
              record.namespace
            }/${module}/${name}`}
            desc={this.getItemDesc(record)}
            title={getDisplayName(record)}
          />
        ),
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        isHideable: true,
        search: true,
        width: '14%',
        render: ({ phase }) => (
          <Status
            type={phase}
            className={styles.status}
            name={t(`VOLUME_STATUS_${phase.toUpperCase()}`)}
          />
        ),
      },
      {
        title: t('Access Mode'),
        dataIndex: 'capacity',
        isHideable: true,
        width: '16%',
        render: (capacity, { accessMode }) => (
          <div className={styles.capacity}>
            <p>{accessMode}</p>
          </div>
        ),
      },
      {
        title: t('Mount'),
        dataIndex: 'inUse',
        isHideable: true,
        width: '14%',
        render: inUse => (inUse ? t('Mounted') : t('Not Mounted')),
      },
      {
        title: t('Created Time'),
        dataIndex: 'createTime',
        sorter: true,
        sortOrder: getSortOrder('createTime'),
        isHideable: true,
        width: 150,
        render: time => getLocalTime(time).format('YYYY-MM-DD HH:mm'),
      },
    ]
  }

  showCreate = () => {
    const { store, match, module } = this.props

    return this.props.trigger('volume.create', {
      store,
      module,
      cluster: match.params.cluster,
    })
  }

  render() {
    const { query, bannerProps, tableProps } = this.props
    return (
      <ListPage {...this.props}>
        <Banner {...bannerProps} tabs={this.tabs} />
        <ResourceTable
          {...tableProps}
          itemActions={this.itemActions}
          namespace={query.namespace}
          columns={this.getColumns()}
          onCreate={this.showCreate}
        />
      </ListPage>
    )
  }
}