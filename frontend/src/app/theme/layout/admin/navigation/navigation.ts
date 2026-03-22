import { Injectable } from '@angular/core'

export interface NavigationItem {
  id: string
  title: string
  type: 'item' | 'collapse' | 'group'
  translate?: string
  icon?: string
  hidden?: boolean
  url?: string
  classes?: string
  exactMatch?: boolean
  external?: boolean
  target?: boolean
  breadcrumbs?: boolean
  function?: any
  children?: Navigation[]
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[]
}

const NavigationItems = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard/home',
        icon: 'feather icon-home',
        classes: 'nav-item'
      },
      {
        id: 'todos',
        title: 'Todo',
        type: 'item',
        url: '/dashboard/todos',
        icon: 'feather icon-check-square',
        classes: 'nav-item'
      },
      {
        id: 'calendar',
        title: 'カレンダー',
        type: 'item',
        url: '/dashboard/calendar',
        icon: 'feather icon-calendar',
        classes: 'nav-item'
      },
      {
        id: 'archived',
        title: 'アーカイブ',
        type: 'item',
        url: '/dashboard/archived',
        icon: 'feather icon-archive',
        classes: 'nav-item'
      },
      {
        id: 'shared',
        title: '共有Todo',
        type: 'item',
        url: '/dashboard/shared',
        icon: 'feather icon-users',
        classes: 'nav-item'
      },
      {
        id: 'projects',
        title: 'プロジェクト',
        type: 'item',
        url: '/dashboard/projects',
        icon: 'feather icon-folder',
        classes: 'nav-item'
      },
      {
        id: 'templates',
        title: 'テンプレート',
        type: 'item',
        url: '/dashboard/templates',
        icon: 'feather icon-file-text',
        classes: 'nav-item'
      },
      {
        id: 'tags',
        title: 'タグ管理',
        type: 'item',
        url: '/dashboard/tags',
        icon: 'feather icon-tag',
        classes: 'nav-item'
      }
    ]
  },
]

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems
  }
}
