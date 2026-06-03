type WebSite = {
  site_name: string
  site_description: string
  logo_url?: string
  site_url?: string
  github_url?: string
  tips?: string
  tags: string[]
  read_experience: string
}

const WEB_SITE_LIST: WebSite[] = [
  {
    site_name: '小林 Coding',
    site_description:
      '图解计算机网络、操作系统、MySQL、Redis，覆盖后端技术面试，让天下没有难懂的八股文！',
    logo_url: 'https://cdn.xiaolincoding.com/logo.png',
    site_url: 'https://xiaolincoding.com/',
    github_url: 'https://github.com/xiaolincoder/CS-Base',
    tips: '建议看Github仓库，在线链接查看全文需要微信公众号扫码',
    tags: ['后端', '运维', '面试'],
    read_experience: '图示很多，阅读起来比较轻松，整体阅读氛围轻松',
  },
]

export { WEB_SITE_LIST }
