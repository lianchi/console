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
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { get } from 'lodash'

import { Loading } from '@pitrix/lego-ui'

import { getDisplayName, getLocalTime, parseUrl } from 'utils'
import { trigger } from 'utils/action'
import S2IBuilderStore from 'stores/s2i/builder'
import S2IRunStore from 'stores/s2i/run'
import ResourceStore from 'stores/workload/resource'

import DetailPage from 'projects/containers/Base/Detail'

import getRoutes from './routes'

@inject('rootStore')
@observer
@trigger
export default class ImageBuilderDetail extends React.Component {
  store = new S2IBuilderStore(this.module)

  resourceStore = new ResourceStore(this.module)

  s2iRunStore = new S2IRunStore()

  componentDidMount() {
    this.fetchData()
  }

  get module() {
    return 's2ibuilders'
  }

  get name() {
    return 's2ibuilders'
  }

  get routing() {
    return this.props.rootStore.routing
  }

  get params() {
    return this.props.match.params
  }

  get listUrl() {
    const { workspace, cluster, namespace } = this.props.match.params
    return `${
      workspace ? `/${workspace}` : ''
    }/clusters/${cluster}/projects/${namespace}/${this.module}`
  }

  fetchData = async params => {
    const builderResult = await this.store.fetchDetail(this.params, params)
    const runDetail = await this.s2iRunStore.fetchRunDetail({
      ...this.params,
      runName: get(builderResult, 'status.lastRunName', ''),
    })
    await this.s2iRunStore.fetchJobDetail({
      ...this.params,
      name: get(runDetail, '_originData.status.kubernetesJobName', ''),
    })
  }

  getOperations = () => [
    {
      key: 'reRun',
      text: t('Rerun'),
      action: 'edit',
      type: 'control',
      onClick: () =>
        this.trigger('imagebuilder.rerun', {
          detail: toJS(this.store.detail),
          success: this.fetchData,
        }),
    },
    {
      key: 'edit',
      icon: 'pen',
      text: t('Edit Info'),
      action: 'edit',
      onClick: () =>
        this.trigger('resource.baseinfo.edit', {
          type: t(this.name),
          detail: toJS(this.store.detail),
          success: this.fetchData,
        }),
    },
    {
      key: 'editYaml',
      icon: 'pen',
      text: t('Edit YAML'),
      action: 'edit',
      onClick: () =>
        this.trigger('resource.yaml.edit', {
          detail: this.store.detail,
          success: this.fetchData,
        }),
    },
    {
      key: 'delete',
      icon: 'trash',
      text: t('Delete'),
      action: 'delete',
      type: 'danger',
      onClick: () =>
        this.trigger('resource.delete', {
          type: t(this.name),
          detail: this.store.detail,
          success: () => this.routing.push(this.listUrl),
        }),
    },
  ]

  getAttrs = () => {
    const detail = toJS(this.store.detail)
    const { spec = {} } = detail
    const isBinaryURL = get(spec, 'config.isBinaryURL', '')
    const { binaryName } = this.s2iRunStore.runDetail
    const sourceUrl = get(spec, 'config.sourceUrl', '')
    const path = get(parseUrl(sourceUrl), 'pathname', `/${sourceUrl}`)
    const downLoadUrl = `${window.location.protocol}/${
      window.location.host
    }/b2i_download${path}`

    return [
      {
        name: t('Name'),
        value: detail.name,
      },
      {
        name: t('Project'),
        value: detail.namespace,
      },
      {
        name: t('type'),
        value: t(detail.type),
      },
      {
        name: t('BuilderImage'),
        value: get(spec, 'config.builderImage', '-'),
      },
      {
        name: t('imageName'),
        value: get(spec, 'config.imageName', '-'),
      },
      {
        name: t('BuilderPullPolicy'),
        value: get(spec, 'config.builderPullPolicy', '-'),
      },
      {
        name: t('SourceUrl'),
        value: isBinaryURL ? (
          <a href={downLoadUrl} download>
            {binaryName}
          </a>
        ) : (
          sourceUrl
        ),
      },
      {
        name: t('Created Time'),
        value: getLocalTime(detail.createTime).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        name: t('Creator'),
        value: detail.creator,
      },
    ]
  }

  render() {
    const stores = {
      detailStore: this.store,
      s2iRunStore: this.s2iRunStore,
      resourceStore: this.resourceStore,
    }

    if (this.store.isLoading) {
      return <Loading className="ks-page-loading" />
    }

    const sideProps = {
      module: this.module,
      name: getDisplayName(this.store.detail),
      desc: this.store.detail.description,
      operations: this.getOperations(),
      attrs: this.getAttrs(),
      breadcrumbs: [
        {
          label: t('Image Builders'),
          url: this.listUrl,
        },
      ],
    }

    return (
      <DetailPage
        stores={stores}
        {...sideProps}
        routes={getRoutes(this.props.match.path)}
      />
    )
  }
}
