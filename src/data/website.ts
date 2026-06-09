type WebSite = {
    site_name: string
    site_description: string
    logo_url?: string
    site_url?: string
    github_url?: string
    tips?: string
    tags: string[]
    read_experience?: string
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
    {
        site_name: 'Hello 算法',
        site_description: '动画图解、一键运行的数据结构与算法教程',
        logo_url: 'https://www.hello-algo.com/assets/images/favicon.png',
        site_url: 'https://www.hello-algo.com/',
        github_url: 'https://github.com/krahets/hello-algo',
        // tips: '建议看Github仓库，在线链接查看全文需要微信公众号扫码',
        tags: ['计算机科学', '算法', '数据结构'],
        read_experience: '图示很多，阅读起来比较轻松，整体阅读氛围轻松',
    },
    {
        site_name: '科技爱好者周刊',
        site_description: '这里记录每周值得分享的科技内容，周五发布。',
        logo_url: 'https://www.ruanyifeng.com/blog/images/person2_s.jpg',
        site_url: 'https://www.ruanyifeng.com/blog/archives.html',
        // github_url: 'https://github.com/krahets/hello-algo',
        // tips: '建议看Github仓库，在线链接查看全文需要微信公众号扫码',
        tags: ['杂志', '科技周边'],
        read_experience: '',
    },
]

export { WEB_SITE_LIST }
