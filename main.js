const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>` //預設蓋牌並設data-set抓index
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')//map()迭代陣列放進getCardElement函式裡 > 產出陣列
    //join()合併陣列成字串 > 產出字串

  },
  flipCards(...cards) { //若不確定參數數量用...可放陣列也可放個別值
    cards.map(card => { //若為陣列用map迭代個別值
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}


const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}



const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  //依照不同遊戲狀態，做不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) { //第一張開牌則不執行
      return
    }
    switch (this.currentState) { //呼叫鄰居函式用this
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card) //開牌
        model.revealedCards.push(card) //放進暫存陣列
        this.currentState = GAME_STATE.SecondCardAwaits //更改狀態
        break //break是小動作停，但函式會推進到結束
      case GAME_STATE.SecondCardAwaits: //狀態已開一張牌
        view.renderTriedTimes(++model.triedTimes) //嘗試次數加一（先加一再賦值）
        view.flipCards(card) //再開一張
        model.revealedCards.push(card) //再放一張牌
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10) //分數加上去
          this.currentState = GAME_STATE.CardsMatched //狀態更新
          view.pairCards(...model.revealedCards)//卡片改灰底
          model.revealedCards = [] //清空暫存陣列
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 出現遊戲結束div
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits//狀態更新回到起始狀態
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed //狀態更新
          view.appendWrongAnimation(...model.revealedCards) //加上動畫
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}



const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys()) //產出連續數字陣列
    for (let index = number.length - 1; index > 0; index--) { //用for從最底部的排往回洗
      let randomIndex = Math.floor(Math.random() * (index + 1)) //產出隨機一張牌
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]] //最底部的卡牌開始，將它抽出來與前面的隨機一張牌交換
    }
    return number
  }
}

controller.generateCards()


//監聽：綁每張卡片可監聽點擊開牌事件
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})