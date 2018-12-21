import { favorite, search, show, listMembersCreateAll, lists, listShow } from './twitter'

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

global.showLists = () => {
  Logger.log(
    lists('yabaiwebyasan').map(list => {
      const { name, id_str: idStr } = list
      return {
        id: idStr,
        name
      }
    })
  )
}

global.autoFollowersList = () => {
  // あるインフルエンサーのフォロワーを一気にリストに突っ込む

  // 対象のリストに重複ユーザーがいないかを確認する
  // => 情報感度の高い人たち
  // @poly_soft => 4877
  // @cohki0305 => 7237
  // @hikarine3 => 6013
  // @never_be_a_pm => 21500
  // @prog_8 => 18200
  // @yuki_99_s => 21200
  // 79027 => リストが15くらい必要www
  // 5000で分割する
}

global.autoHashTagList = () => {
  function removeDuplicatesSafe(arr) {
    const seen = {}
    const retArr = []
    for (let i = 0; i < arr.length; i += 1) {
      if (!(arr[i] in seen)) {
        retArr.push(arr[i])
        seen[arr[i]] = true
      }
    }
    return retArr
  }

  const data = [
    {
      listId: '1073020721293516801',
      tags: ['#駆け出しエンジニアと繋がりたい']
    },
    {
      listId: '1073034480187670528',
      tags: ['#Dotinstall', '#ドットインストール']
    },
    {
      listId: '1073034377947271168',
      tags: ['#Progate']
    },
    {
      listId: '1073034228093280257',
      tags: ['#Qiita']
    },
    {
      listId: '1073372507657330688',
      tags: ['#テックキャンプ']
    },
    {
      listId: '1073372604461854720',
      tags: ['#Railsチュートリアル']
    },
    {
      listId: '1074967929324621826',
      tags: ['#ウェブカツ']
    },
    {
      listId: '1075389735751667717',
      tags: ['#100DaysOfCode']
    }
  ]
  data.forEach(d => {
    const { listId, tags } = d
    const list = listShow(listId)
    if (list.member_count < 5000) {
      tags.forEach(tag => {
        const { statuses: tweets } = search(tag)
        const users = tweets.map(tweet => tweet.user.screen_name)
        Utilities.sleep(getRandomInt(1000, 2000))
        listMembersCreateAll(listId, removeDuplicatesSafe(users))
      })
    }
  })
}

global.autoLike = () => {
  const ids = []
  const keywords = [
    '#ウェブカツ',
    '#テックキャンプ',
    '#Progate',
    '#駆け出しエンジニアと繋がりたい',
    '#ドットインストール',
    '#Dotinstall',
    '#Qiita',
    '#Railsチュートリアル',
    '#100DaysOfCode'
  ]
  const validate = (idStr, status) =>
    ids.filter(e => e === idStr).length === 0 &&
    status.favorited === false &&
    !status.text.match(/エッチ|エロ/)

  keywords.forEach(keyword => {
    const { statuses: tweets } = search(keyword)
    tweets.forEach(tweet => {
      // 1000/24 hour ref: https://developer.twitter.com/en/docs/basics/rate-limits.html
      if (ids.length > 40) {
        return
      }
      const diff = Math.abs(new Date() - new Date(tweet.created_at))
      const minutes = Math.floor(diff / 1000 / 60)
      if (minutes < 60) {
        const { id_str: idStr } = tweet
        // search result tweet.favorited is not correct somthimes, so fetch it again
        const status = show(idStr)
        if (validate(idStr, status)) {
          favorite(idStr)
          Utilities.sleep(getRandomInt(1000, 2000))
          ids.push(idStr)
        }
      }
    })
  })
}
